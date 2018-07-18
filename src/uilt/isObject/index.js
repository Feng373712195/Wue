import toString from '../_toString'
const isObject = (val) => typeof val === 'object' && toString.call(val) === '[object Object]';

export default isObject