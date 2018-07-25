const getElement = (element,selector) => {
    let found,
        maybeID = selector[0] == '#',
        maybeClass = selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector    
    return (element.getElementById && maybeID) ?
           ((found = element.getElementById(nameOnly) ) ? [found] : []) :
           Array.prototype.slice.call(
             !maybeID && element.getElementsByClassName ?
             maybeClass ? element.getElementsByClassName(nameOnly) :
             element.getElementsByTagName(selector) :
             element.querySelectorAll(selector)
           )
}

module.exports = getElement;