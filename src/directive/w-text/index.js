import { getTemplateValue } from '../../parse' 

const wtext = (vnode,propkey,data,wue) => {

    // if( !wue.init_render ){
    //     return vnode;
    // }

    // w-text 属于初次渲染范围

    let props = vnode.properties;
    let modle = props.attributes[propkey];

    var ret = getTemplateValue(data,modle,modle)
    props.innerText = ret;
    return vnode;

}

export default wtext