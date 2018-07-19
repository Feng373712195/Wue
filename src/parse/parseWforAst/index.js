const acorn = require('acorn')

const parseWforAst = (expression,data) => {

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

  export default parseWforAst