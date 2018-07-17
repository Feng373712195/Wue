import getWarpHtml from './getWarpHtml'
import render from './render'
import createVNode from './createVNode'
import createVText from './createVText'

class renderVNode{
    constructor(dom,data){
        this.data = data
        this.root = dom
        this.vnode = null
        this.warpHtml = getWarpHtml(this.root)
    }   
}

renderVNode.prototype.render = render
renderVNode.prototype.createVNode = createVNode
renderVNode.prototype.createVText = createVText

export default renderVNode