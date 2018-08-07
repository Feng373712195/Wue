import { findParentData,getTemplateValue,setTemplateValue } from '../../parse'
import { isEmptyObject,isBoolean,isArray,isNumber,prop } from '../../uilt'
import firstMount from '../../init/firstMount'

/** 获取表单类型 */
const  getInputType = (tagName,type)=>{
    const isTextInput = (tagName,type)=>{
        if( tagName === 'INPUT' &&  (!type || type === '')  ) return true;
        if( tagName === 'INPUT' && type === 'text' ) return true;
        if( tagName === 'TEXTEREA') return true;
    }
    const isCheckbox = (tagName,type)=>{
        if(tagName === 'INPUT' && type === 'checkbox') return true;
    }
    const isRadio = (tagName,type) =>{
        if(tagName === 'INPUT' && type === 'radio') return true;
    }
    const isSelect = (tagName,type) =>{
        if(tagName === 'SELECT') return true;
    }
    if( isTextInput(tagName,type) ) return 'text';
    if( isCheckbox(tagName,type) ) return 'checkbox';
    if( isRadio(tagName,type) ) return 'radio';
    if( isSelect(tagName,type) ) return 'select'
}

const wmodel = (vnode,propkey,data,wue,modelMap,wModelHandle) => {
    
    if( isEmptyObject(data) ){
        return vnode;
    }

    const modle = vnode.properties.attributes[propkey];
    const { tagName,properties:{ type }  } = vnode;

    const bindEl = wue.isComponent?wue.prante.el:wue.el;
    const { parent,lastKey } = findParentData(modle,data)
    const parentOriginal = parent.getOriginalObject;

    if( getInputType(tagName,type) === 'text' ){  

        const wModelTexts = modelMap.setWmodel('text',parentOriginal,lastKey)
        
        vnode.create = function(doc){
            wModelTexts.indexOf(doc) === -1 && wModelTexts.push( doc );

            const inputWModelHandle = wModelHandle.bind(doc,data,modle,wue,'text');
            doc.value = getTemplateValue(wue.data,modle,modle);
            if( !wue.init_render ){
                firstMount.push( bindEl => bindEl.addEventListener('input',inputWModelHandle,false) )
            }else{
                bindEl.addEventListener('input',inputWModelHandle,false)
            }
        };
    
        vnode.destroy = function(doc){
            /** 从 wue.wmodels 移除 */
            modelMap.delWmodel('text',doc,parentOriginal,lastKey)

            bindEl.removeEventListener('input',inputWModelHandle);
        };

    }

    if( getInputType(tagName,type) === 'checkbox' ){
            
        const wModelCheckboxs = modelMap.setWmodel('checkbox',parentOriginal,lastKey)

        vnode.create = function(doc){

            wModelCheckboxs.indexOf(doc) === -1 && wModelCheckboxs.push( doc );

            let wmodel = getTemplateValue(wue.data,modle,modle);
            const inputWModelHandle = wModelHandle.bind(doc,data,modle,wue,'checkbox')

            if( isBoolean(wmodel) ){
                const isChecked = Boolean( wmodel );
                prop(doc,'checked',isChecked ? true:null );
            }

            if( isArray(wmodel) ){
                const hasArr = (arr,val) => arr.indexOf( val ) !== -1 
                const checkboxVal = vnode.properties.value
                if( checkboxVal !== undefined ){
                    // indexOf是全等判断 v-model等于判断就可以 
                    const isChecked  =  isNumber(+checkboxVal) ? ( hasArr(wmodel,+checkboxVal) || hasArr(wmodel,checkboxVal) )  : hasArr(wmodel,checkboxVal ) ;
                    prop(doc,'checked',isChecked ? true:null );
                }
            }

            if( !wue.init_render ){
                firstMount.push( bindEl => bindEl.addEventListener('change',inputWModelHandle,false) )
            }else{
                bindEl.addEventListener('change',inputWModelHandle,false)
            }
        }

        vnode.destroy = function(doc){
            /** 从 wue.wmodels 移除 */
            modelMap.delWmodel('checkbox',doc,parentOriginal,lastKey)

            bindEl.removeEventListener('change',inputWModelHandle);
        }
    }

    if( getInputType(tagName,type) === 'radio' ){
        
        const wModelsRadios = modelMap.setWmodel('radio',parentOriginal,lastKey)
        
        vnode.create = function(doc){
            const inputWModelHandle = wModelHandle.bind(doc,data,modle,wue,'radio')

            let wmodel = getTemplateValue(wue.data,modle,modle);
            wModelsRadios.indexOf(doc) === -1 && wModelsRadios.push( doc );
            const radioVal = vnode.properties.value
            /** 这里不用全等判断 因为需要 1 == “1” */
            const isChecked = radioVal == wmodel;
            prop(doc,'checked',isChecked ? true:null );

            if( !wue.init_render ){
                firstMount.push( bindEl => bindEl.addEventListener('change',inputWModelHandle,false) )
            }else{
                bindEl.addEventListener('change',inputWModelHandle,false)
            }
        }

        vnode.destroy = function(doc){
            /** 从 wue.wmodels 移除 */
            modelMap.delWmodel('radio',doc,parentOriginal,lastKey)

            bindEl.removeEventListener('change',inputWModelHandle);
       }
    }

    if( getInputType(tagName,type) === 'select' ){

        const wModelsSelects = modelMap.setWmodel('select',parentOriginal,lastKey)

        vnode.create = function(doc){
            
            const selectWModelHandle = wModelHandle.bind(doc,data,modle,wue,'select')

            wModelsSelects.indexOf(doc) === -1 && wModelsSelects.push( doc );
            /** 等待options渲染完 */
            let wmodel = getTemplateValue(wue.data,modle,modle);
            setTimeout(()=>{
                [...doc.options].forEach(option=>{
                    let isSelected;
                    //是否多选 select
                    const isMultiple = prop(doc,'multiple');
                    if(isMultiple){
                        isSelected = wmodel.findIndex(val => val == option.text) !== -1 ? true : false;    
                    }else{
                        isSelected = option.text == wmodel;
                    }
                    prop(option,'selected',isSelected ? true : null)
                })
            })

            if( !wue.init_render ){
                firstMount.push( bindEl => bindEl.addEventListener('change',selectWModelHandle,false) )
            }else{
                bindEl.addEventListener('change',selectWModelHandle,false)
            }
        }

        vnode.destroy = function(doc){
            /** 从 wue.wmodels 移除 */
            modelMap.delWmodel('select',doc,parentOriginal,lastKey)

            bindEl.removeEventListener('change',selectWModelHandle);
        }
    }

    return vnode;

}

export default wmodel