import { VNode } from '../../virtual-dom';
// import { VNode } from 'virtual-dom'
import components from '../../init/componentsMap';
import handleWueInDirective from '../../directive';

const createVNode = function (tagName, properties, children, data, wue, key) {
  for (const [componentName, component] of components) {
    if (new RegExp(`^${tagName}$`, 'i').test(componentName)) {
      let vnode = new VNode(tagName, properties, children, key);
      vnode = this.delayForRender ? vnode : handleWueInDirective(vnode, data, wue);
      return component.vnode;
    }
  }

  let vnode = new VNode(tagName, properties, children, key);
  // vnode = this.delayForRender ? vnode : handleWueInDirective(vnode, data, wue);
  vnode = handleWueInDirective(vnode, data, wue);
  return vnode;
};

export default createVNode;
