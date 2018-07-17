import { isDom,isObject,isString,isFunction } from '../uilt'
import warns from '../warn'

const checkOption = (option) => {
    if( !option ) throw warns['no-options']
    if( !isObject(option) ) throw warns['options-not-object']

    if( !option.el ) throw warns['no-option-el']
    console.log( isDom(option.el) );
    console.log( isString(option.el) )
    if( !(isDom(option.el) || isString(option.el)) ) throw warns['option-el-errortype']

    if( !option.data ) throw warns['no-option-data']
    if( !(isObject(option.data) || isFunction(option.data)) ) throw warns['option-data-errortype'] 

}

export default checkOption