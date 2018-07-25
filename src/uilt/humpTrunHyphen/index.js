const HumpTrunHyphen = (str) => {
    return str
           .replace(/([A-Z])/g,(s)=>{
             return `-${ s.toLowerCase() }`
           })
 
}

export default HumpTrunHyphen

