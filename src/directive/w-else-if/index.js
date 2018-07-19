import { isTrue,isFalse } from '../../uilt'
import { parseAst } from '../../parse'

const welseif = (vnode,propkey,data,wue,wIfManager) => {

    if( !wue.init_render ){
        return vnode;
    }
    
    const { wIfcount,wIftodo } = wIfManager

    const props = vnode.properties;
    const condition = props.attributes[propkey];
    const parseCondition = parseAst(condition,data)
  
    const currtIftodo = wIftodo[wIfcount-1];
    currtIftodo.ifconditions.push( isFalse(parseCondition) ? false : isTrue(parseCondition) );
  
    return currtIftodo.renderNode.bind(currtIftodo,vnode)();
}

export default welseif