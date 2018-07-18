import observer from '../observer'
import { isArray,isObject } from '../../uilt'

const observerSetArrData = ( observerArr,originArr ) => {
    observerArr.forEach((v,i)=>{
      Object.defineProperty(observerArr,i,{
        get(){
          if( isArray(originArr[i]) || isObject(originArr[i]) ) return v
          return  originArr[i]
        },
        set(newValue){
          observer(originArr,i,newValue)
        }
      })
    })
}

export default observerSetArrData