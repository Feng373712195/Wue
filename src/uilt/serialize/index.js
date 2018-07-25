import HyphenTrunHump from '../hyphenTrunHump'
import HumpTrunHyphen from '../humpTrunHyphen'

const serialize = (obj,fomat,option) => {

    const toHump = (option && option.toHump) || false;
    const toHypen = (option && option.toHypen) || false;
  
    let str = '';
    
    Object.keys(obj).forEach((k)=>{  
        str += fomat ? fomat.replace(/(key)/, toHump? HyphenTrunHump(k) : toHypen? HumpTrunHyphen(k) : k ).replace(/value/,obj[k]) : '';
    })
    return str;
}

export default serialize