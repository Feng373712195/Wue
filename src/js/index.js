import {  diff,patch,create } from '../models/virtual-dom';
import { Z_HUFFMAN_ONLY } from 'zlib';

/** 常用方法 */
const {  isUdf,
         isDom,
         isBoolean,
         isObject,
         isString,
         isNumber,
         isFunction,
         isPlainObject,
         isArray,
         prop,
         deep } = require('./uilt');

/** 渲染VNode模块 */
var { renderVNode } = require('./renderVNode');
/** 报错内容模块 */
const warn = require('./warn').default;

(function(){

  const dom = document;

  /** 像私有属性 应该写成function 名字为类似 _get _set 而不要直接暴露在this */
  function Wue(option){

    var that = this;

    //内部 第一次挂载的方法
    this.__firstMount = []; 
    const __getEl = (el) => isDom(option.el) ? option.el : isString(option.el) ? dom.querySelector( option.el ) : (console.error('option el error type'));

    /** 需要检测methods是否都是function类型 */
    console.log( option.methods )

    const dom = document;
    this.el = __getEl(option.el);
    
    //生命周期 create 创建了Wue实例
    option.create && isFunction(option.create) && option.create.apply(this.el);

    /** 初始化渲染 */
    this.init_render = false;
    
    /** wue 方法 */
    this.methods = option.methods;
    /** 一个未被Wue处理过的data  要和wue.data做出区分*/
    this.observerdata =  deep( option.data );
    this.olddata = deep( option.data );
    this.watch = option.watch ? option.watch : {};
    this.data = setOriginalObject( this.observerdata,createObserver(Object.create(null),this.observerdata,that) );
    //技术不行 -。- 有什么好办法可以记住模板的模型
    this.noRenderVNode = new renderVNode( this.el ).render( {},that );

    /** 存储的vModel对应的doc */
    this.wmodels = {
      text:new Map(),
      checkbox:new Map(),
      radio:new Map(),
      select:new Map()
    }

    this.forceUpdateData = () =>{
      this.data = setOriginalObject( this.observerdata,createObserver(Object.create(null),this.observerdata,that) );
    }

    /** 初始化时执行 */
    isFunction( option.beforeCreate ) && option.beforeCreate.apply(this);

    /* 设置组件 and 检查组件 */
    this.components = option.components;

    if(isArray(this.components) && this.components.length>0){
      this.components.forEach(name=>{ 
          var component;
          if( component = Wue.components.get(name)() ){
            component.prante = this;
            Wue.components.set(name,component)
          }else{
            throw Error( `not found this compnent of ${ name }` )
          }
      })
    }
    
    this.vnode = new renderVNode( this.el ).render( this.data,that );

    var patches = diff( that.noRenderVNode,that.vnode );

    var createDom = create(this.vnode);

    //生命周期 beforeMount 挂载之前
    option.beforeMount && isFunction(option.beforeMount) && option.beforeMount.apply(createDom);

    /** 旧的首次渲染操作 */
    // patch( that.el , patches );
    this.el.parentNode.replaceChild(createDom,this.el);

    /** 重新定义挂载节点 */
    this.el = __getEl(option.el);

    //生命周期 mounted 已经挂载到dom上
    option.mounted && isFunction(option.mounted) && option.mounted.apply(this.el);

    this.__firstMount.forEach( f => f.apply(this.el,[this.el]) )
    
    //使命结束 删除属性方法 以免被外部使用
    this.__firstMount = null;
    delete this.__firstMount;

    // __WueFirstMount(this.el);

    //初始化加载完毕
    this.init_render = true;

    /** 初始化时执行 */
    isFunction( option.beforeCreate ) && option.beforeCreate.apply(this);
    
    /**
     * wue.component 可以访问
     * Wue.component 可以访问
     */
    this.__proto__.component = Wue.component;
    this.__proto__.set = function(setdata){
      Wue.set( this.data,setdata,this );
    };

    // this.prototype.component = Wue.component;
  }

  /** wue 组件（注意不支持横杠驼峰写法，如果a-b 会转为 aB）*/
  Wue.components = new Map();
  
  /** 组件如何局部刷新 */
  Wue.component = function(templateName,option){

    /** 组件必须要传入名称 需要是字符串类型 不能与其他组件名重复*/
    if(!templateName) warn('component-name-is-empty');
    if(!isString(templateName)) warn('component-name-no-string');
    if(Wue.components.get(templateName)) warn('component-name-is-repeat');
    
    /**检查component options 是否 object类型 */
    if( !isObject(option) ) warn('component-option-not-object',templateName)
    
    /** 组件data只能传入Object 或者 function 类型 */
    let data = option.hasOwnProperty('data') ? option.data : {};
    if(isFunction(data)) data = data();
    if(isObject(data)) data = data; 
    else warn('component-data-error-type') 
    
    var temDom = document.createElement('div');
    temDom.innerHTML = option.template;
    /*组件需要有一个标签包裹起来 否则抛出错误*/
    if( temDom.childNodes.length > 1 ) warn('component-not-singletage-warp',templateName);
    
    const createComponent = ()=>{
      let wue = new Wue({
        el:temDom.childNodes[0],
        data:data,
      })
      wue.props = option.props;
      /**组件识标 */
      wue.__isComponent = true
      wue.vnode = new renderVNode( wue.el ).render( wue.data,wue );
      return wue;
    }

    /**组件存入 WUE*/
    Wue.components.set(templateName,createComponent);
    
  }

  /** Vue set */

  // wue.set( wue.data,{},wue )
  // wue.data 是会监听数据改变的object
  // Wue.set 要做的是在data上增加新字段 修改可以触发视图更新 如果直接data.a = '1' 虽然可以设置数据但是不可以触发视图更新
  Wue.set = function(wueObserverData,setdata,wue){
    //判断wueObserverData 和 setData 是否 objectd对象
    //判断wue的构造函数是否 Wue
    createObserver(wueObserverData,setdata,wue,(key,value,data,wue)=>{
        //set后 触发observer
        observer(key,value,data,wue);
    })
  }

  /** 过滤器 */
  Wue.filters = function(){
    
  }

  /* 指令 */
  Wue.directives = function(){
    
    return {
      bind:'',
      inserted:'',
      update:'',
      componentUpdated:'',
      unbind:'',
    }

  }

  window.Wue = Wue;
  
  //数据劫持
  /**
   * @param {*} observerData 要创建的 监听对象 最后返回这个对象  
   * @param {*} data 原始的对象数据 使用者wue配置的data 备注 : 传这个是为了执行 observer时  observerdata[key] = newValue; 修改数据 然后再和旧数据对比 很重要
   * @param {*} wue wue实例对象
   * @param {*} cb 监听完一个属性后的实行的回调
   * @returns {*} observerData 传进来的第一个参数
   */

  function createObserver(observerData,data,wue,cb){
    
    const clone = deep( data )
    
    for(let x in clone){

      /*是纯Object的继续递归*/
      if( isPlainObject(clone[x]) ){
        clone[x] = setOriginalObject( clone[x],createObserver(Object.create(null),data[x],wue) )
      }

      //数组的拦截
      if( isArray(clone[x]) ){
        let cloenArr = deep( clone[x] ); 
        cloenArr = cloenArr.map((val,idx)=>{
          if(isObject(val)){  return setOriginalObject( cloenArr,createObserver(Object.create(null),data[x][idx],wue) ) }
          else if(isArray(val)){ return data[x][idx]; }
          else{ return val; }
        })
        clone[x] = createObserverArr(x,data,cloenArr,data[x],wue)
      }

      Object.defineProperty(observerData,x,{
        get(v){
          return clone[x];
        },
        set(newValue){

          watch(x,newValue,data[x],wue);
          // observer(x,newValue,wue.observerdata,wue);
          observer(x,newValue,data,wue);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        

          /** key 值为 a.b a['b']的处理 */
          /** 双向数据绑定 处理 */
          wue.wmodels.text.has(data) && wue.wmodels.text.get(data).get(x).forEach(input =>{
            if( input.value != newValue ) input.value = newValue
          })
          wue.wmodels.checkbox.has(data) && wue.wmodels.checkbox.get(data).get(x).forEach(input =>{
            if( isBoolean(newValue) ){
              prop(input,'checked',newValue ? true:null );
            }
            if( isArray(newValue) ){
              const hasArr = (arr,val) => arr.indexOf( val ) !== -1
              const isChecked  =  isNumber(+newValue) ? ( hasArr(newValue,+input.value) || hasArr(newValue,input.value) ) : hasArr(newValue,input.value) ;
              prop(input,'checked',isChecked ? true:null );
            }
          })
          wue.wmodels.radio.has(data) && wue.wmodels.radio.get(data).get(x).forEach(input =>{
            /** 这里不用全等判断 因为需要 1 == “1” */
            const isChecked = input.value == newValue;
            prop(input,'checked',isChecked ? true:null );
          })
          // wue.wmodels.select.has(data) && wue.wmodels.select.get(data).get(x).forEach(select =>{
          //   [...select.options].forEach(option=>{
          //     const isSelected = option.text == newValue;
          //     prop(option,'selected',isSelected ? true:null)
          //   })
          // })
        },
        enumerable : true,
        configurable : true
      });

      cb && cb(x,clone[x],wue.observerdata,wue) 

    }

    return observerData;
  }

  /** 设置源对象 */
  /**
   * @param {object} orgin 源对象 没有处理数据监听的对象
   * @param {object} data 处理成数据监听的对象 
   * @return {object} orgin
   */
  function setOriginalObject(origin,data){
    Object.defineProperty(data,'getOriginalObject',{
      get:function(v){
        return origin
      },
      enumerable : false,
      configurable : false
    });

    return data;
  }

  /** 数组代理 伪数组 */
  function createObserverArr(key,observerdata,arr,originArr,wue){
    
    const arrhandles = [
      'push',
      'pop',
      'shift',
      'splice',
      'unshift',
      'toString'
    ]

    let proxpArr = [];

    const observerSetArrData = (key,arr,originArr) => {
      originArr.forEach((v,i)=>{
        Object.defineProperty(arr,i,{
          get(){ return v },
          set(newValue){
            // watch(key,[],arr,wue);
            observer(i,newValue,originArr,wue);
          }
        })
      })
    }

    arrhandles.forEach(v=>{
      Object.defineProperty(arr,v,{
        get:function(){
          if( v === 'toString' ){ 
            return function(){ return JSON.stringify(this) }
          }
          return (...arg)=>{
                  const ret = proxpArr[v].apply(arr,arg);
                  observerSetArrData(key,arr,originArr)
                  watch(key,[],arr,wue);
                  observer(key,arr,observerdata,wue);
                  return ret;  
                }
        },
        enumerable : false,
        configurable : false
      })
    })

    observerSetArrData(key,arr,originArr,proxpArr)

    return arr;

  }

  /** 监听修改 */
  function watch(key,newVal,oldVal,wue){
    wue.watch[key] && wue.watch[key].bind(wue,newVal,oldVal)();
  }


  /** 第三个参数有点多余 待修改 */
  function observer(key,newValue,observerdata,wue){

      console.log( 'observer' )
 

      observerdata[key] = newValue;
      console.log(  observerdata )
      console.log( wue.observerdata.arr === observerdata )

      var currentVnode = new renderVNode( create( wue.noRenderVNode ) ).render( wue.olddata,wue,false );     
      /* wue.observerdata 7.13 wue.wue.observerdata 改为 wue.data */    
      var updateVnode  =  new renderVNode( create( wue.noRenderVNode ) ).render( wue.observerdata,wue,true );

      var patches = diff( currentVnode,updateVnode );
      patch( wue.el , patches );
      
      /** 记录data 为下一次diff的旧data */
      wue.olddata = deep( wue.observerdata );
  }

})();
