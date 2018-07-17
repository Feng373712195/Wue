const isDom = (obj) => {
  if (typeof HTMLElement === 'object') {
    return obj instanceof HTMLElement;
  }
  return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
};

module.exports = isDom;
