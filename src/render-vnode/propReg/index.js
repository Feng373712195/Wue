const propReg = (tag, tagname) => {
  // 暴力的检查 标签是否带有属性
  if (`${tag.replace(new RegExp(`${tagname}|\/\s?${tagname}`, 'ig'), '').replace(/\<|\>/g, '')}` === '') {
    return '';
  }

  /** 为了匹配到箭头函数 ([^=>]>) */
  return tag.replace(new RegExp(`^<\s?${tagname}\s?(.+?)/?\s?([^=>]>)`, 'i'), '$1')
    .replace(new RegExp(`^(.+?)<\s?/?\s?${tagname}\s?>`, 'i'), '$1');
};

export default propReg;
