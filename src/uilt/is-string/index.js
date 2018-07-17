import toString from '../_toString'
const isString = val => typeof val === 'string' && toString.call(val) === '[object String]'

module.exports = isString;

