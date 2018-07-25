import warns from '../warn'
import { isString,isDom,getElement } from '../uilt'

const initEl = function(el){
    
    /** mount element 缩写 */
    const me = isDom(el) ? el : isString(el) ?  document.querySelector(el) : false
    if( !me ) throw warns['no-find-el']

    this.el = me;
}

export default initEl