import { isEmptyObject } from '../../uilt'

const welse = (vnode,propkey,data,wue,wIfManager) => {

    if( isEmptyObject(data) ){
        return vnode;
    }

    const { wIfcount,wIftodo } = wIfManager

    const currtIftodo = wIftodo[wIfcount-1];
    currtIftodo.ifconditions.push(true);
  
    return currtIftodo.renderNode.bind(currtIftodo,vnode)();
}

export default welse