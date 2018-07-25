const getWarpHtml = function(dom){
    let { outerHTML,innerHTML } = dom;
    var fTag = outerHTML.substr( 0,outerHTML.indexOf( '>' + innerHTML )) + '>';
    var lTag = outerHTML.substr( ( fTag.length + innerHTML.length) , outerHTML.length );

    return `${fTag}${lTag}`
}

export default getWarpHtml;