const acorn = require('acorn')
import escodegen from 'escodegen'
import findIdentifier from '../findIdentifier'

function parseAst(expression,data,isprint){  
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

export default parseAst