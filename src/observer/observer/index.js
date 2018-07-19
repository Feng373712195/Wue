import { diff,patch } from '../../virtual-dom'
import { deep } from '../../uilt'
import renderVNode from '../../render-vnode'

const observer = (setdata,key,newval,wue) => {
    
    console.log('observer');

    setdata[key] = newval;

    var currentVnode = wue.norender_vnode.render( wue.old_data,wue )
    var updateVnode  = wue.norender_vnode.render( wue.data,wue )
    
    var patches = diff( currentVnode,updateVnode );
    patch( wue.el , patches );

    wue.old_data = deep( wue.original_data )
}

export default observer