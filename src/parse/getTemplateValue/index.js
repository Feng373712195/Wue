import findParentData from '../findParentData';
import { isUndefined } from '../../uilt';

const getTemplateValue = (data, key, tmp) => {
  // console.log('getTemplateValue')
  const { parent, lastKey } = findParentData(key, data);
  return isUndefined(parent[lastKey]) ? tmp : parent[lastKey];
};

export default getTemplateValue;
