import observer from '../observer'

const observerSetArrData = ( observerArr,originArr ) => {
    observerArr.forEach((v,i)=>{
      Object.defineProperty(observerArr,i,{
        get(){ return originArr[i] },
        set(newValue){
          observer(originArr,i,newValue)
        }
      })
    })
}

export default observerSetArrData