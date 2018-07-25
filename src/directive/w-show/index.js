import { parseAst } from '../../parse' 
import { serialize,isEmptyObject } from '../../uilt'

const wshow = (vnode,propkey,data,wue) => {

    if(isEmptyObject(data)){
        return vnode;
    }

    // if( !wue.init_render ){
    //     return vnode;
    // }
    
    const props = vnode.properties;
    const ret = parseAst(props.attributes[propkey],data);
  
    var styles = props['style'] ? props['style'].split(/\;\s?/):[];
    
    var styleObj = {} 
    
    styles = styles
              .filter( v=>v )
              .map( v=> v ? styleObj[v.split(':')[0]] = `${v.split(':')[1]};`: '' ); 

    if(!!ret){
        // style对象 如果 不为空  判断style是否有dispaly属性 有则删掉
        !isEmptyObject(styleObj) && ( styleObj['display'] && ( delete styleObj['display'] ) );
        props.hasOwnProperty('style') ? (props['style'] = serialize( styleObj,'key:value' ) ) : props['style'] = ''
    }else{
        console.log( props )
        styleObj['display'] = 'none !important;';
        props['style'] = serialize( styleObj,'key:value' );
    }

    return vnode;
}

export default wshow