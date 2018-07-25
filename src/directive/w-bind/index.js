import { parseAst } from '../../parse'
import { humpTrunHyphen } from '../../uilt'

const wbind = (vnode,propkey,data,wue) => {

    if( !wue.init_render ){
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
            styleObj[humpTrunHyphen(key)] = value; 
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

export default wbind