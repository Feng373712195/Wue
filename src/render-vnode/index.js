import getWarpHtml from './getWarpHtml';
import render from './render';
import createVNode from './createVNode';
import createVText from './createVText';

class renderVNode {
  constructor(dom, data) {
    this.data = data;
    this.root = dom;
    this.vnode = null;
    // 是否是w-for渲染的元素
    this.isForRender = false;
    // 是否嵌套的w-for模板
    this.delayForRender = false;
    // getWarpHtml方法 拿到dom节点的包裹标签
    this.warpHtml = getWarpHtml(this.root);
  }
}

renderVNode.prototype.render = render;
renderVNode.prototype.createVNode = createVNode;
renderVNode.prototype.createVText = createVText;

export default renderVNode;
