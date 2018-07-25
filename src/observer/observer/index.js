import { diff,patch,create } from '../../virtual-dom'
import { deep } from '../../uilt'
import renderVNode from '../../render-vnode'

let time = null;

const observer = (setdata,key,newval,wue) => {

    setdata[key] = newval;

    if(time) return;

    console.log('observer');

    /** 放到事件循环末尾 执行 */
    time = setTimeout(()=>{
        // var currentVnode = new renderVNode( wue.norender_dom ).render( wue.old_data,wue )    
        var updateVnode  = new renderVNode( wue.norender_dom ).render( wue.data,wue )
        // const patches = diff( currentVnode,updateVnode );
        const patches = diff( wue.current_vnode, updateVnode )
        patch( wue.el , patches );
        // wue.old_data = deep( wue.original_data );
        wue.current_vnode = updateVnode
        time = null;
    },0)

}

export default observer