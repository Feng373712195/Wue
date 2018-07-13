// const createElement  = require('virtual-dom/create-element'); 
// const { VNode,VText, } = require('virtual-dom');

import { isVText,isVNode,VNode,VText } from '../models/virtual-dom';

/** 查找模板数据模块 */
const findTmpText = require('./findTmpText').default;

/*
* directive 方法等写成构造模式 
* 每个组件需要拥有自己一个 directive函数 
*/
console.log( 'directive' );

/** 常用方法 */
const {  isUdf,
    isObject,
    isNumber,
    isString,
    isBoolean,
    isEmptyObject,
    isPlainObject,
    isArray,
    isTrue,
    isFalse,
    serialize,
    HyphenTrunHump,
    prop,
    getInputType } = require('./uilt');

/** Wue 解析模块 */
const { getTemplateValue,
        setTemplateValue,
        findParentData,
        parseAst,parseWforAst,parseWOn } = require('./parse.js')

/* CSSStyleDeclaration */
var styles = window.getComputedStyle(document.documentElement, '');

/* wue指令管理者 */
const wueInDirective = { };

/* [w-if w-else w-else-if] wedget数组 */
let wIftodo = [];

/* 调用w-if 次数 */
let wIfcount = 0;

/* wModel 的方法 始终只引用这么一个 因为需要removeEventLister */
var wModelHandle = function(data,modle,wue,InputType,e){

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

    /** 2018.7.2 交给 observer 去处理 */
    // this.value = getTemplateValue(wue.observerdata,modle,modle); 
}

//委托事件
function EntrustHandle (node,handles,wue,e){
    if(e.target === node){
        if(handles){
            handles.forEach( f => f() );
        }
    }
}

wueInDirective['w-show'] = (vnode,propkey,data,wue) => { 

  if(isEmptyObject(data)){
      return vnode;
  } 

  const props = vnode.properties;
  const ret = parseAst(props.attributes[propkey],data);

  var styles = props['style'] ? props['style'].split(/\;\s?/):[];
  var styleObj = {} 

  styles = styles
            .filter( v=>v )
            .map( v=> v ? styleObj[v.split(':')[0]] = `${v.split(':')[1]};`: '' ); 

    if(!!ret){
        !isEmptyObject(styleObj) && 
        ( styleObj['display'] && ( delete styleObj['display'] ) );
        props.hasOwnProperty('style') && (props['style'] = serialize( styleObj,'key:value' ) )
    }else{
        styleObj['display'] = 'none !important;';
        props['style'] = serialize( styleObj,'key:value' );
    }

    return vnode;

}

wueInDirective['w-html'] = (vnode,propkey,data,wue) => {
  
  if(isEmptyObject(data)){
        return vnode;
  }

  let props = vnode.properties
  let modle = props.attributes[propkey];
  // modle = getTemplateValue(data,modle,modle);
  var ret = parseAst(modle,data)
  props.innerHTML = ret;

  return vnode;

}

wueInDirective['w-text'] = (vnode,propkey,data,wue) => {

  if(isEmptyObject(data)){
      return vnode;
  }

  let props = vnode.properties;
  let modle = props.attributes[propkey];
  var ret = parseAst(modle,data)
  props.innerText = ret;

  return vnode;

}

wueInDirective['w-bind'] = (vnode,propkey,data,wue) => {

  if(isEmptyObject(data)){
      return vnode; 
  }

  const props = vnode.properties;
  const bindProp = propkey.replace(/^w-bind\:|^\:/,'');
  const modle = props.attributes[propkey];
  var ret = parseAst(modle,data);

  /** 
   *  我觉得 :class 与 :style 只能够传一层
   *  所以暂时不管嵌套的操作
   **/

  /* w-bind:class 的处理 */
  if( bindProp === 'class' || bindProp === 'CLASS' ){

      const strToClassObj = (str)=>{
        return (str || '').split(' ').filter( v => v );
      }


      /* class 重复的 应该重叠掉 */
      if(isArray(ret)){

        ret = [...new Set( [].concat(strToClassObj(props['className']),ret) )].join(' ')
      
      }else if(isObject(ret)){

        const p = [];
        Object.keys(ret).forEach(k=>{ !!ret[k] && p.push(k) });
        /*Set 数据结构 过滤掉重复的class*/
        ret = [...new Set( [].concat(strToClassObj(props['className']),p) )].join(' ')
      
      }else if(isString(ret)){

        ret = [...new Set( [].concat(strToClassObj(props['className']),strToClassObj(ret)) )].join(' ')
      
      }else{

        throw new Error(`w-bind:class nonsupport type "${ret}" `)

      }

  }

   /* w-bind:style 的处理 */
  if( bindProp === 'style' || bindProp === 'STYLE' ){

    const strToStyleObj = (str)=>{
      let styleObj = {};
      (str || '').split(';').filter( v => v )
      .map( s =>{
        let [ key,value ] = s.split(':');
        styleObj[HyphenTrunHump(key)] = value; 
      });
      return styleObj;
    }

    const domStyle = strToStyleObj(props['style']);   

    /* style 重复的 应该重叠掉 重叠的规则为CSS的就近原则 */
    if(isArray(ret)){
      
      //数组嵌套 数组
      //数组嵌套 对象 
      //数组嵌套 字符串

      ret = ret
            .map(v=>{ 
                if(isObject(v)){
                    /* 去除掉一些不存在的style 属性 */
                    Object.keys(v).forEach( k=> !styles[k] && delete v[k] );
                    return v
                }else{
                    return v;
                }
            })

      ret =  serialize( ret.reduce( v=> Object.assign(domStyle,v) ) ,'key:value; ',{ toHypen:true });

    }else if(isObject(ret)){

      //对象嵌套 数组 
      //数组嵌套 对象 
      //对象嵌套 字符串

      ret = Object.assign(domStyle,ret);
      
      /* 去除掉一些不存在的style 属性 */
      Object.keys(ret).forEach( k=> !styles[k] && delete ret[k] );
      /* 格式化 */
      ret = serialize(ret,'key:value; ',{ toHypen:true })

    }else{

      ret = `${props['style']} ${ret}`;
    
    }

  }

  props.attributes[bindProp] = ret

  return vnode;

}

wueInDirective['w-if'] = (vnode,propkey,data,wue) =>{

  if(isEmptyObject(data)){
      return vnode; 
  }

  //统计wue 执行过多少次 w-if
  wIfcount++;

  //w-if 嵌套 w-if
  const props = vnode.properties;
  const condition = props.attributes[propkey];
  const parseCondition = parseAst(condition,data)                                                                  
  wIftodo.push( {} );
  const currtIftodo = wIftodo[wIfcount-1];
  currtIftodo.count = 1;
  currtIftodo.ifconditions = [ isFalse(parseCondition) ? false : isTrue(parseCondition) ];
  currtIftodo.renderNode = function(vnode){
    const idx = this.ifconditions.indexOf(true);
    let count = this.count;
    const rendernode = ( idx !== -1 && idx === (count-1) ) ? vnode : new VText('');
    
    ++this.count;
    return rendernode;
  } 

  return currtIftodo.renderNode.bind(currtIftodo,vnode)();

}

wueInDirective['w-else'] = (vnode,propkey,data,wue) =>{

  if(isEmptyObject(data)){
      return vnode; 
  }

  const currtIftodo = wIftodo[wIfcount-1];
  currtIftodo.ifconditions.push(true);

  return currtIftodo.renderNode.bind(currtIftodo,vnode)();

}

wueInDirective['w-else-if'] = (vnode,propkey,data,wue) =>{

  if(isEmptyObject(data)){
      return vnode; 
  }

  const props = vnode.properties;
  const condition = props.attributes[propkey];
  const parseCondition = parseAst(condition,data)

  const currtIftodo = wIftodo[wIfcount-1];
  currtIftodo.ifconditions.push( isFalse(parseCondition) ? false : isTrue(parseCondition) );

  return currtIftodo.renderNode.bind(currtIftodo,vnode)();

}

wueInDirective['w-for'] = (vnode,propkey,data,wue) =>{

  if(isEmptyObject(data)){
      return vnode; 
  }

  console.log('w-for');
  
  // w-for 嵌套 w-for // 暂时解决
  // w-for 中的 w-bind
  // w-for 中有 w-model 双向数据绑定  
  // w-for 数据变动 w-for不会重新渲染 // 目前可以
  
  const props = vnode.properties;
  const condition = props.attributes[propkey];
  const ret = parseWforAst(condition,data);

  const vnodes = [];
  const nestForVnode = [];

  let d = ret.data,
      v = ret.value,
      i = ret.index,
      k = ret.key;

  const isVnode = (n) => n.constructor === VNode;
  const isVtext = (n)=> n.constructor === VText;
  /* 深拷贝Vnode 切断关系 */
  const deepCloneVnode = (root)=>{ 
    isVnode(root) && ( root = Object.assign(new VNode(),root) ).children.length > 0 && ( root.children = [].concat(root.children.map(n=>{
       if(isVnode(n)) return deepCloneVnode( n );
       if(isVtext(n)) return Object.assign(new VText(),n);
       /*数组中如果是Vnode 也要拷贝*/ 
       if(isArray(n)) return [].concat( n.map( n=>deepCloneVnode(n) ) );
    })) );

    return root;
 
  }

  const forRenderHandler = (wue,node,fordata,data) =>{

   const blendData = Object.assign(data,fordata);
   const nestForHandler = [];
   node.children.map((childnode,index)=>{
        if( isVtext(childnode) && childnode.text.trim() ){
            childnode.text = findTmpText(childnode.text,blendData)
            return childnode;
        }
        /*是否嵌套for 的渲染操作*/
        if( isVnode(childnode) && !childnode.properties.attributes['w-for'] ){
            return forRenderHandler(wue,childnode,fordata,data);
        }else if( isVnode(childnode) && childnode.properties.attributes['w-for']  ){
            /** 嵌套循环if */
            let forVnodes = handleWueInDirective(wue,blendData,childnode);
            nestForHandler.push( () => { node.children.splice.apply(node.children,[index,1,...forVnodes]) });
        }else{
            return childnode;
        }
   })

   nestForHandler.map( h => { h(); h = null; return h } ).filter( v => v );

   return node;

  } 

  let forvnodes = [];

  if(isNumber(d)){
    for(let idx = 0; idx < d; idx++){

        let fordata = {};
        i && ( fordata[i] = undefined );
        k && ( fordata[k] = idx );
        v && ( fordata[v] = idx );

        let cloneVnode = deepCloneVnode(vnode);
        cloneVnode.properties.attributes['w-for'] = ret.expression;
        forvnodes.push( forRenderHandler(wue,cloneVnode,fordata,data)  );
    }
  }else{
    Object.keys(d).forEach((key,index)=>{

        let fordata = {};
        i && ( fordata[i] = index );
        k && ( fordata[k] = key );
        v && ( fordata[v] = d[key] );
  
        let cloneVnode = deepCloneVnode(vnode);
        cloneVnode.properties.attributes['w-for'] = ret.expression;
        forvnodes.push( forRenderHandler(wue,cloneVnode,fordata,data)  );
    })
  }

  return forvnodes; 

}

/** 以下会把 vnode 转成 wight 的指令 2018-7-2 已找到解决方案 */

/* wue 绑定事件指令 */
wueInDirective['w-on'] = (vnode,propkey,data,wue) => {
    
    /**初始化时搬定事件 */
    if(isEmptyObject(data)){
        return vnode;
    }

    const props = vnode.properties;
    const EventType = propkey.replace(/^\@|^w-on:/,'');
    const EventHandle = props.attributes[propkey]

    let bindEl = wue.__isComponent?wue.prante.el:wue.el;

    vnode.create = function(doc){
        const EntrustOfElHandle = EntrustHandle.bind(bindEl,doc,parseWOn( EventHandle,wue.data,wue ),wue);
        if( !wue.init_render ){
            wue.__firstMount.push( bindEl => bindEl.addEventListener(EventType,EntrustOfElHandle) )
        }else{
            bindEl.addEventListener(EventType,EntrustOfElHandle)
        }
    };

    vnode.destroy = function(doc){
        bindEl.removeEventListener(EventType,EntrustHandle);
    };
    
    return vnode
}

wueInDirective['w-model'] = (vnode,propkey,data,wue) => {

    if(isEmptyObject(data)){
        return vnode;
    }

    const modle = vnode.properties.attributes[propkey];
    const { tagName,properties:{ type }  } = vnode;
    const bindEl = wue.__isComponent?wue.prante.el:wue.el;
    
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

    const { parent,lastKey } = findParentData(modle,data)
    const parentOriginal = parent.getOriginalObject;

    if( getInputType(tagName,type) === 'text' ){  

        let wmodelsTextMap = wue.wmodels.text.has(parentOriginal) ?
                                 wue.wmodels.text.get(parentOriginal) : 
                                 wue.wmodels.text.set(parentOriginal,new Map()) && wue.wmodels.text.get(parentOriginal);

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
        
        let wmodelsCheckboxMap = wue.wmodels.checkbox.has(parentOriginal) ?
                                 wue.wmodels.checkbox.get(parentOriginal) : 
                                 wue.wmodels.checkbox.set(parentOriginal,new Map()) && wue.wmodels.checkbox.get(parentOriginal);
        
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

        let wmodelsRadioMap = wue.wmodels.radio.has(parentOriginal) ?
                              wue.wmodels.radio.get(parentOriginal) : 
                              wue.wmodels.radio.set(parentOriginal,new Map()) && wue.wmodels.radio.get(parentOriginal);
        
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
        
        let wmodelsSelectMap = wue.wmodels.select.has(parentOriginal) ?
                               wue.wmodels.select.get(parentOriginal) : 
                               wue.wmodels.select.set(parentOriginal,new Map()) && wue.wmodels.select.get(parentOriginal);

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

wueInDirective['w-once'] = (vnode,propkey,data,wue) => {
    
    console.log('w-once')

    if(isEmptyObject(data)){
        return vnode; 
    }

    /** 不进行diff */
    if( wue.init_render ){
        vnode.nodiff = true;
    }

    return vnode
  
}

const handleWueInDirective = (wue,data,vnode)=>{

    const props = vnode.properties;
    /** priorityDirective 存放不会转成wight的指令 , laterDirective 则相反 */
    const priorityDirective = [], laterDirctive = [];

    // w-model 其实也属于 w-on 其实就是表单 用input或者change 做成双向数据绑定。 
    // wue-directive处理的顺序是编写渲染模板的人对指令设置的顺序。
    // w-model w-once w-on 会把vnode 写成 widget Function 设置为最后

    /** 为处理的指令调整下顺序 */
    Object.keys(props.attributes).forEach(propkey=>{
       /* w-bind:属性 与 :属性 交给 w-bind 处理 */ 
       if( propkey.match(/^w-bind|^\:/) ) priorityDirective.push( { directive:'w-bind',propkey } )
       /* @event 会在prop 处理中 变成 w-on:event 因为@event setAttibute 会报错 */
       else if( propkey.match(/^w-on:|^\@/) ) laterDirctive.push( { directive:'w-on',propkey } )
       else if( propkey === 'w-model' ) laterDirctive.push( { directive:'w-model',propkey} )
    //    else if( propkey === 'w-once' ) laterDirctive.push( { directive:propkey,propkey} )
       else priorityDirective.push( { directive:propkey,propkey } )
    })

    priorityDirective.concat(laterDirctive).forEach(prop =>{
        /**  (prop.directive === 'w-on' && isVText(vnode)) 避免 vText 执行 v-on指令 因为w-if = false 会把vnode 转成  一个空字符的vtext */
        if( !(prop.directive === 'w-on' && isVText(vnode)) ){
            wueInDirective[prop.directive] && (vnode = wueInDirective[prop.directive](vnode,prop.propkey,data,wue) );
        }
    })

    return vnode;

}

module.exports  = {
    handleWueInDirective
}



