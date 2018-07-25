import { diff,patch,create } from '../../virtual-dom'
import { deep } from '../../uilt'
import renderVNode from '../../render-vnode'

const observer = (setdata,key,newval,wue) => {
    
    console.log('observer');

    console.log( setdata )
    console.log( key )
    console.log( newval )
    
    console.log( wue )

    setdata[key] = newval;

    var currentVnode = new renderVNode( create( wue.norender_vnode ) ).render( wue.old_data,wue )
    var updateVnode  = new renderVNode( create( wue.norender_vnode ) ).render( wue.data,wue )
    
    var patches = diff( currentVnode,updateVnode );
    patch( wue.el , patches );

    wue.old_data = deep( wue.original_data )
}

export default observer