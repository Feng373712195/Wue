// const acorn = require('acorn')

const acorn = require('acorn')

console.log( acorn )

function findParentData(key,data){

    const ast = acorn.parse(`data.${key}`)  
    const expression = ast.body[0].expression
  
    if( !(expression && expression.type === 'MemberExpression') ){
      console.error('key no memberExpression')
    }
    
    const lastKey = expression.property.value || expression.property.name;
    const dataRoot = { parent:data,def:1 };
    const dataLink = [];
    let loopCurrtObj = expression;
    let currtParent = dataRoot;
  
    while( loopCurrtObj.type === "MemberExpression" && loopCurrtObj.hasOwnProperty('object') ){
      loopCurrtObj = loopCurrtObj.object
      if(loopCurrtObj.type === "MemberExpression")
         dataLink.push({  
                          computed:loopCurrtObj.computed,
                          name: loopCurrtObj.property.name || loopCurrtObj.property.value
                      })
    }
  
    dataLink.reverse().forEach( link =>{
       currtParent = currtParent.next = { parent:currtParent.parent[link.name],def:currtParent.def + 1 }
    })
    return  { parent:currtParent.parent,lastKey } 
}

export default findParentData