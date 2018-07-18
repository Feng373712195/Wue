import _toString from '../_toString'; 
const isNumber = val => typeof val === 'number' && _toString.call(val) === '[object Number]' && isFinite(val)

module.exports = isNumber;