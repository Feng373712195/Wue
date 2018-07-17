import { VNode } from '../../virtual-dom'

const createVNode = function(tagName,properties,children,data,wue,key){
    let vnode = new VNode(tagName,properties,children,key);  
    return vnode;
}

export default createVNode;