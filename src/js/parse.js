const acorn = require('acorn');
const escodegen = require('escodegen');

/** 常用方法 */
const {  isUdf,
         isObject,
         isEmptyObject,
         isPlainObject,
         isTrue,
         isArray } = require('./uilt');

/**
 * @param Object data wue 监听的 data
 * @param String key  替换的模板
 * @param String tmp  data找不到模板数据 返回默认值为 tmp参数
 * @return [Any]
 */

function getTemplateValue(data,key,tmp){

    const keys = key.split('.');
    /* wue.data中找不到的属性 则应报错 不该返回false  */
  
    if( keys.length === 1 ){

      let getDataValue = new Function( 'd',`return d.${key}` );
      
      /*escodegen.generate 需要把Object进行toString操作 */
      if( isObject( data[key] ) ){
        Object.defineProperty(data[key],'toString',{
          get:function(v){
            return function(){
                      return JSON.stringify(data[key])
                   }
          },
          enumerable : false,
          configurable : true
        });
      } 

      /* 判断data是否为false值 */
      return isUdf( data[key] ) ? tmp : data[key];
      /*如果为false值 返回第三个参数 */

    }else{
      
      data = data[keys[0]];
      keys.shift();
      return getTemplateValue( isObject(data[keys[0]]) ? data[keys[0]] : data , keys.join('') )
    }
}

function setTemplateValue(data,key,value){

    const keys = key.split('.');
  
    if( keys.length === 1 ){
      /** 2017.7.8 'd',`d.${key} = "${value}"` 去除了双引号 以保证能返回布尔值 */
      // 这种如果是 Object 和 Array 类型返回 自定义的拦截属性就会没有
      let setDataValue = new Function( 'wueData',`wueData.${key} = ${value};` );    
      setDataValue( data );

    }else{
      data = data[keys[0]];
      keys.shift();
      setTemplateValue( isObject(data[keys[0]]) ? data[keys[0]] : data , keys.join('') )
    }
  
}

/** 
 * AST_PARSE_TYPE_TABLE
 * Literal 文字  Identifier 识标符  
 * ArrayExpression  数组表达式
 * ObjectExpression 对象表达式
 * MemberExpression 成员表达式
 * UnaryExpression  一元表达式
 * BinaryExpression 二元表达式
 * ExpressionStatement 三元表达式
 * CallExpression 调用表达式
 * AssignmentExpression 赋值表达式
 * SequenceExpression 序列表达式 如'A,B,C'
 **/

function findIdentifier(node,data){

    // console.log(node);

    // 若找到未初始化变量 应该抛出错误 warn模块
    const isNode = (o)=> (o && o.constructor) === acorn.Node;

    const checkType = (node,type,cb) => { if( node.type === type ) cb };

    ( (isObject(node) && Object.keys(node)) || (isArray(node) && node) || [node] ).forEach( k =>{

          if(isNode(node[k])){

              if( node[k].hasOwnProperty('type') && node[k].type === 'Identifier' ){

                  // console.log('Identifier');

                  const curt = node[k];
                  if( !Object.assign({},data).hasOwnProperty(curt.name) ){
                    throw  Error(`wue.data can't find the property ${curt.name}`);
                    return false;
                  }

                  curt.value = getTemplateValue(data,curt.name,false);
                  curt.type  = 'Literal'
                  delete curt.name;
                  findIdentifier(node[k],data) 

              }else if( node[k].hasOwnProperty('type') && node[k].type === 'MemberExpression' ){

                  // console.log('MemberExpression');

                  const parseMemberExpressionAst = (ast,data,propstr,props)=>{  

                      let { property,computed,object } = ast;
                      
                      if( computed && property.type === 'Identifier' ){
                          property.value = getTemplateValue(data,property.name,null);
                          property.type  = 'Literal'
                          delete property.name; 
                      }

                      if( ast.hasOwnProperty('object') ){

                        const prop = (computed ? `${ property[ property.tyep === "Literal" ? "name":"value" ] }` : `${property.name}`);
                        props.push(prop);
                        return parseMemberExpressionAst(ast.object,data,(computed ? `['${ property[ property.tyep === "Literal" ? "name":"value" ] }']` : `.${property.name}`),props) + propstr;
                      
                      }else{

                        props.push(ast.name);
                        return ast.name + propstr;
                      
                      }

                  } 

                  const checkHasOwnProperty = (props,data,propstr = 'wue.data') =>{

                    if( !isObject(data) ){
                      return false;
                    }

                    /*继承Object的prototype 主要为了得到hasOwnProperty方法*/
                    data = Object.assign({},data);

                    if( data.hasOwnProperty(props[0]) ){
                      const key = props.shift();
                      props.length > 0 && checkHasOwnProperty( props,data[key], `${propstr}.${key}` )
                    }else{
                      throw new Error(`${propstr} can't find the property ${ props.shift() }`);
                      return false;
                    }

                  }

                  const props = [];
                  const propstr = parseMemberExpressionAst(node[k],data,'',props);

                  /*检查data是否拥有属性*/
                  checkHasOwnProperty(props.reverse(),data)

                  delete node[k].computed;
                  delete node[k].property;
                  delete node[k].object;
                  node[k].type = 'Literal'
                  node[k].value = new Function('data',`return data.${ propstr }`)(data);

              }else if( node[k].hasOwnProperty('type') && node[k].type === 'CallExpression' ){

                // console.log('CallExpression');
                findIdentifier(node[k].arguments,data);
                const prop = node[k].callee.property;
                delete node[k].callee.property
                node[k].callee && findIdentifier(node[k].callee,data)
                node[k].callee.property = prop;

              }else if( node[k].hasOwnProperty('type') && node[k].type === 'ArrayExpression' ){

                /*array 中的 object 对象于 array对象 与对象表达式 与函数调用表达式的处理*/

                // console.log('ArrayExpression');

                const curt = node[k];
                curt.value = [...curt.elements].map(node=>{ 
                  if(node.hasOwnProperty('type') && node.type === 'Literal'){ 
                  
                    return node.value
                  
                  }else{

                    var nodeobj = {node:node}
                    findIdentifier(nodeobj,data);
                    return nodeobj.value;
                  
                  }
                });

              }else if( node[k].hasOwnProperty('type') && node[k].type === 'ObjectExpression' ){

                 /*object 中的 object 对象于 array对象 与对象表达式 与函数调用表达式的处理*/

                console.log('ObjectExpression');

                let o = {};

                node[k].properties.forEach(node=>{
                  
                  let k = node.key.name || node.key.value;
                  let v = node.value;
                  let value = node.value;
                  let nodeobj = {node:v};

                  if(v.hasOwnProperty('type') && v.type === 'Literal'){ 

                    o[k] = v.value;
                  
                  /* 2018-5-16 加入新判断类型  v.type === 'Identifier' 为了解决 { a:Identifier }  */
                  }else if(v.hasOwnProperty('type') && ( v.type === 'ObjectExpression' || v.type === 'MemberExpression' || v.type === 'CallExpression' || v.type === 'ArrayExpression' || v.type === 'Identifier' ) ){ 
                    
                    findIdentifier(nodeobj,data);
                    o[k] = nodeobj.value || nodeobj.node.value;
                  
                  }

                })

                node.value = o;

              }else{

                findIdentifier(node[k],data);
              
              }
 
          }
    
    });

}

function parseAst(expression,data,isprint){

  // console.log('parseAst');
  // console.log(expression);

  /* 如果不用括号把表达式括起来 传入{ } 会把语法错误 */
  const ast = acorn.parse( `( ${expression})` );
  try{
    findIdentifier(ast.body[0],data);
  }catch(e){
    isprint && console.error(e);
    //找不到模板 返回空字符串 不再继续往下执行
    return '';
  }
  
  const parse = escodegen.generate(ast);
  const ret = new Function(`return ${parse}`)();
  return ret;

}

function parseWforAst(expression,data){

  // console.log('parseWforAst');

  const expressionClass = ['ArrayExpression','ObjectExpression','Literal','Identifier','MemberExpression'];

  try{
    var ast = acorn.parse( expression ).body[0];
  }catch(e){
    throw  Error(`w-for Syntax error < ${expression} >`);
  }
  
  if( ast.hasOwnProperty('expression') && ast.expression.operator === 'in' && ast.expression.hasOwnProperty('left') && ast.expression.hasOwnProperty('right') ){

    const { left,right } = ast.expression;
    if( expressionClass.indexOf(right.type) == -1 ){
      throw  Error(`w-for Non support type`);
    }

    let ret = {};

    if( left.type === 'SequenceExpression' ){
      left.expressions[0] && (ret['value'] = left.expressions[0].name);
      left.expressions[1] && (ret['key'] = left.expressions[1].name);
      left.expressions[2] && (ret['index'] = left.expressions[2].name);
    }else if( left.type === 'Identifier' ){
      ret['value'] = left.name;
    }

    const nodeobj = {node:right};
    findIdentifier(nodeobj,data)
    ret.data = nodeobj.node.value || nodeobj.value ;
    ret.expression = expression.replace(/(?<=\s+in\s+)(.*)/,`${JSON.stringify(ret.data)}`)
    
    return ret;

  }else{
    throw  Error(`w-for Syntax error < ${expression} >`);
  }

}

/** parseWon 需要传入wue 因为需要拿到wue.methods */
function parseWOn(expression,data,wue){

  let handles = [];
  /** 去最末尾冒号 否则Ast解析会报语法错误 */
  const parse = acorn.parse(`(${expression.replace(/;$/,'')})`);
  let parseBody = parse.body[0];

  if( parseBody.type === 'ExpressionStatement' ){
    if( parseBody.expression.type === 'Identifier' ){
      console.log('I m Identifier');
      const { name } = parseBody.expression;
      if( wue.methods[name] ){
        handles.push( wue.methods[name].bind(wue) );
        return handles;
      }else{
        /** 先随便报个错 -。- */
        throw new Error( `wue.methods not method is ${name}` )
      }
    }
    if( parseBody.expression.type === 'CallExpression' ){
      console.log('I m CallExpression');
      let { arguments,callee:{ name } } = parseBody.expression;
      if( wue.methods[name] ){
        arguments = arguments.map( node => {
          if(node.type === 'Literal') return node.value;
          else return parseAst( escodegen.generate(node),data );
        });
        handles.push( ()=> wue.methods[name].apply(wue,arguments) );
        return handles;
      }
    }
    if( parseBody.expression.type === 'UpdateExpression' ){
      console.log('I m UpdateExpression');
       let { prefix,operator,argument:{ name } } = parseBody.expression;
       let val = parseAst(name,data);
       let handle = new Function(`var tml = ${val}; ${ prefix ? `${operator}tml` : `tml${operator}` }; return tml;`);
       handles.push( setTemplateValue.bind(null,data,name,handle()) );
    }
    if( parseBody.expression.type === 'BinaryExpression' ){
       console.log('I m binaryExpression');
       /** 二元表达式其实也没什么卵用 -。- 不会改变模板的数据啥的 */
       handles.push( parseAst( expression,data ) );
    }
    if( parseBody.expression.type === 'AssignmentExpression' ){
      console.log('I m AssignmentExpression')
      // console.log( 'expression is AssignmentExpression' );
      let { left:{ name },operator,right } = parseBody.expression;
      console.log( `var tml = "${parseAst(name,data)}"; tml${operator}"${ parseAst(escodegen.generate(right),data) }"; return tml;` )
      let handle = new Function(`var tml = "${parseAst(name,data)}"; tml${operator}"${ parseAst(escodegen.generate(right),data) }"; return tml;`)  
      handles.push( setTemplateValue.bind(null,data,name,handle()) );
    }
    if( parseBody.expression.type === 'ArrowFunctionExpression' || parseBody.expression.type === 'FunctionExpression' ){
      let functionBody = parseBody.expression.body;
      return  functionBody.type === 'BlockStatement'?
      (functionBody.body.length > 0 ? parseWOn( escodegen.generate(functionBody.body[0]),data ) : handles):
      parseWOn( escodegen.generate(functionBody),data ) ;
    }
    if( parseBody.expression.type === 'SequenceExpression' ){
      console.log('I m SequenceExpression');
      // console.log( parseBody )
      /* 如果在wue.methods未找到方法应该 抛出错误 */
      const methods = parseBody.expression.expressions;
      methods.forEach( node => handles = handles.concat(parseWOn(escodegen.generate(node),data,wue)) )
    }
  }

  return handles;
}

/**
 * ArrowFunctionExpression 箭头函数
 * FunctionExpression 普通函数
 * BlockStatement 块语句
 */

// const ast  = acorn.parse( " '我爱前端，嘎嘎嘎'.split('').reverse().join('') " );
// const ast2 = acorn.parse( "(method1,method2)" );
// const ast3 = acorn.parse( "(method(a,'b'))" );
// const ast4 = acorn.parse( "(method('a','b'),method('a'))" );
// const ast2 = acorn.parse('var a = 0; a = a++;');
// const parse = escodegen.generate(ast);
// console.log( parse )

// console.log(ast.body[0].expression)
// console.log(ast2.body[0].expression)
// console.log(ast3.body[0])
// console.log(ast4.body[0])
// |\((.*)\)\=\>\{(.*)\|\((.*)\)\=\>(.*)
// console.log( funStr2.replace(/\((.*)\)\=\>\{(.*)\}/,'$1 $2') )



module.exports = {
  getTemplateValue,
  setTemplateValue,
  parseAst,
  parseWforAst,
  parseWOn
}

