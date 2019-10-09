const getWarpHtml = function (dom) {
  const { outerHTML, innerHTML } = dom;
  const fTag = `${outerHTML.substr(0, outerHTML.indexOf(`>${innerHTML}`))}>`;
  const lTag = outerHTML.substr((fTag.length + innerHTML.length), outerHTML.length);

  return `${fTag}${lTag}`;
};

export default getWarpHtml;
