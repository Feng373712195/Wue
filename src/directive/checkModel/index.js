
  
import wmodelsMap  from '../modelsMap'
import { isBoolean,isNumber,isArray,prop } from '../../uilt'

const checkModel = ( obj,key,newValue ) =>{
    wmodelsMap.getWmodel('text').has(obj) && wmodelsMap.getWmodel.get(obj).get(key).forEach(input =>{
        if( input.value != newValue ) input.value = newValue
    })

    wmodelsMap.getWmodel('checkbox').has(obj) && wmodelsMap.getWmodel('checkbox').get(obj).get(key).forEach(input =>{
        if( isBoolean(newValue) ){
            prop(input,'checked',newValue ? true:null );
        }
        if( isArray(newValue) ){
            const hasArr = (arr,val) => arr.indexOf( val ) !== -1
            const isChecked  =  isNumber(+newValue) ? ( hasArr(newValue,+input.value) || hasArr(newValue,input.value) ) : hasArr(newValue,input.value) ;
            prop(input,'checked',isChecked ? true:null );
        }
    })

    wmodelsMap.getWmodel('radio').has(obj) && wmodelsMap.getWmodel('radio').get(obj).get(key).forEach(input =>{
        /** 这里不用全等判断 因为需要 1 == “1” */
        const isChecked = input.value == newValue;
        prop(input,'checked',isChecked ? true:null );
    })
    
    wmodelsMap.getWmodel('select').has(obj) && wmodelsMap.getWmodel('select').get(data).get(key).forEach(select =>{
        [...select.options].forEach(option=>{
            const isSelected = option.text == newValue;
            prop(option,'selected',isSelected ? true:null)
        })
    })
}

export default checkModel