import {  diff,patch,h,create,VNode,VText } from '../models/virtual-dom';

/** 常用方法 */
const {  isUdf,
         isDom,
         isBoolean,
         isObject,
         isString,
         isFunction,
         isEmptyObject,
         isPlainObject,
         isArray,
         attr } = require('./uilt');

/** 渲染VNode模块 */
var { renderVNode } = require('./renderVNode');

const sliceProp = require('./sliceProp').default;

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
    this.observerdata = option.data;
    this.olddata = JSON.parse( JSON.stringify( this.observerdata ) );
    this.watch = option.watch ? option.watch : {};
    this.data = createObserver(Object.create(null),option.data,that);
    //技术不行 -。- 有什么好办法可以记住模板的模型
    this.noRenderVNode = new renderVNode( this.el ).render( {},that );

    /** 存储的vModel对应的doc */
    this.wmodels = {
      text:{},
      checkbox:{},
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
  function createObserver(observerData,data,wue,cb){

    for(let x in data){

      /*是纯Object的继续递归*/
      if( isPlainObject(data[x]) ){
        data[x] = createObserver(Object.create(null),data[x],wue)
      }

      //数组的拦截
      if( isArray(data[x]) ){
        createObserverArr(x,data,data[x],wue)
      }

      Object.defineProperty(observerData,x,{
        get(v){
          return data[x];
        },
        set(newValue){

          watch(x,data[x],newValue,wue);
          // observer(x,newValue,wue.observerdata,wue);
          observer(x,newValue,data,wue);

          /** key 值为 a.b a['b']的处理 */
          /** 双向数据绑定 处理 */
          wue.wmodels.text[x] && wue.wmodels.text[x].map(input =>{
            if( input.value != newValue ) input.value = newValue
          })

          wue.wmodels.checkbox[x] && wue.wmodels.checkbox[x].map(input =>{
            console.log('here')
            if( isBoolean(newValue) ){
              attr(input,'checked',newValue ? true:null );
            }
          })

        },
        enumerable : true,
        configurable : true
      });

      cb && cb(x,data[x],wue.observerdata,wue) 

    }

    return observerData;

  }

  /** 数组代理 伪数组 */
  function createObserverArr(key,observerdata,arr,wue){
    
    const arrhandles = [
      'push',
      'pop',
      'shift',
      'splice',
      'unshift',
      'toString'
    ]

    let proxpArr = [];

    arrhandles.forEach(v=>{
      Object.defineProperty(arr,v,{
        get:function(){
          if( v === 'toString' ){ 
            return function(){ return JSON.stringify(this) }
          }
          return (...arg)=>{
                  const ret = proxpArr[v].apply(arr,arg);
                  watch(key,[],arr,wue);
                  observer( key,arr,observerdata,wue );
                  return ret;  
                }
        },
        enumerable : false,
        configurable : false
      })
    })

  }

  /** 监听修改 */
  function watch(key,newVal,oldVal,wue){
    wue.watch[key] && wue.watch[key].bind(wue,newVal,oldVal)();
  }


  /** 第三个参数有点多余 待修改 */
  function observer(key,newValue,observerdata,wue){

      observerdata[key] = newValue;
      
      // console.log( observerdata )
      // console.log( wue.observerdata );

      var currentVnode = new renderVNode( create( wue.noRenderVNode ) ).render( wue.olddata,wue,false );         
      var updateVnode  =  new renderVNode( create( wue.noRenderVNode ) ).render( wue.observerdata,wue,true );
      

      console.log( updateVnode );

      var patches = diff( currentVnode,updateVnode );

      patch( wue.el , patches );
      
      /** 记录data 为下一次diff的旧data */
      wue.olddata = JSON.parse( JSON.stringify(wue.observerdata) );

  }

})();
