import observer from '../observer'
import { deep,isPlaninObject,isArray,isObject } from '../../uilt'
import setOriginalObject from '../setOriginalObject'
import createObserverArr from '../createObserverArr'

const createObserver = ( observerdata,orginal ) => {
    
    // observerdata = setOriginalObject( orginal , observerdata )

    for(let x in orginal){

        let observerObj;
        if( isPlaninObject(orginal[x]) ){
            observerObj = createObserver( Object.create(null),orginal[x] )
        }

        let observerArr;

        const createObserArrItem = (parentArr,index,item) =>{
            /** 顺序很重要 这里 不然会触发无畏的 observer */
            let arr = deep( item );
            item.forEach((cItem,cIndex) => {
                if(isObject(cItem)) arr.splice( cIndex,1, createObserver( Object.create(null),cItem ) )
                if(isArray(cItem))  arr.splice( cIndex,1, createObserArrItem( item,cIndex,cItem ) )
            })
            arr = createObserverArr( parentArr,index,arr,item )
            return arr;
        }

        if( isArray(orginal[x]) ){
            observerArr = deep( orginal[x] )
            orginal[x].forEach((item,index) => { 
                if(isObject(item)) observerArr.splice( index,1, createObserver( Object.create(null),item ) )
                if(isArray(item))  observerArr.splice( index,1, createObserArrItem(orginal[x],index,item) )
            })
            observerArr = createObserverArr( orginal,x,observerArr,orginal[x] )
        }

        Object.defineProperty(observerdata,x,{
            get(){
                if( isArray(orginal[x])  ) return observerArr;
                if( isObject(orginal[x]) ) return observerObj;
                return orginal[x];
            },
            set(newVal){
                observer(orginal,x,newVal);               
            },
            enumerable : false,
            configurable : false
        })
    }

    return observerdata
}

export default createObserver