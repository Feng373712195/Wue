import { parseAst } from '../../parse' 

const whtml = (vnode,propkey,data,wue) => {

    if( !wue.init_render ){
        return vnode;
    }

    let props = vnode.properties
    let modle = props.attributes[propkey];
    var ret = parseAst(modle,data)
    props.innerHTML = ret;
  
    return vnode;
}

export default whtml