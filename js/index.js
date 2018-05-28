/*
*   BUG(1):自定义属性不会显示在标签上 修复
*   BUG(2):属性截断不正确 2018-4-28 11:30修复
*   BUG(3):表单会失去焦点 和失去输入内容 2018-4-28 14:48修复
*   BUG(4):html 标签中有 <!-- --> 注释 VNode 不会更新  2018-5-13 修复
*   BUF(5):单标签的属性劫取 已经修复 
*   BUG(6):每次diff都会更新w-model元素 
*   BUG(7):如果一个元素有绑定了多个wue多个内置指令 似乎只会就近绑定第一个 
*   BUG(8): props a["b"] a[\"b\"] 报错 暂时不支持 a["b"] a[\"b\"] 待修复
*   BUG(9): cry cry cry 属性截取表达式 如 <div w-if=" 1 + 1 == 2" >1</div>
*           outerHTML 会获取成 <div w-if=" + 1 == 2" >1</div>
*           outerHTML 问题真是贼多 
*   BUG(10): 指令中写表达式 如： a.b 如找不到 a 或者 b 属性会报错误
*                                如果单写 a wue不会报错。 
*
*            修复于 2018-5-7 14：15
*
*   BUG(11) w-for 不支持 in number 
*   BUG(12) w-for 中的 wue指令不会执行
*   BUG(13) 处理标签无值属性 修复于 2018-5-22
*   BUG(14) method 传入 data++ 报语法错误 number类型不能使用递增或者递减符号
*   BUG(15) 组件应该有个区分的属性 然后要有一个parent. 这样才可以w-on
*/

/*
* 
  Todu(1): data中的数组对象 数据劫持未做  2018-4-28 20：00 完成
  Todu(2): 基本功能  :class :style w-modle w-for w-if w-else w-else-if 
           · w-show  : 实现于 2018-4-30 16：40
           · w-modle : 实现INPUT的双向数据绑定 2018-5-1 23：40
           · :class  
           · :style
           · w-once  : 实现于 2018-5-2 16:35
           · w-html  : 实现于 2018-5-2 16:50
           . w-text  : 实现 具体时间忘记
           · w-for   : 实现于 2018-5-13 15:45  未使用 w-key 进行优化
           
  Todu(3): watch未监听到对象属性 
  Todu(4): 如果模板中写的是表达式 未对这种情况处理
  Todu(5): 对于不规范html写法 要有报错机制 
  Todu(6): 对于模板中找不到的模型 要有报错机制
  Todu(7): w-bind:属性 w-bind缩写 :属性     粗略实现 2018-5-6 17:00
           · Tipe 如果属性的值是 null、undefined 或 false，则 disabled 特性甚至不会被包含在渲染出来的 <button> 元素中。
  Todu(8): 模板中可以写 JavaScript 表达式 粗略实现 2018-5-6 17:55
           . Tipe 如 message.split('').reverse().join('') 还未实现

           实现于 2017-5-7 17:10

  Todu(9): w-on:事件 and @事件  未实现
  Tode(10): 生命周期未实现
            · beforeCreate 
            · created 
            · beforeMount 
            · mounted 
            · beforeUpdate 
            · updated 
            · activated 基于组件
            · deactivated 基于组件
            · beforeDestroy 
            · destroyed 
            · errorCaptured
            
  TODO:(11): methods 绑定事件 
              . w-on:click 需要注入参数 event对象
              . w-on:click="()=>{}" or w-on:click="()=> body" or w-on:click="function(){}" 实现 
              · w-on:click="count++ count+=1" 实现
              ` w-on:click="count = count + 1 、count += count + 2" 实现
              . w-on:click="method(参数)" 实现
              . w-on:click="method(参数),()=>{  }"
              · w-on:click="method(动态参数) 0.0" 要是有些变态参数传入三元表达式 二元表达式 计算表达式怎么办 实现
              . w-on:click="method1 method2 method3(参数)" 多个method应该用逗号分割 不然会报语法错误  实现
              · 不支持闭包函数 w-on:click="((a)=>{})"
              . 不支持 console.log 却可以支持 str.split('').reverse().join('') 实现

  TODO:(12): 之后不能以空data判断是否初始化状态 要给个初始化的至判断 因为用户也可能传入空data Wue应该支持传入空data
  TODO:(13): components
              · 子组件的组件的组件...
              ` 组件间的通信 
                  props
                  propsData
                  emit
                  on
  TODO:(14): refs 获取节点的Dom对象.
  TODO:(15): str.split('').reverse().join('') 内置成员函数调用 未解析 会报错 以前已实现 因为解析时遇到undefind报错
  TODO:(16): 内置组件<component> 可以配合 bind:is 进行渲染组件与动态组件
  */

 /**
  *  Summary(1) virtual-dom  property中的hook传过来的node 应该是渲染之前的node
  *  Summary(2) 因为Dom标签属性不支持驼峰写法 如何写驼峰会被转换成小写 所以Dom标签的属性不支持驼峰写法
  */

const { diff,patch,h,create,VNode,VText } = require('virtual-dom');
const  createElement  = require('virtual-dom/create-element');

/** 常用方法 */
const {  isUdf,
         isDom,
         isObject,
         isString,
         isFunction,
         isEmptyObject,
         isPlainObject,
         isArray } = require('./uilt');

/** 渲染VNode模块 */
var { renderVNode } = require('./renderVNode');

const sliceProp = require('./sliceProp').default;

const warn = require('./warn').default;

(function(){

  const dom = document;

  /** 像私有属性 应该写成function 名字为类似 _get _set 而不要直接暴露在this */
  function Wue(option){

    var that = this;

    /** 需要检测methods是否都是function类型 */
    console.log( option.methods )

    const dom = document;
    this.el = isDom(option.el) ? option.el : isString(option.el) ? dom.querySelector( option.el ) : (console.error('option el error type'));
    /** wue 方法 */
    this.methods = option.methods;
    this.observerdata = option.data;
    this.olddata = JSON.parse( JSON.stringify( this.observerdata ) );
    this.watch = option.watch ? option.watch : {};
    this.data = createObserver(Object.create(null),option.data,that);
    //技术不行 -。- 有什么好办法可以记住模板的模型
    this.noRenderVNode = new renderVNode( this.el ).render( {},that );

    /** 初始化时执行 */
    isFunction( option.beforeCreate ) && option.beforeCreate.apply(this);

    /* 设置组件 and 检查组件 */
    this.components = option.components;
    if(isArray(this.components) && this.components.length>0){
      this.components.forEach(name=>{ 
          var component;
          if( component = Wue.components.get(name) ){
            component.prante = this;
          }else{
            throw Error( `not found this compnent of ${ name }` )
          }
      })
    }
    
    this.vnode = new renderVNode( this.el ).render( this.data,that );
    var patches = diff( that.noRenderVNode,that.vnode );
    patch( that.el , patches );

    /** 初始化时执行 */
    isFunction( option.beforeCreate ) && option.beforeCreate.apply(this);
    
    /**
     * wue.component 可以访问
     * Wue.component 可以访问
     */
    this.__proto__.component = Wue.component;

    // this.prototype.component = Wue.component;
  }

  /** wue 组件（注意不支持横杠驼峰写法，如果a-b 会转为 aB）*/
  Wue.components = new Map();
  
  /** 组件如何局部刷新 */
  Wue.component = function(templateName,option){

    /** 组件必须要传入名称 需要是字符串类型 不能与其他组件名重复*/
    if(!templateName) warn['component-name-is-empty'];
    if(!isString(templateName)) warn['component-name-no-string'];
    if(!Wue.components.get(templateName)) warn['component-name-is-repeat'];
    /** 组件data只能传入Object 或者 function 类型 */
    let data = option.hasOwnProperty('data') ? data : {};
    // if(isFunction(data)) data = data();
    // if(isObject(data)) data = data; 
    // else warn['component-data-error-type']
  
    var temDom = document.createElement('div');
    temDom.innerHTML = option.template;

    /*组件需要有一个标签包裹起来 否则抛出错误*/
    if( temDom.childNodes.length > 1 ) throw Error('please use only tag warp component template');

    let wue = new Wue({
      el:temDom.childNodes[0],
      data:option.data,
    })

    /**组件识标 */
    wue.__isComponent = true
    wue.vnode = new renderVNode( wue.el ).render( wue.data,wue );    
    /**组件存入 WUE */
    Wue.components.set(templateName,wue);
  }

  window.Wue = Wue;
  
  //数据劫持
  function createObserver(observerData,data,wue){

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
        get:function(v){
          return data[x];
        },
        set:function(newValue){
          watch(x,data[x],newValue,wue);
          observer(x,newValue,data,wue)
        },
        enumerable : true,
        configurable : true
      });

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
      'unshift'
    ] 

    let proxpArr = [];

    arrhandles.forEach(v=>{
      Object.defineProperty(arr,v,{
        get:function(){
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

  function observer(key,newValue,observerdata,wue){

      console.log('observer');

      observerdata[key] = newValue; 
      var currentVnode = new renderVNode( createElement( wue.noRenderVNode ) ).render( wue.olddata,wue );
      var updateVnode  =  new renderVNode( createElement( wue.noRenderVNode ) ).render( wue.observerdata,wue );      
      var patches = diff( currentVnode,updateVnode );
      
      
      /*  如果是w-modle元素不更新 以后这块判断会增加更多逻辑 */
      Object.keys(patches).forEach(k=>{
        if( patches[k].vNode && ('domtype' in patches[k].vNode) && patches[k].vNode.domtype){
          if(patches[k].vNode.domtype === 'WModel' || patches[k].vNode.domtype === 'WOnce'){
              delete patches[k]
          } 
        }
      })

      patch( wue.el , patches );
      /** 记录data 为下一次diff的旧data */
      wue.olddata = JSON.parse( JSON.stringify(wue.observerdata) );

  }

})();
