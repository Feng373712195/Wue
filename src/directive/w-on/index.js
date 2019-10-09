import { isEmptyObject } from '../../uilt';
import { parseWOn } from '../../parse';
import firstMount from '../../init/firstMount';

const won = (vnode, propkey, data, wue, entrustHandle) => {
  if (isEmptyObject(data)) {
    return vnode;
  }

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

export default won;
