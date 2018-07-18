const isPlainObject = (obj) => obj ? Object.getPrototypeOf(obj) === Object.prototype : false

export default isPlainObject