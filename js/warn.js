/** WUE 抛出错误 模块 */

const warn = (warpType,componentName)=>{
    


    const warns = {
        'component-name-no-string':"Component name need to pass the type of String type",
        'component-name-is-empty':"Component name Can't be empty",
        'component-name-is-repeat':`<${componentName}> the component name is registered`,
        'component-option-not-object':`Component of <${componentName}> need to pass the type of Object type`,
        'component-data-error-type':`<${componentName}> Component data can only be passed in Object and Function type`,
        'component-not-singletage-warp':`<${componentName}> Please use single tag warp component template content`
    }

    throw Error (warns[warpType]);
}

export default warn;