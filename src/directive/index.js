
import wtext from '../directive/w-text'
import whtml from '../directive/w-html'
import wonce from '../directive/w-once'
import wbind from '../directive/w-bind'
import wshow from '../directive/w-show'
import won from '../directive/w-on'
import wif from '../directive/w-if'
import welse from '../directive/w-else'
import welseif from '../directive/w-else-if'
import wfor from '../directive/w-for'
import wmodel from '../directive/w-model'

import modelsMap from "./modelsMap"
import { getTemplateValue,setTemplateValue } from '../parse'
import { isBoolean,isArray,prop } from '../uilt'

// wif 管理对象 
const wIfManager = {
    /* [w-if w-else w-else-if] wedget数组 */
    wIftodo:[],
    /* 调用w-if 次数 */
    wIfcount:0
}

// wModel 委托事件方法 
const wModelHandle = function(data,modle,wue,InputType,e){
    if(e.target === this){

        if( InputType === 'text' ){
            setTemplateValue(wue.data,modle,this.value);
        }
        if( InputType === 'checkbox' ){
            let modleVal = getTemplateValue(wue.data,modle,modle);
            if( isBoolean( modleVal ) ){
                const isChecked = !Boolean( modleVal );
                setTemplateValue(wue.data,modle,isChecked);
            }
            if( isArray( modleVal ) ){
                const checkValIndex =  modleVal.indexOf( this.value );
                checkValIndex !== -1 ? modleVal.splice(checkValIndex,1) : modleVal.push( this.value )
                setTemplateValue(wue.data,modle,modleVal)
            }
        }
        if( InputType === 'radio' ){
            setTemplateValue(wue.data,modle,this.value)
        }
        if( InputType === 'select' ){
            const selectedIndex = this.options.selectedIndex;
            const isMultiple = prop(this,'multiple')
            if( isMultiple ){
                const selecteds = [...this.options].map(option => prop(option,'selected') && option.text ).filter(v => v);
                setTemplateValue(wue.data,modle,selecteds)
            }else{
                setTemplateValue(wue.data,modle,this.options[selectedIndex].text)
            }
        }
    }
}

// wOn 委托事件
const entrustHandle = function(node,handles,wue,e){
    if(e.target === node){
        if(handles){
            handles.forEach( f => f() );
        }
    }
}

/* wue指令管理者 */
const wueInDirective = { 
    'w-text':wtext,
    'w-html':whtml,
    'w-once':wonce,
    'w-bind':wbind,
    'w-show':wshow,
    'w-on':won,
    'w-if':wif,
    'w-else':welse,
    'w-else-if':welseif,
    'w-for':wfor,
    'w-model':wmodel
};

const handleWueInDirective = (vnode,data,wue) =>{

    const props = vnode.properties;
    Object.keys(props.attributes).forEach(propkey=>{
        if( !(propkey === 'w-on' && isVText(vnode)) ){
            if( propkey.match(/^w-bind|^\:/) ) vnode = wueInDirective['w-bind'].apply(wue,[vnode,propkey,data,wue])
            else if( propkey.match(/^w-on:|^\@/) ) vnode = wueInDirective['w-on'].apply(wue,[vnode,propkey,data,wue,entrustHandle])
            else if( propkey === 'w-model' ) vnode = wueInDirective[propkey].apply(wue,[vnode,propkey,data,wue,modelsMap,wModelHandle])
            else if( propkey === 'w-if' || propkey === 'w-else' || propkey === 'w-else-if' ) vnode = wueInDirective[propkey].apply(wue,[vnode,propkey,data,wue,wIfManager])
            else if( wueInDirective[propkey] ) vnode = wueInDirective[propkey].apply(wue,[vnode,propkey,data,wue])
        }
    })

    return vnode
}

export default handleWueInDirective