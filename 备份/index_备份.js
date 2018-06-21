/*
*   BUG(1):自定义属性不会显示在标签上 
*   BUG(2):属性截断不正确 2018-4-28 11:30修复
*   BUG(3):表单会失去焦点 和失去输入内容 2018-4-28 14:48修复
 */

/*
* 
  Todu(1): data中的数组对象 数据劫持未做  2018-4-28 20：00 完成
  Todu(2): 基本功能 :class :style w-modle w-for w-if 
  Tode(3): watch未监听到对象属性 
  Tode(4): 如果模板中写的是表达式 未对这种情况处理
 */

const { diff,patch,h,create,VNode,VText } = require('virtual-dom');
const  createElement  = require('virtual-dom/create-element');
const {  isUdf,
         isObject,
         isEmptyObject,
         isPlainObject,
         isArray } = require('./uilt');

const tlpReg = /{{([^%>]+)?}}/g;

const propReg = (tagname)=>{
  return new RegExp( `^<${tagname} (.+?)><\/${tagname}>$` ,'gi')
}

const TagReg = (tagname) =>{
  return new RegExp( `^<${tagname}>|<\/${tagname}>$` ,'gi')
}

const propMap = {
  'tabindex': 'tabIndex',
  'readonly': 'readOnly',
  'for': 'htmlFor',
  'class': 'className',
  'maxlength': 'maxLength',
  'cellspacing': 'cellSpacing',
  'cellpadding': 'cellPadding',
  'rowspan': 'rowSpan',
  'colspan': 'colSpan',
  'usemap': 'useMap',
  'frameborder': 'frameBorder',
  'contenteditable': 'contentEditable'
}

let wueMap = { };

wueMap['w-show'] = (obj)=>{
  obj['style'] = 'display:none; !important;' 
}



 
function renderVNode(dom,data){  
  this.data = data;
  this.root = dom;
  this.vnode = null;
  this.warpHtml = this.root.outerHTML.replace(this.root.innerHTML,'');
}

renderVNode.prototype.render = function(data){

  let child  = null;
  let childs = [].slice.call( this.root.childNodes );
  let childsVNode = [];

  let props  = sliceProp( 
                  this.warpHtml.replace( propReg(this.root.tagName),'$1' ).replace( TagReg(this.root.tagName),'')
               );

  for(let i = 0,len = childs.length;i<len;i++){  
    child = childs[i]
    /*Dom节点*/
    if(child.nodeType === 1){
      childsVNode.push( new renderVNode(child).render(data) )
    /*Text节点*/
    }else if(child.nodeType === 3){
      childsVNode.push(  this.createVText(  this.findTmpText(child.data,data) )  )
    }
  }

  return this.createVNode(this.root.tagName,props,childsVNode)
}

renderVNode.prototype.createVNode = function(tagName,properties,children){
  return new VNode(tagName,properties,children) 
}

renderVNode.prototype.createVText = function(text){
  return new VText( text );
}

/** 寻找要渲染的模板模型 */
renderVNode.prototype.findTmpText = function(text,data){

  let tmpval;
  let match = '';

  if( text.trim() != '' && !isEmptyObject(data) ){

    while( match = tlpReg.exec(text) ){
        tmpval = getTemplateValue( data,match[1],match[0] );
        text =  text.replace( match[0] , isArray(tmpval)  ? tmpval.toString() : 
                                         isObject(tmpval) ? JSON.stringify(tmpval) :
                                         tmpval )
    } 
  }

  return text; 
}

function HyphenTrunHump(str){
   return  str
   .split('-')
   .map( (v,i)=> { return i > 0 ? `${v[0].toUpperCase()}${v.substring(1, v.length)}` : v } )
   .join('')
}

function sliceProp(str){

  let propsObj = {};

  if(!str) return  propsObj;

  // -.- 蹩脚正则表达式
  // let props = str.split(/\"\s+/).filter(v=>v);  
  let props = str.split(/\s*\w+\=\'|\"/ );
  let propkey = '';
  props.length = props.length-1

  props.forEach( (v,i)=>{

    if( i%2 === 0 ){
      propkey = v.substring(0,v.length-1).trimLeft()
      propkey = propMap[propkey] ? propMap[propkey] : propkey;
    }else{
      propsObj[propkey] = v;
      wueMap[propkey] && wueMap[propkey](propsObj);
    }

  })

  console.log(propsObj)

  return propsObj;

}

function getTemplateValue(data,key,tmp){

  const keys = key.split('.');

  if( keys.length === 1 ){

    let getDataValue = new Function( 'd',`return d.${key}` );

    return isUdf( data[key] ) ? 
           (isUdf( getDataValue(data) )? tmp : getDataValue(data) )
            :
           data[key];
  }else{
    data = data[keys[0]];
    keys.shift();
    return getTemplateValue( isObject(data[keys[0]]) ? data[keys[0]] : data , keys.join('') )
  }

} 

(function(){

  const dom = document;

  function Wue(option){

    var that = this;

    const dom = document;
    this.el = dom.querySelector( option.el );  
    this.observerdata = option.data;
    this.watch = option.watch ? option.watch : {};
    this.data = createObserver(Object.create(null),option.data,that);
    //技术不行 -。- 有什么好办法可以记住模板的模型
    this.noRenderVNode = new renderVNode( this.el ).render( {} );
    this.vnode = new renderVNode( this.el ).render( this.data );
    
    var rootNode = createElement( this.vnode );
    this.el.innerHTML = rootNode.innerHTML;

  }

  window.Wue = Wue;

  //数据劫持
  function createObserver(observerData,data,wue){

    for(let x in data){

      /*是纯Object的继续递归*/
      if( isPlainObject(data[x]) ){
        data[x] = createObserver(Object.create(null),data[x],wue)
      }

      //数组的拦截
      if( isArray(data[x]) ){
        createObserverArr(x,data,data[x],wue)
      }

      Object.defineProperty(observerData,x,{
        get:function(){
          return data[x];
        },
        set:function(newValue){
          watch(x,data[x],newValue,wue);
          observer(x,newValue,data,wue)
        },
        enumerable : true,
        configurable : true
      });

    }

    return observerData;
  }

  /** 数组代理 伪数组 */
  function createObserverArr(key,observerdata,arr,wue){

    const arrhandles = [
      'push',
      'pop',
      'shift',
      'splice',
      'unshift'
    ] 

    let proxpArr = [];

    arrhandles.forEach(v=>{
      arr[v] = (...arg)=>{
        const ret = proxpArr[v].apply(arr,arg);
        watch(key,[],arr,wue);
        observer( key,arr,observerdata,wue );
        return ret;  
      }
    })

  }

  /** 监听修改 */
  function watch(key,newVal,oldVal,wue){
    wue.watch[key] && wue.watch[key].bind(wue,newVal,oldVal)();
  }

  function observer(key,newValue,observerdata,wue){

      observerdata[key] = newValue; 

      var updateVnode = new renderVNode( createElement( wue.noRenderVNode ) ).render( wue.observerdata );
      var patches = diff( wue.noRenderVNode,updateVnode );
      var rootNode = createElement( wue.vnode )
      patch( wue.el , patches ); 
  }

})();
