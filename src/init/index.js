import initEl from './initEl';
import firstMount from './firstMount';

import checkOption from './checkOption';
import components from './componentsMap';
import { create } from '../virtual-dom';
import createObserver from '../observer/createObserver';
import { deep, isObject } from '../uilt';
import renderVNode from '../render-vnode';

class Wue {
  constructor(option) {
    // 检查初始化配置
    checkOption(option);
    const { el, data, methods } = option;
    // 初始化挂载Dom节点
    initEl.bind(this, el)();
    // 首次渲染是否完成
    this.init_render = false;
    // 原data 未被wue改动过的data
    this.original_data = data;
    // wue监听的data 用户修改数据也是通过这个data
    this.data = createObserver(Object.create(null), data, this);
    // methods
    this.methods = methods;
    // 旧的data 每次diff 后就会把存到这个data
    this.old_data = deep(data);
    // 模板未被替换的vnode
    this.norender_vnode = new renderVNode(this.el).render({}, this);
    // 模板未被替换的dom
    this.norender_dom = create(this.norender_vnode);
    // 上一次渲染的 vnode 2018.7.23 试验
    // this.current_vnode = new renderVNode(this.el).render({}, this);
    // 当前视图的vnode
    this.vnode = new renderVNode(this.el).render(this.data, this);
    // 初始化完成 vnode生成真实dom挂载到节点上
    const createDom = create(this.vnode);

    this.el.parentNode.replaceChild(createDom, this.el);

    initEl.bind(this, el)();

    /** 初次挂载调用方法 */
    firstMount.forEach(f => f.apply(this.el, [this.el]));
    /** 初始化渲染完毕 删除这个属性 */
    this.init_render = true;
  }
}

Wue.prototype.$set = function (target, key, value) {
  if (!isObject(target)) return;

  const original = target.getOriginalObject;

  if (!original) {
    throw Error('find not target.getOriginalObject');
  }

  if (original.hasOwnProperty(key)) {
    throw Error('target has key');
  }

  original[key] = value;
  createObserver(this.data, original, this);
};

Wue.component = function (templateName, option) {
  /** 组件必须要传入名称 需要是字符串类型 不能与其他组件名重复 */
  if (!templateName) warns('component-name-is-empty');
  if (!isString(templateName)) warns('component-name-no-string');
  if (components.get(templateName)) warns('component-name-is-repeat');

  /** 检查component options 是否 object类型 */
  if (!isObject(option)) warns('component-option-not-object', templateName);

  /** 组件data只能传入Object 或者 function 类型 */
  let data = option.hasOwnProperty('data') ? option.data : {};
  if (isFunction(data)) data = data();
  if (isObject(data)) data = data;
  else warns('component-data-error-type');

  const temDom = document.createElement('div');
  temDom.innerHTML = option.template;
  /* 组件需要有一个标签包裹起来 否则抛出错误 */
  if (temDom.childNodes.length > 1) warns('component-not-singletage-warp', templateName);

  const createComponent = () => {
    const wue = new Wue({
      el: temDom.childNodes[0],
      data,
    });
    wue.props = option.props;
    /** 组件识标 */
    wue.isComponent = true;
    wue.vnode = new renderVNode(wue.el).render(wue.data, wue);
    return wue;
  };

  /** 组件存入 WUE */
  components.set(templateName, createComponent);
};

export default Wue;
