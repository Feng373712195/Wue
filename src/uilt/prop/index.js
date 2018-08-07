import isDom from '../isDom'

function prop(node,name,value){
    if( !isDom(node) ) console.error('node is not dom');
    if( name && value !== undefined ){
      value !== null ? (node[name] = value):
                       (node[name] = null);
    }else if(name) return node[name];
  }

  export default prop