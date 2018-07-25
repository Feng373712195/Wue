import { isTrue,isFalse } from '../../uilt'
import { parseAst } from '../../parse'

const wif = (vnode,propkey,data,wue,wIfManager) => {

    if( !wue.init_render ){
        return vnode;
    }
    
    const { wIfcount,wIftodo } = wIfManager

    //统计wue 执行过多少次 w-if
    wIfManager.wIfcount++;

    //w-if 嵌套 w-if
    const props = vnode.properties;
    const condition = props.attributes[propkey];
    const parseCondition = parseAst(condition,data)                                                                  
    wIftodo.push( {} );
    const currtIftodo = wIftodo[wIfcount-1];
    currtIftodo.count = 1;
    currtIftodo.ifconditions = [ isFalse(parseCondition) ? false : isTrue(parseCondition) ];
    currtIftodo.renderNode = function(vnode){
        const idx = this.ifconditions.indexOf(true);
        let count = this.count;
        const rendernode = ( idx !== -1 && idx === (count-1) ) ? vnode : new VText('');
        
        ++this.count;
        return rendernode;
    } 

    return currtIftodo.renderNode.bind(currtIftodo,vnode)();
}

export default wif



