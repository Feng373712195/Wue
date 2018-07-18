const welse = (vnode,propkey,data,wue,currtIftodo,wIfcount) => {

    if( !wue.init_render ){
        return vnode;
    }

    const currtIftodo = wIftodo[wIfcount-1];
    currtIftodo.ifconditions.push(true);
  
    return currtIftodo.renderNode.bind(currtIftodo,vnode)();
}

export default welse