import {
  isDom, isObject, isString, isFunction,
} from '../uilt';
import warns from '../warn';

const checkOption = (option) => {
  if (!option) warns['no-options'];
  if (!isObject(option)) warns['options-not-object'];

  if (!option.el) warns['no-option-el'];
  console.log(isDom(option.el));
  console.log(isString(option.el));
  if (!(isDom(option.el) || isString(option.el))) warns['option-el-errortype'];

  if (!option.data) warns['no-option-data'];
  if (!(isObject(option.data) || isFunction(option.data))) warns['option-data-errortype'];
};

export default checkOption;
