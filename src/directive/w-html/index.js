import { getTemplateValue } from '../../parse' 

const whtml = (vnode,propkey,data,wue) => {

    console.log( 'w-html' )

    // if( !wue.init_render ){
    //     return vnode;
    // }

    // w-html 属于初次渲染范围

    let props = vnode.properties
    let modle = props.attributes[propkey];
    var ret = getTemplateValue(data,modle,modle)
    props.innerHTML = ret;
  
    return vnode;
}

export default whtml