import { findParentData } from '../../parse'

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

const wmodel = (vnode,propkey,data,wue) => {
    
    if( !wue.init_render ){
        return vnode;
    }

    const modle = vnode.properties.attributes[propkey];
    const { tagName,properties:{ type }  } = vnode;

    const bindEl = wue.__isComponent?wue.prante.el:wue.el;
    
    const { parent,lastKey } = findParentData(modle,data)
    
    const parentOriginal = parent.getOriginalObject;

    if( getInputType(tagName,type) === 'text' ){  

        let wmodelsTextMap = wue.wmodels.text.has(parent) ?
                                 wue.wmodels.text.get(parent) : 
                                 wue.wmodels.text.set(parent,new Map()) && wue.wmodels.text.get(parent);

        const wModelTexts = wmodelsTextMap.has(lastKey) ? 
                            wmodelsTextMap.get(lastKey) :
                            wmodelsTextMap.set(lastKey,[]) && wmodelsTextMap.get(lastKey);
        
        vnode.create = function(doc){
            // !wue.wmodels.text.hasOwnProperty(modle) && (wue.wmodels.text[modle] = [])
            // wue.wmodels.text[modle].indexOf(doc) === -1 && wue.wmodels.text[modle].push( { dom:doc,parent:findParentData.parent } );
            // wmodelsTextMap.set(parent,{ input:doc,model:lastKey });
            wModelTexts.indexOf(doc) === -1 && wModelTexts.push( doc );

            const inputWModelHandle = wModelHandle.bind(doc,data,modle,wue,'text');
            doc.value = getTemplateValue(wue.data,modle,modle);
            
            if( !wue.init_render ){
                wue.__firstMount.push( bindEl => bindEl.addEventListener('input',inputWModelHandle,false) )
            }else{
                bindEl.addEventListener('input',inputWModelHandle,false)
            }
        };
    
        vnode.destroy = function(doc){
            /** 从 wue.wmodels 移除 */
            // wue.wmodels.text[modle].splice( wue.wmodels.text[modle].indexOf(doc) ,1);
            wModelTexts.splice( wModelTexts.indexOf(doc) ,1);
            wModelTexts.length === 0 && wModelTexts.delete();
            [...wmodelsTextMap].length === 0 && wmodelsTextMap.delete();

            bindEl.removeEventListener('input',inputWModelHandle);
        };

    }

    if( getInputType(tagName,type) === 'checkbox' ){
        
        let wmodelsCheckboxMap = wue.wmodels.checkbox.has(parent) ?
                                 wue.wmodels.checkbox.get(parent) : 
                                 wue.wmodels.checkbox.set(parent,new Map()) && wue.wmodels.checkbox.get(parent);
        
        const wModelCheckboxs = wmodelsCheckboxMap.has(lastKey) ? 
                                wmodelsCheckboxMap.get(lastKey) :
                                wmodelsCheckboxMap.set(lastKey,[]) && wmodelsCheckboxMap.get(lastKey);

        vnode.create = function(doc){

            // !wue.wmodels.checkbox.hasOwnProperty(modle) && (wue.wmodels.checkbox[modle] = [])
            // wue.wmodels.checkbox[modle].indexOf(doc) === -1 && wue.wmodels.checkbox[modle].push( doc );
            // wue.wmodels.checkbox.set(parent.getOriginalObject,{ input:doc,model:lastKey });
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
                wue.__firstMount.push( bindEl => bindEl.addEventListener('change',inputWModelHandle,false) )
            }else{
                bindEl.addEventListener('change',inputWModelHandle,false)
            }
        }

        vnode.destroy = function(doc){
             /** 从 wue.wmodels 移除 */
            wModelCheckboxs.splice( wModelCheckboxs.indexOf(doc) ,1);
            wModelCheckboxs.length === 0 && wModelCheckboxs.delete();
            [...wmodelsCheckboxMap].length === 0 && wmodelsCheckboxMap.delete();

            bindEl.removeEventListener('change',inputWModelHandle);
        }
    }

    if( getInputType(tagName,type) === 'radio' ){

        let wmodelsRadioMap = wue.wmodels.radio.has(parent) ?
                              wue.wmodels.radio.get(parent) : 
                              wue.wmodels.radio.set(parent,new Map()) && wue.wmodels.radio.get(parent);
        
        const wModelsRadios = wmodelsRadioMap.has(lastKey) ? 
                              wmodelsRadioMap.get(lastKey) :
                              wmodelsRadioMap.set(lastKey,[]) && wmodelsRadioMap.get(lastKey);
        
        vnode.create = function(doc){
            const inputWModelHandle = wModelHandle.bind(doc,data,modle,wue,'radio')

            let wmodel = getTemplateValue(wue.data,modle,modle);
            wModelsRadios.indexOf(doc) === -1 && wModelsRadios.push( doc );
            const radioVal = vnode.properties.value
            /** 这里不用全等判断 因为需要 1 == “1” */
            const isChecked = radioVal == wmodel;
            prop(doc,'checked',isChecked ? true:null );

            if( !wue.init_render ){
                wue.__firstMount.push( bindEl => bindEl.addEventListener('change',inputWModelHandle,false) )
            }else{
                bindEl.addEventListener('change',inputWModelHandle,false)
            }
        }

        vnode.destroy = function(doc){
            /** 从 wue.wmodels 移除 */
           wModelsRadios.splice( wModelsRadios.indexOf(doc) ,1);
           wModelsRadios.length === 0 && wModelsRadios.delete();
           [...wModelsRadios].length === 0 && wModelsRadios.delete();

           bindEl.removeEventListener('change',inputWModelHandle);
       }
    }

    if( getInputType(tagName,type) === 'select' ){
        
        let wmodelsSelectMap = wue.wmodels.select.has(parent) ?
                               wue.wmodels.select.get(parent) : 
                               wue.wmodels.select.set(parent,new Map()) && wue.wmodels.select.get(parent);

        const wModelsSelects = wmodelsSelectMap.has(lastKey) ? 
                               wmodelsSelectMap.get(lastKey) :
                               wmodelsSelectMap.set(lastKey,[]) && wmodelsSelectMap.get(lastKey);

        vnode.create = function(doc){
            const selectWModelHandle = wModelHandle.bind(doc,data,modle,wue,'select')

            wModelsSelects.indexOf(doc) === -1 && wModelsSelects.push( doc );
            /** 等待options渲染完 */
            let wmodel = getTemplateValue(wue.data,modle,modle);
            setTimeout(()=>{
                [...doc.options].forEach(option=>{
                    const isSelected = option.text === wmodel;
                    prop(option,'selected',isSelected ? true : null)
                })
            })

            if( !wue.init_render ){
                wue.__firstMount.push( bindEl => bindEl.addEventListener('change',selectWModelHandle,false) )
            }else{
                bindEl.addEventListener('change',selectWModelHandle,false)
            }
        }

        vnode.destroy = function(doc){
            /** 从 wue.wmodels 移除 */
           wModelsSelects.splice( wModelsSelects.indexOf(doc) ,1);
           wModelsSelects.length === 0 && wModelsSelects.delete();
           [...wModelsSelects].length === 0 && wModelsSelects.delete();

           bindEl.removeEventListener('change',selectWModelHandle);
        }
    }

    return vnode;

}

export default wmodel