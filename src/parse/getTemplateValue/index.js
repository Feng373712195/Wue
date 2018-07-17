const getTemplateValue = (data,key,tmp) => {
    // console.log('getTemplateValue')
    const { parent,lastKey } = findParentData(key,data)    
    return parent[lastKey] ? parent[lastKey] : tmp;
}

export default getTemplateValue