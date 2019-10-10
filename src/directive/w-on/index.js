import { isEmptyObject, isArray } from '../../uilt';
import { parseWOn } from '../../parse';
import firstMount from '../../init/firstMount';

const won = (vnode, propkey, data, wue, entrustHandle) => {
  if (isEmptyObject(data)) {
    return vnode;
  }

  // 处理vnode children数组情况
  const vnodes = isArray(vnode) ? vnode : [vnode];

  const handleNode = (vnode, propkey, data, wue, entrustHandle) => {
    const props = vnode.properties;
    const EventType = propkey.replace(/^\@|^w-on:/, '');
    const EventHandle = props.attributes[propkey];
    const bindEl = wue.isComponent ? wue.prante.el : wue.el;
    vnode.create = function (doc) {
      const EntrustOfElHandle = entrustHandle.bind(bindEl, doc, parseWOn(EventHandle, wue.data, wue), wue);
      if (!wue.init_render) {
        firstMount.push(bindEl => bindEl.addEventListener(EventType, EntrustOfElHandle));
      } else {
        bindEl.addEventListener(EventType, EntrustOfElHandle);
      }
    };
    vnode.destroy = function (doc) {
      bindEl.removeEventListener(EventType, entrustHandle);
    };
    return vnode;
  };

  if (isArray(vnode)) {
    return vnodes.map(node => handleNode(node, propkey, data, wue, entrustHandle));
  }
  return handleNode(vnode, propkey, data, wue, entrustHandle);
};

export default won;
