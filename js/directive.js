const createElement  = require('virtual-dom/create-element'); 
const { VNode,VText, } = require('virtual-dom');

/** 查找模板数据模块 */
const findTmpText = require('./findTmpText').default;

/*
* directive 方法等写成构造模式 
* 每个组件需要拥有自己一个 directive函数 
*/
console.log( 'directive' );

/** 常用方法 */
const {  isUdf,
    isObject,
    isString,
    isEmptyObject,
    isPlainObject,
    isArray,
    isTrue,
    isFalse,
    serialize,
    HyphenTrunHump } = require('./uilt');

/** Wue 解析模块 */
const { getTemplateValue,
        setTemplateValue,
        parseAst,parseWforAst,parseWOn } = require('./parse.js')

/* CSSStyleDeclaration */
var styles = window.getComputedStyle(document.documentElement, '');

/* wue指令管理者 */
const wueInDirective = { };

/* [w-if w-else w-else-if] wedget数组 */
let wIftodo = [];

/* 调用w-if 次数 */
let wIfcount = 0;

/* 调用w-model 次数*/
let wModelcount = 0;

/* 存储wModel Node数组 */
const vModelNodes = [];

const wOnNodes = [];

/* wModel 的方法 始终只引用这么一个 因为需要removeEventLister */
var wModelHandle = function(data,modle,wue,e){
    setTemplateValue(wue.data,modle,this.value);
    this.value = getTemplateValue(wue.observerdata,modle,modle); 
}

//委托事件
function EntrustHandle (node,handles,wue,e){
    if(e.target === node){
        if(handles){
            handles.forEach( f => f() );
        }
    }
}

wueInDirective['w-show'] = (vnode,propkey,data,wue) => { 

  if(isEmptyObject(data)){
      return vnode;
  } 

  const props = vnode.properties;
  const ret = parseAst(props.attributes[propkey],data);

  var styles = props['style'] ? props['style'].split(/\;\s?/):[];
  var styleObj = {} 

  styles = styles
            .filter( v=>v )
            .map( v=> v ? styleObj[v.split(':')[0]] = `${v.split(':')[1]};`: '' ); 

    if(!!ret){
        !isEmptyObject(styleObj) && 
        ( styleObj['display'] && ( delete styleObj['display'] ) );
        props.hasOwnProperty('style') && (props['style'] = serialize( styleObj,'key:value' ) )
    }else{
        styleObj['display'] = 'none !important;';
        props['style'] = serialize( styleObj,'key:value' );
    }

    return vnode;

}

wueInDirective['w-html'] = (vnode,propkey,data,wue) => {
  
  if(isEmptyObject(data)){
        return vnode;
  }

  let props = vnode.properties
  let modle = props.attributes[propkey];
  // modle = getTemplateValue(data,modle,modle);
  var ret = parseAst(modle,data)
  props.innerHTML = ret;

  return vnode;

}

wueInDirective['w-text'] = (vnode,propkey,data,wue) => {

  if(isEmptyObject(data)){
      return vnode;
  }

  let props = vnode.properties;
  let modle = props.attributes[propkey];
  var ret = parseAst(modle,data)
  props.innerText = ret;

  return vnode;

}

wueInDirective['w-bind'] = (vnode,propkey,data,wue) => {

  if(isEmptyObject(data)){
      return vnode; 
  }

  const props = vnode.properties;
  const bindProp = propkey.replace(/^w-bind\:|^\:/,'');
  const modle = props.attributes[propkey];
  var ret = parseAst(modle,data);

  /** 
   *  我觉得 :class 与 :style 只能够传一层
   *  所以暂时不管嵌套的操作
   **/

  /* w-bind:class 的处理 */
  if( bindProp === 'class' || bindProp === 'CLASS' ){

      const strToClassObj = (str)=>{
        return (str || '').split(' ').filter( v => v );
      }


      /* class 重复的 应该重叠掉 */
      if(isArray(ret)){

        ret = [...new Set( [].concat(strToClassObj(props['className']),ret) )].join(' ')
      
      }else if(isObject(ret)){

        const p = [];
        Object.keys(ret).forEach(k=>{ !!ret[k] && p.push(k) });
        /*Set 数据结构 过滤掉重复的class*/
        ret = [...new Set( [].concat(strToClassObj(props['className']),p) )].join(' ')
      
      }else if(isString(ret)){

        ret = [...new Set( [].concat(strToClassObj(props['className']),strToClassObj(ret)) )].join(' ')
      
      }else{

        throw new Error(`w-bind:class nonsupport type "${ret}" `)

      }

  }

   /* w-bind:style 的处理 */
  if( bindProp === 'style' || bindProp === 'STYLE' ){

    const strToStyleObj = (str)=>{
      let styleObj = {};
      (str || '').split(';').filter( v => v )
      .map( s =>{
        let [ key,value ] = s.split(':');
        styleObj[HyphenTrunHump(key)] = value; 
      });
      return styleObj;
    }

    const domStyle = strToStyleObj(props['style']);   

    /* style 重复的 应该重叠掉 重叠的规则为CSS的就近原则 */
    if(isArray(ret)){
      
      //数组嵌套 数组
      //数组嵌套 对象 
      //数组嵌套 字符串

      ret = ret
            .map(v=>{ 
                if(isObject(v)){
                    /* 去除掉一些不存在的style 属性 */
                    Object.keys(v).forEach( k=> !styles[k] && delete v[k] );
                    return v
                }else{
                    return v;
                }
            })

      ret =  serialize( ret.reduce( v=> Object.assign(domStyle,v) ) ,'key:value; ',{ toHypen:true });

    }else if(isObject(ret)){

      //对象嵌套 数组 
      //数组嵌套 对象 
      //对象嵌套 字符串

      ret = Object.assign(domStyle,ret);
      
      /* 去除掉一些不存在的style 属性 */
      Object.keys(ret).forEach( k=> !styles[k] && delete ret[k] );
      /* 格式化 */
      ret = serialize(ret,'key:value; ',{ toHypen:true })

    }else{

      ret = `${props['style']} ${ret}`;
    
    }

  }

  props.attributes[bindProp] = ret

  return vnode;

}

wueInDirective['w-if'] = (vnode,propkey,data,wue) =>{

  if(isEmptyObject(data)){
      return vnode; 
  }

  //统计wue 执行过多少次 w-if
  wIfcount++;

  //w-if 嵌套 w-if
  const props = vnode.properties;
  const condition = props.attributes[propkey];
  const parseCondition = parseAst(condition,data)
                                                                  
  wIftodo.push( {} );
  const currtIftodo = wIftodo[wIfcount-1];
  currtIftodo.count = 1;
  currtIftodo.ifconditions = [ isFalse(parseCondition) ? false : isTrue(parseCondition) ];
  currtIftodo.renderNode = function(vnode){
    const idx = this.ifconditions.indexOf(true);
    let count = this.count;
    const rendernode = ( idx !== -1 && idx === (count-1) ) ? vnode : new VText('')
    ++this.count;
    return rendernode;
  } 

  return currtIftodo.renderNode.bind(currtIftodo)();

}

wueInDirective['w-else'] = (vnode,propkey,data,wue) =>{

  if(isEmptyObject(data)){
      return vnode; 
  }

  const currtIftodo = wIftodo[wIfcount-1];
  currtIftodo.ifconditions.push(true);

  return currtIftodo.renderNode.bind(currtIftodo,vnode)();

}

wueInDirective['w-else-if'] = (vnode,propkey,data,wue) =>{

  if(isEmptyObject(data)){
      return vnode; 
  }

  const props = vnode.properties;
  const condition = props.attributes[propkey];
  const parseCondition = parseAst(condition,data)

  const currtIftodo = wIftodo[wIfcount-1];
  currtIftodo.ifconditions.push( isFalse(parseCondition) ? false : isTrue(parseCondition) );

  return currtIftodo.renderNode.bind(currtIftodo,vnode)();

}

wueInDirective['w-for'] = (vnode,propkey,data,wue) =>{

  if(isEmptyObject(data)){
      return vnode; 
  }

  console.log('w-for');
  
  // w-for 嵌套 w-for // 暂时解决
  // w-for 中的 w-bind
  // w-for 中有 w-model 双向数据绑定  
  // w-for 数据变动 w-for不会重新渲染 // 目前可以
  
  const props = vnode.properties;
  const condition = props.attributes[propkey];
  const ret = parseWforAst(condition,data);

  const vnodes = [];
  const nestForVnode = [];

  let d = ret.data,
      v = ret.value,
      i = ret.index,
      k = ret.key;

  const isVnode = (n) => n.constructor === VNode;
  const isVtext = (n)=> n.constructor === VText;
  /* 深拷贝Vnode 切断关系 */
  const deepCloneVnode = (root)=>{ 
    isVnode(root) && ( root = Object.assign(new VNode(),root) ).children.length > 0 && ( root.children = [].concat(root.children.map(n=>{
       if(isVnode(n)) return deepCloneVnode( n );
       if(isVtext(n)) return Object.assign(new VText(),n);
       /*数组中如果是Vnode 也要拷贝*/ 
       if(isArray(n)) return [].concat( n.map( n=>deepCloneVnode(n) ) );
    })) );

    return root;
 
  }

  const forRenderHandler = (wue,node,fordata,data) =>{

   const blendData = Object.assign(data,fordata);
   const nestForHandler = [];
   node.children.map((childnode,index)=>{
        if( isVtext(childnode) && childnode.text.trim() ){
            childnode.text = findTmpText(childnode.text,blendData)
            return childnode;
        }
        /*是否嵌套for 的渲染操作*/
        if( isVnode(childnode) && !childnode.properties.attributes['w-for'] ){
            return forRenderHandler(wue,childnode,fordata,data);
        }else if( isVnode(childnode) && childnode.properties.attributes['w-for']  ){
            let forVnodes = handleWueInDirective(wue,blendData,childnode);
            nestForHandler.push( () => { node.children.splice.apply(node.children,[index,1,...forVnodes]) });
        }else{
            return childnode;
        }
   })

   nestForHandler.map( h => { h(); h = null; return h } ).filter( v => v );

   return node;

  } 

  let forvnodes = [];

  Object.keys(d).forEach((key,index)=>{

      let fordata = {};
      i && ( fordata[i] = index );
      k && ( fordata[k] = key );
      v && ( fordata[v] = d[key] );

      let cloneVnode = deepCloneVnode(vnode);
      cloneVnode.properties.attributes['w-for'] = ret.expression;
      forvnodes.push( forRenderHandler(wue,cloneVnode,fordata,data)  );
  })


  return forvnodes; 

}

/** 以下会把 vnode 转成 wight 的指令 */

/* wue 绑定事件指令 */
wueInDirective['w-on'] = (vnode,propkey,data,wue) => {
    
    /**初始化时搬定事件 */
    if(isEmptyObject(data)){
        return vnode;
    }

    const props = vnode.properties;
    const EventType = propkey.replace(/^\@|^w-on:/,'');
    const EventHandle = props.attributes[propkey]
    // console.log( parseWOn( EventHandle,wue.data ) );    
    //diff 后会重新绑定事件问题 
    //@event 写入属性报错问题
    var WOnWidget = function (){};
    WOnWidget.prototype.type = "Widget";

    //组件的wue.el 就是一个dom节点 并没有挂载在docment上
    //所以组件在wue.el绑定事件 只是一个dom上绑定事件 在html点击对应dom是没有反应的
    WOnWidget.prototype.init = function(){
        let node = createElement( new VNode(vnode.tagName,vnode.properties,vnode.children) );
        // EntrustHandle (node,eventtype,methodName,wue,e)
        let bindEl = wue.__isComponent?wue.prante.el:wue.el;
        bindEl.addEventListener(EventType,EntrustHandle.bind(bindEl,node,parseWOn( EventHandle,wue.data,wue ),wue));
        return node;
    }
    WOnWidget.prototype.update = function(){
        console.log('update');  
    } 
    WOnWidget.prototype.destroy = function(node){
        //组件销毁应该清除事件
        console.log('destroy');
    }

    return new WOnWidget();

}

wueInDirective['w-model'] = (vnode,propkey,data,wue) => {

    if(isEmptyObject(data)){
        return vnode;
    }
    
    const modle = vnode.properties.attributes[propkey];
    if(vnode.tagName === 'INPUT'){  
        
        const modle = vnode.properties.attributes[propkey];

        var WModleWidget = function (){};
        WModleWidget.prototype.type = "Widget";
        WModleWidget.prototype.domtype = 'WModel'
        WModleWidget.prototype.init = function(){
            let input = createElement( new VNode(vnode.tagName,vnode.properties,vnode.children) );
            input.value = getTemplateValue(wue.observerdata,modle,modle);
            input.addEventListener('input',wModelHandle.bind(input,data,modle,wue))
            return input;
        }
        WModleWidget.prototype.update = function(){
            console.log('update');  
        } 
        WModleWidget.prototype.destroy = function(input){
            //组件销毁应该清除事件
            console.log('destroy');
            input.removeEventListener('input', wModelHandle)
        }
        return new WModleWidget();

    }else{

        return vnode;
    }

} 

wueInDirective['w-once'] = (vnode,propkey,data,wue) => {

    if(isEmptyObject(data)){
        return vnode; 
    }
  
    var WOnceWidget = function (){};
    WOnceWidget.prototype.type = "Widget";
    WOnceWidget.prototype.domtype = 'WOnce'
  
    WOnceWidget.prototype.init = function(){
      let node = createElement( new VNode(vnode.tagName,vnode.properties,vnode.children) );
      return node;
    }
  
    return new WOnceWidget();
  
}
  

const handleWueInDirective = (wue,data,vnode)=>{

    const props = vnode.properties;
    /** priorityDirective 存放不会转成wight的指令 , laterDirective 则相反 */
    const priorityDirective = [], laterDirctive = [];

    // w-model 其实也属于 w-on 其实就是表单 用input或者change 做成双向数据绑定。 
    // wue-directive处理的顺序是编写渲染模板的人对指令设置的顺序。
    // w-model w-once w-on 会把vnode 写成 widget Function 设置为最后
    
    /** 为处理的指令调整下顺序 */
    Object.keys(props.attributes).forEach(propkey=>{
       /* w-bind:属性 与 :属性 交给 w-bind 处理 */ 
       if( propkey.match(/^w-bind|^\:/) ) priorityDirective.push( { directive:'w-bind',propkey } )
       /* @event 会在prop 处理中 变成 w-on:event 因为@event setAttibute 会报错 */
       else if( propkey.match(/^w-on|^\@/) ) laterDirctive.push( { directive:'w-on',propkey } )
       else if( propkey === 'w-model' || propkey === 'w-once' ) laterDirctive.push( { directive:'w-model',propkey} )
       else priorityDirective.push( { directive:propkey,propkey } )
    })

    priorityDirective.concat(laterDirctive).forEach(prop =>{
        wueInDirective[prop.directive] && (vnode = wueInDirective[prop.directive](vnode,prop.propkey,data,wue) );
    })

    return vnode;

}

module.exports  = {
    handleWueInDirective
}



