import findParentData from '../findParentData'

const setTemplateValue = (data,key,value) => {
    // console.log('setTemplateValue')
    const { parent,lastKey } = findParentData(key,data)
    parent[lastKey] = value;
}

export default setTemplateValue