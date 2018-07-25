import toString from '../_toString';
const isFunction = (fun) => typeof fun === 'function' && toString.call(fun) === '[object Function]';

export default isFunction
  