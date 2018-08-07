import observer from '../observer'
import { deep,isPlaninObject,isArray,isObject } from '../../uilt'
import setOriginalObject from '../setOriginalObject'
import createObserverArr from '../createObserverArr'
import checkModel from '../../directive/checkModel'

const createObserver = ( observerdata,orginal,wue ) => {
    
    observerdata = setOriginalObject(  observerdata , orginal )

    for(let x in orginal){

        let observerObj;
        if( isPlaninObject(orginal[x]) ){
            observerObj = createObserver( Object.create(null),orginal[x],wue )
        }

        let observerArr;

        const createObserArrItem = (parentArr,index,item) =>{
            /** 顺序很重要 这里 不然会触发无畏的 observer */
            let arr = deep( item );
            item.forEach((cItem,cIndex) => {
                if(isObject(cItem)) arr.splice( cIndex,1, createObserver( Object.create(null),cItem,wue ) )
                if(isArray(cItem))  arr.splice( cIndex,1, createObserArrItem( item,cIndex,cItem,wue ) )
            })
            arr = createObserverArr( parentArr,index,arr,item,wue )
            return arr;
        }

        const createObserArr = (orginal,x) => {
            const arr = deep( orginal[x] )
            orginal[x].forEach((item,index) => { 
                if(isObject(item)) arr.splice( index,1, createObserver( Object.create(null),item,wue ) )
                if(isArray(item))  arr.splice( index,1, createObserArrItem( orginal[x],index,item,wue ) )
            })
            return createObserverArr( orginal,x,arr,orginal[x],wue )
        }

        if( isArray(orginal[x]) ){
            observerArr = createObserArr(orginal,x)
        }

        Object.defineProperty(observerdata,x,{
            get(){
                if( isArray(orginal[x])  ){
                  // 当重新赋值为数组 把数组进行数据拦截
                  return observerArr ? observerArr : createObserArr(orginal,x)
                }
                if( isObject(orginal[x]) ){
                     return observerObj
                }
                return orginal[x];
            },
            set(newVal){
                observer(orginal,x,newVal,wue);
                checkModel(orginal,x,newVal)              
            },
            enumerable : true,
            configurable : true
        })
    }

    return observerdata
}

export default createObserver