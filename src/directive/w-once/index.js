const wonce = (vnode,propkey,data,wue) => {

    if( !wue.init_render ){
        return vnode;
    }
    
    vnode.nodiff = true;
    return vnode;
}

export default wonce