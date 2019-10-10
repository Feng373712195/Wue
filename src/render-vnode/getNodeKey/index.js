import findTmpText from '../../parse/findTmpText';

// 获取Vnode Key
const getNodeKey = (props, data) => {
  if (props.hasOwnProperty('key')) {
    return props.key;
  } if (props.hasOwnProperty(':key')) {
    return findTmpText(`{{ ${props[':key']} }}`, data);
  }
  return undefined;
};

export default getNodeKey;
