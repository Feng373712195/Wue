import { parseAst } from '../../parse' 
import { serialize } from '../../uilt'

const wshow = (vnode,propkey,data,wue) => {

    if( !wue.init_render ){
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

export default wshow