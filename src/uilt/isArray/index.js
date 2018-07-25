import toString from '../_toString'
const isArray = obj => ( [].isArray && [].isArray(obj) ) || toString.call(obj) === '[object Array]'

export default isArray