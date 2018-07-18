import initEl from './initEl'
import checkOption from './checkOption'
import { diff,patch,create } from '../virtual-dom'
import createObserver from '../observer/createObserver'
import { deep } from '../uilt'
import renderVNode from '../render-vnode'

class Wue{
    
    constructor(option){

        checkOption(option)
        const { el,data,methods } = option
        initEl.bind(this,el)()
        
        // 首次渲染是否完成
        this.init_render = false;

        // 原data 未被wue改动过的data
        this.original_data = data;
        // wue监听的data 用户修改数据也是通过这个data
        this.data = createObserver( Object.create(null),data );
        // 旧的data 每次diff 后就会把存到这个data
        this.old_data = deep( data );

        // 模板未被替换的vnode
        this.no_render_vnode = new renderVNode(this.el).render( {},this );
        // 当前视图的vnode 
        this.vnode = new renderVNode(this.el).render( this.data,this );
        
        /** 初始化完成 vnode生成真实dom挂载到节点上 */
        var createDom = create(this.vnode);
        this.el.parentNode.replaceChild(createDom,this.el);

        /** 初始化渲染完毕 删除这个属性 */
        this.init_render = true;
    }
}

Wue.prototype.set = function(setdata){
    createObserver( this.data,setdata )
}



export default Wue