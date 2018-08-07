import toString from '../_toString'

const isBoolean = bool => typeof bool === 'boolean' && toString.call(bool) === '[object Boolean]'

export default isBoolean