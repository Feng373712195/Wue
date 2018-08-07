
  
import wmodelsMap  from '../modelsMap'
import { isBoolean,isNumber,isArray,prop } from '../../uilt'

const checkModel = ( obj,key,newValue ) =>{

    if( wmodelsMap.getWmodel('text') ){
        let currentmodelMap =  wmodelsMap.getWmodel('text')
        currentmodelMap.has(obj) && currentmodelMap.get(obj).get(key).forEach(input =>{
            if( input.value != newValue ) input.value = newValue
        })
    }

    if( wmodelsMap.getWmodel('checkbox') ){
        let currentmodelMap =  wmodelsMap.getWmodel('checkbox')
        currentmodelMap.has(obj) && currentmodelMap.get(obj).get(key).forEach(input =>{
            if( isBoolean(newValue) ){
                prop(input,'checked',newValue ? true:null );
            }
            if( isArray(newValue) ){
                const hasArr = (arr,val) => arr.indexOf( val ) !== -1
                const isChecked  =  isNumber(+newValue) ? ( hasArr(newValue,+input.value) || hasArr(newValue,input.value) ) : hasArr(newValue,input.value) ;
                prop(input,'checked',isChecked ? true:null );
            }
        })
    }

    if( wmodelsMap.getWmodel('radio') ){
        let currentmodelMap =  wmodelsMap.getWmodel('radio')
        currentmodelMap.has(obj) && currentmodelMap.get(obj).get(key).forEach(input =>{
            /** 这里不用全等判断 因为需要 1 == “1” */
            const isChecked = input.value == newValue;
            prop(input,'checked',isChecked ? true:null );
        })
    }
    
    if( wmodelsMap.getWmodel('select') ){
        let currentmodelMap =  wmodelsMap.getWmodel('select')
        console.log( currentmodelMap.get(obj).get(key) )
        currentmodelMap.has(obj) && currentmodelMap.get(obj).get(key).forEach(select =>{
            [...select.options].forEach(option=>{
                let isSelected;
                //是否多选 select
                const isMultiple = prop(select,'multiple');
                if(isMultiple){
                    isSelected = newValue.findIndex(val => val == option.text) !== -1 ? true : false;
                }else{
                    isSelected = option.text === newValue;
                }
                prop(option,'selected',isSelected ? true:null)
            })
        })
    }
}

export default checkModel