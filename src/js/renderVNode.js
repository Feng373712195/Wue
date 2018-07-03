/* virtual-dom 模块*/
const { diff,patch,h,create,VNode,VText } = require('virtual-dom');

/** 常用方法 */
const {  isUdf,
         isObject,
         isEmptyObject,
         isPlainObject,
         isArray } = require('./uilt');

/** Wue 指令模块 */
const { handleWueInDirective,WModleWidget } = require('./directive');

/** 查找模板数据模块 */
const findTmpText = require('./findTmpText').default;

/** 获取dom字符串的属性的正则 */
const propReg = require('./propReg').default;

/** 切分dom属性模块 */
const sliceProp = require('./sliceProp').default;

console.log('renderVNode');

function renderVNode(dom,data){  
  
  /** 如何区分组件 */
  this.data = data;
  this.root = dom;
  this.vnode = null;
  /*是否是w-for渲染的元素*/
  this.isForRender = false;
  /** 是否嵌套的w-for模板 */
  this.delayForRender = false;

  var { outerHTML,innerHTML } = this.root

  //一个正则表达式菜逼的代码
  var fTag = outerHTML.substr( 0,outerHTML.indexOf( '>' + innerHTML )) + '>';
  var lTag = outerHTML.substr( ( fTag.length + innerHTML.length) , outerHTML.length );

  this.warpHtml = `${fTag}${lTag}`;
  
}

/** isprint参数 是否打印错误 */
renderVNode.prototype.render = function(data,wue,isprint){

  let child  = null;
  let childs = [].slice.call( this.root.childNodes );
  let childsVNode = [];
  let props  = sliceProp( 
                  propReg(this.warpHtml,this.root.tagName),
               );
                 
  /*是否for节点*/
  props.attributes['w-for'] && (this.isForRender = true);
  
  /** 是否组件对属性的处理 */ 
  
  if( wue.__isComponent && (!wue.isReplaceEl) ){
    /** isReplaceEl 组件的el要替换成挂载在docment节点上的节点 否则diff无反应 也可以进行组件的局部刷新 */
    wue.isReplaceEl = true;
    let Hook = function(){}
    Hook.prototype.hook = function(node){ wue.el = node }
    props['my-hook'] = new Hook();
  }
  
  for(let i = 0,len = childs.length;i<len;i++){  
    child = childs[i]

    /*Dom节点*/
    if(child.nodeType === 1){
      childVNode = new renderVNode(child)
      
      /*delayFor 嵌套for 延后进行for操作*/
      if(this.isForRender){
        childVNode.isForRender = true;
        props.attributes['w-for'] && (childVNode.delayForRender = true);
      }
      /** 递归对子节点渲染 */
      renderChilds = childVNode.render(data,wue,isprint);
      isArray(renderChilds) ? ( childsVNode = [].concat( childsVNode,renderChilds ) ) : childsVNode.push( renderChilds );
    /*Text节点*/ 
    }else if(child.nodeType === 3){
      childsVNode.push(  this.createVText( this.isForRender ? child.data : findTmpText(child.data,data,isprint) )  )
    /*注释节点*/
    }else if(child.nodeType === 8){
      childsVNode.push(this.createVText(''))
    }
    
  }


  // 获取Vnode Key
  const getNodeKey = (props) =>{
    if(props.hasOwnProperty('key')){
      return props['key'] 
    }else if(props.hasOwnProperty(':key')){
      return findTmpText(`{{ ${props[':key']} }}`,data,isprint)
    }else{
      return undefined
    }
  }

  return this.createVNode(this.root.tagName,props,childsVNode,data,wue,getNodeKey(props.attributes) )

}

renderVNode.prototype.createVNode = function(tagName,properties,children,data,wue,key){

  // 组件的 tagName 不能传入aBxxxCxxx 这样的标签 应该获取的 节点的tagName获得到的标签名全是大写 无法分辨正确组件标签名称
  // 暂时这么处理 这是非常耗性能的做法
  // · 暂时想到的解决思路 用正则把标签名取到 不使用tagName获取组件名称
  // 可以把components中的标签名更改为使用者编写的标签名 下次就可以直接获取到 不用遍历 性能可以优化许多.

  for( let [ componentName,component ] of Wue.components ){
    if( new RegExp(`^${tagName}$`,'i').test( componentName ) ){ 
      let vnode = new VNode(tagName,properties,children,key);
      vnode  = this.delayForRender ? vnode : handleWueInDirective(wue,data,vnode);
      let { properties:{ attributes } } = vnode;

      // component.props.forEach( prop => {
        // attributes[prop] && (component.data[prop] = attributes[prop]);
      // })

      return component.vnode;
    }
  }

  let vnode = new VNode(tagName,properties,children,key);  
  vnode  = this.delayForRender ? vnode : handleWueInDirective(wue,data,vnode);
  return vnode;

}

renderVNode.prototype.createVText = function(text){
  return new VText( text );
}

module.exports = {
  renderVNode
}
