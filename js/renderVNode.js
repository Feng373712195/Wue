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
  this.warpHtml = this.root.outerHTML.replace(this.root.innerHTML,'');
}

renderVNode.prototype.render = function(data,wue){

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
      renderChilds = childVNode.render(data,wue);
      isArray(renderChilds) ? ( childsVNode = [].concat( childsVNode,renderChilds ) ) : childsVNode.push( renderChilds );
    /*Text节点*/ 
    }else if(child.nodeType === 3){
      childsVNode.push(  this.createVText( this.isForRender ? child.data : findTmpText(child.data,data) )  )
    /*注释节点*/
    }else if(child.nodeType === 8){
      childsVNode.push(this.createVText(''))
    }
    
  }

  return this.createVNode(this.root.tagName,props,childsVNode,data,wue)

}

renderVNode.prototype.createVNode = function(tagName,properties,children,data,wue){
  
  if( !isEmptyObject(data) &&  Wue.components.get(tagName.toLowerCase())){
    return Wue.components.get(tagName.toLowerCase()).vnode
  }

  let vnode = new VNode(tagName,properties,children);
  
  vnode  = this.delayForRender ? vnode : handleWueInDirective(wue,data,vnode);
  return vnode;

}

renderVNode.prototype.createVText = function(text){
  return new VText( text );
}

module.exports = {
  renderVNode
}