/** 设置源对象 
 * @param origin {Object} 源对象
 * @param data {Object} 要设置的对象
 * @returns data
*/
const setOrginalObject = (origin,data) => {

    Object.defineProperty(data,'getOriginalObject',{
        get:function(v){
            return origin
        },
        enumerable : false,
        configurable : false
    });

    return data;
}

export default setOrginalObject