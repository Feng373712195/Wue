
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

import ModelsMap from "./modelsMap"

/* [w-if w-else w-else-if] wedget数组 */
let wIftodo = [];

/* 调用w-if 次数 */
let wIfcount = 0;

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
            setTemplateValue(wue.data,modle,this.options[selectedIndex].text)
        }
    }
}

//委托事件
const entrustHandle = function(node,handles,wue,e){
    if(e.target === node){
        if(handles){
            handles.forEach( f => f() );
        }
    }
}

const modelMap = new ModelsMap();

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

    Object.keys(props.attributes).forEach(propkey=>{

        if( !(propkey === 'w-on' && isVText(vnode)) ){
            if( propkey.match(/^w-bind|^\:/) ) wueInDirective['w-bind'].apply(wue,[vnode,propkey,data,wue])
            else if( propkey.match(/^w-on:|^\@/) ) wueInDirective['w-on'].apply(wue,[vnode,propkey,data,wue])
            else if( propkey === 'w-model' ) wueInDirective[propkey].apply(wue,[vnode,propkey,data,wue])
            else if( propkey === 'w-if' || propkey === 'w-else' || propkey === 'w-else-if' ) wueInDirective[propkey].apply(wue,[vnode,propkey,data,wue,wIftodo,wIfcount])
            else wueInDirective[propkey].apply(wue,[vnode,propkey,data,wue])
        }

    })

}

export default handleWueInDirective