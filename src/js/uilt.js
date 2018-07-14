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

function isBoolean(bool){
  return typeof bool === 'boolean' && _toString.call(bool) === '[object Boolean]';
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

function isTrue(boolean){
  return (boolean === "true" || !!boolean === true) ? true : false
}

function isFalse(boolean){
  return (boolean === "false" || !!boolean === false) ? true : false
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

function attr(node,name,value){
  if( !isDom(node) ) console.error('node is not dom');
  if( name && value !== undefined ){
    value !== null ? node.setAttribute(name,value):
                     node.removeAttribute(name);
  }else if(name) return node.getAttribute(name);
}

function prop(node,name,value){
  if( !isDom(node) ) console.error('node is not dom');
  if( name && value !== undefined ){
    value !== null ? (node[name] = value):
                     (node[name] = null);
  }else if(name) return node[name];
}

function deep(data){
  let o ;
  if( isArray(data) ){
    o = [];
    data.forEach( (val,index) => {
      if( isArray(val) || isObject(val) ) o[index] = deep(val);
      else{ o[index] = val };
    })
  }
  if( isObject(data) ){
    o = {};
    for(var x in data){
      if( isArray(data[x]) || isObject(data[x]) ) o[x] = deep(data[x]);
      else{  o[x] = data[x] };
    }
  }

  return o;
}

module.exports  = {
    isUdf,
    isDom,
    isNumber,
    isString,
    isObject,
    isFunction,
    isBoolean,
    isEmptyObject,
    isPlainObject,
    isArray,
    isTrue,
    isFalse,
    serialize,
    HyphenTrunHump,
    HumpTrunHyphen,
    attr,
    prop,
    deep
}