/** 常用方法 */
import { isObject, isArray, isEmptyObject } from '../../uilt';
import getTemplateValue from '../getTemplateValue';

/** 寻找要渲染的模板模型 */
export default function (text, data, isprint) {
  const tlpReg = /\{\{(.*?)\}\}/;

  let tmpval;
  let match = '';

  if (text.trim() != '' && !isEmptyObject(data)) {
    while (match = tlpReg.exec(text)) {
      // tmpval = getTme( match[1],data,isprint );
      /** 2018-7-14修改为 */
      tmpval = getTemplateValue(data, match[1], match[1]);
      text = text.replace(match[0], (isArray(tmpval) || isObject(tmpval)) ? JSON.stringify(tmpval) : tmpval);
    }
  }

  return text;

}
