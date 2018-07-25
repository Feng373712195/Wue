import isArray from '../isArray'
import isObject from '../isObject'

const deep = data => {
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

export default deep