import { diff, patch, create } from '../../virtual-dom';
import { deep } from '../../uilt';
import renderVNode from '../../render-vnode';

let time = null;

const observer = (setdata, key, newval, wue) => {
  setdata[key] = newval;

  if (time) return;

  /** 放到事件循环末尾 执行 */
  time = setTimeout(() => {
    // var currentVnode = new renderVNode( wue.norender_dom ).render( wue.old_data,wue )
    const updateVnode = new renderVNode(wue.norender_dom).render(wue.data, wue);
    const patches = diff(wue.vnode, updateVnode);
    patch(wue.el, patches);
    // 替换成当前最新的vnode
    wue.vnode = updateVnode;
    time = null;
    clearTimeout(time);
  }, 0);
};

export default observer;
