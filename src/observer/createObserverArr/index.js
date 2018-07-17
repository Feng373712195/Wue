import observer from '../observer'
import observerSetArrData from '../observerSetArrData'

const createObserverArr = (setdata,key,observerArr,originArr) => {
    
    const arrhandles = [
        'push',
        'pop',
        'shift',
        'splice',
        'unshift',
        'toString'
    ]
  
    let proxpArr = [];

    arrhandles.forEach(v=>{
        Object.defineProperty(observerArr,v,{
          get:function(){
            if( v === 'toString' ){ 
              return function(){ return JSON.stringify(this) }
            }
            return (...arg)=>{
                    const ret = proxpArr[v].apply(observerArr,arg);
                    proxpArr[v].apply(originArr,arg);
                    observer( setdata,key,originArr);
                    //执行数组的方法后 重新检测数组长度进行监听
                    observerSetArrData( observerArr,originArr )
                    return ret;  
            }
          },
          enumerable : false,
          configurable : false
        })
    })
  
    observerSetArrData( observerArr,originArr )
    return observerArr;

}

export default createObserverArr