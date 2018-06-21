/** 常用方法 */
const { isObject,isArray,isEmptyObject } = require('./uilt');
const { parseAst } = require('./parse');

/** 寻找要渲染的模板模型 */ 
export default function(text,data,isprint){

  const tlpReg = /\{\{(.*?)\}\}/;

  let tmpval;
  let match = '';

  if( text.trim() != '' && !isEmptyObject(data) ){
    while( match = tlpReg.exec(text) ){
        tmpval = parseAst( match[1],data,isprint );
        text =  text.replace( match[0] , ( isArray(tmpval) || isObject(tmpval) ) ? JSON.stringify(tmpval) : tmpval )
    } 
  }
  
  return text; 

}