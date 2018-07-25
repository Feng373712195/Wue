const acorn = require('acorn')
import { isObject,isArray } from '../../uilt'
import getTemplateValue from '../getTemplateValue'

const findIdentifier = (node,data) => {

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

export default findIdentifier