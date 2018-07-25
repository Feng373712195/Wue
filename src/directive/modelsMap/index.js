
class wmodelsMap{

    constructor(){
        this.wmodels = {}
    }

    setWmodel(type,parentOriginal,lastKey){
        
        if(!this.wmodels.hasOwnProperty(type)){
            this.wmodels[type] = new Map()
        }

        let wmodelsMap = this.wmodels[type].has(parentOriginal) ?
                         this.wmodels[type].get(parentOriginal) : 
                         this.wmodels[type].set(parentOriginal,new Map()) && this.wmodels[type].get(parentOriginal);
    
        return wmodelsMap.has(lastKey) ? 
               wmodelsMap.get(lastKey) :
               wmodelsMap.set(lastKey,[]) && wmodelsMap.get(lastKey);
    }

    getWmodel(type){
        return this.wmodels[type]
    }

    delWmodel(type,doc,parentOriginal,lastKey){ 
        const modelsMap = this.getWmodel(type)
        const haveModels = modelsMap.get(parentOriginal)
        const models = haveModels.get(lastKey)

        models.splice( models.indexOf(doc),1)
        models.length === 0 && haveModels.delete(lastKey)

        if( [...haveModels].length  === 0 ){
            modelsMap.delete(parentOriginal)
            this.wmodels[type] = null;
            delete this.wmodels[type]
        }
    }

}

export default wmodelsMap