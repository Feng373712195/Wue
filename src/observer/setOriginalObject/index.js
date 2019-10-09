/** 设置源对象
 * @param origin {Object} 源对象
 * @param data {Object} 要设置的对象
 * @returns data
*/
const setOrginalObject = (data, origin) => {
  Object.defineProperty(data, 'getOriginalObject', {
    get(v) {
      return origin;
    },
    enumerable: false,
    configurable: true,
  });

  return data;
};

export default setOrginalObject;
