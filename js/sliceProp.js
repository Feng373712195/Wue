const propMap = {

    'tabindex': 'tabIndex',
    'readonly': 'readOnly',
    'for': 'htmlFor',
    'class': 'className',
    'maxlength': 'maxLength',
    'cellspacing': 'cellSpacing',
    'cellpadding': 'cellPadding',
    'rowspan': 'rowSpan',
    'colspan': 'colSpan',
    'usemap': 'useMap',
    'frameborder': 'frameBorder',
    'contenteditable': 'contentEditable'
  
  }

export default function (str){
    
    let propsObj = { 
      attributes:{}
    }; 
    
    if(!str) return  propsObj;

    let p = str.split(' ').filter(v=>v);

    // -.- 蹩脚正则表达式
    // let props = str.split(/\"\s+/).filter(v=>v);  
    let propkey = '';

    p.forEach(props=>{

      props = str.split(/\s*\w+\=\'|\"/);
      /* 判断是否是指令 */
      if(props.length == 1){
        propkey = props[0].substring(0,props[0].length-1).trimLeft()
        propkey = propMap[propkey] ? propMap[propkey] : propkey
        propsObj.attributes[propkey] = '';
      /* 有值的属性 */
      }else{
       
        props.forEach( (v,i)=>{
          if( i%2 === 0 ){
            propkey = v.substring(0,v.length-1).trimLeft()
            // setAttrbute @click属性 会报错 与到@开头的属性 改写为 w-on
            if( propkey.match(/^@/) ) propkey = propkey.replace(/^@/,'w-on:');
            propkey = propMap[propkey] ? propMap[propkey] : propkey
          }else{
            if(/data-|w-|^:|^@/.test(propkey)){
              propsObj.attributes[propkey] = v;
            }else{
              propsObj[propkey] = v;
            }
          }
        })
        
      }

    })

    return propsObj;
  
  }