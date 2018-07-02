console.log('uitt');

const _toString = Object.prototype.toString;

function isUdf(val){
  return val === undefined || val === null;
}

function isDom(obj){
  if(typeof HTMLElement === 'object'){
    return obj instanceof HTMLElement;
  }else{
    return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
  }
}

function isNumber(val){
  return typeof val === 'number' && _toString.call(val) === '[object Number]' && isFinite(val)
}

function isString(val){
  return typeof val === 'string' && _toString.call(val) === '[object String]';
}

function isObject(val){
  return typeof val === 'object' && _toString.call(val) === '[object Object]';
}

function isFunction(fun){
  return typeof fun === 'function' && _toString.call(fun) === '[object Function]';
}

function isEmptyObject(obj){
  for(x in obj) return false;
  return true;
}

function isPlainObject(obj) {
  return Object.getPrototypeOf(obj) === Object.prototype
}

function isArray(obj){
   return ( [].isArray && [].isArray(obj) ) || _toString.call(obj) === '[object Array]'
}

function serialize(obj,fomat,option){

  const toHump = option.toHump || false;
  const toHypen = option.toHypen || false;

  let str = '';
  Object.keys(obj).forEach((k)=>{
      str += fomat ? fomat.replace(/(key)/, toHump? HyphenTrunHump(k) : toHypen? HumpTrunHyphen(k) : k ).replace(/value/,obj[k]) : '';
  })

  return str;
}

function isTrue(boolean){
  return (boolean === "true" || !!boolean === true) ? true : false
}

function isFalse(boolean){
  return (boolean === "false" || !!boolean === false) ? true : false
}

function HyphenTrunHump(str){

   return  str
   .split('-')
   .map( (v,i)=> { return i > 0 ? `${v[0].toUpperCase()}${v.substring(1, v.length)}` : v } )
   .join('')

}

function HumpTrunHyphen(str){

   return str
          .replace(/([A-Z])/g,(s)=>{
            return `-${ s.toLowerCase() }`
          })

}

module.exports  = {
    isUdf,
    isDom,
    isNumber,
    isString,
    isObject,
    isFunction,
    isEmptyObject,
    isPlainObject,
    isArray,
    isTrue,
    isFalse,
    serialize,
    HyphenTrunHump,
    HumpTrunHyphen
}