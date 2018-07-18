const won = (vnode,propkey,data,wue) => {

    if( !wue.init_render ){
        return vnode;
    }

    const props = vnode.properties;
    const EventType = propkey.replace(/^\@|^w-on:/,'');
    const EventHandle = props.attributes[propkey]

    let bindEl = wue.__isComponent?wue.prante.el:wue.el;

    vnode.create = function(doc){
        const EntrustOfElHandle = EntrustHandle.bind(bindEl,doc,parseWOn( EventHandle,wue.data,wue ),wue);
        if( !wue.init_render ){
            wue.__firstMount.push( bindEl => bindEl.addEventListener(EventType,EntrustOfElHandle) )
        }else{
            bindEl.addEventListener(EventType,EntrustOfElHandle)
        }
    };

    vnode.destroy = function(doc){
        bindEl.removeEventListener(EventType,EntrustHandle);
    };
    
    return vnode
}

export default won