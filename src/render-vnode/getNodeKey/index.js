        
// 获取Vnode Key
const getNodeKey = (props) =>{
    if(props.hasOwnProperty('key')){
        return props['key'] 
    }else if(props.hasOwnProperty(':key')){
        return findTmpText(`{{ ${props[':key']} }}`,data)
    }else{
        return undefined
    }
}

export default getNodeKey