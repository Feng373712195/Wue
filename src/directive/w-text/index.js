import { parseAst } from '../../parse' 

const wtext = (vnode,propkey,data,wue) => {

    if( !wue.init_render ){
        return vnode;
    }

    let props = vnode.properties;
    let modle = props.attributes[propkey];
    var ret = parseAst(modle,data)
    props.innerText = ret;

    return vnode;

}

export default wtext