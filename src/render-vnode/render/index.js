import getNodeKey from "../getNodeKey"
import sliceProp from "../sliceProp"
import propReg from "../propReg"
import { isArray } from "../../uilt"
import { findTmpText } from "../../parse"
import renderVNode from './../index'

const render = function(data,wue,isprint){

    let child = null
    let childs = [...this.root.childNodes]
    let childsVNode = [];
    let props  = sliceProp( propReg(this.warpHtml,this.root.tagName) )

    if( wue.__isComponent && (!wue.isReplaceEl) ){
        /** isReplaceEl 组件的el要替换成挂载在docment节点上的节点 否则diff无反应 也可以进行组件的局部刷新 */
        wue.isReplaceEl = true;
        // 已经没有hook 可以换成vnode create;
        // wue.el = node
    }

    /*是否for节点*/
    props.attributes['w-for'] && (this.isForRender = true);

    for(let i = 0,len = childs.length;i<len;i++){  
        child = childs[i]
    
        /*Dom节点*/
        if(child.nodeType === 1){
          let childVNode = new renderVNode(child)
          
          /*delayFor 嵌套for 延后进行for操作*/
          if(this.isForRender){
            childVNode.isForRender = true;
            props.attributes['w-for'] && (childVNode.delayForRender = true);
          }
          /** 递归对子节点渲染 */
          let renderChilds = childVNode.render(data,wue,isprint);
          isArray(renderChilds) ? ( childsVNode = [].concat( childsVNode,renderChilds ) ) : childsVNode.push( renderChilds );
        /*Text节点*/ 
        }else if(child.nodeType === 3){
          childsVNode.push( this.createVText( this.isForRender ? child.data : findTmpText(child.data,data,isprint) )  )
        /*注释节点*/
        }else if(child.nodeType === 8){
          childsVNode.push(this.createVText(''))
        }
    }

    return this.createVNode(this.root.tagName,props,childsVNode,data,wue,getNodeKey(props.attributes) )
}

export default render;