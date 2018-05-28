/** WUE 抛出错误 模块 */

const warp = (warpType,componentName)=>{
    
    const warns = {
        'component-name-no-string':"Component name need to pass the type of String type",
        'component-name-is-empty':"Component name Can't be empty",
        'component-name-is-repeat':`<${componentName}> the component name is registered`,
        'component-data-error-type':`<${componentName}> Component data can only be passed in Object and Function type`
    }

    throw Error (warns[warpType]);
}

export default warp;