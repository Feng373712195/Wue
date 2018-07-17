import initEl from './initEl'
import checkOption from './checkOption'
import createObserver from '../observer/createObserver'
import { deep } from '../uilt'

class Wue{
    
    constructor(option){
        
        checkOption(option)
        const { el,data } = option
        initEl.bind(this,el)()
        
        /** 原data 未被wue改动过的data */
        this.original_data = data;
        /** wue监听的data 用户修改数据也是通过这个data */
        this.data = createObserver( Object.create(null),data );
        /** 旧的data 每次diff 后就会把存到这个data */
        this.old_data = deep( data );

        /** 模板未被替换的vnode */
        this.no_render_vnode = {};
        /** 当前视图的vnode */
        this.vnode = {};

        // console.log( this.data.b[0] )

        // this.data.a[0] = '123' 
        // this.data.b[0].push('aaa')
        // this.data.b[0].push('aaa')
        // this.data.b[0].push('aaa')

        // this.data.b.push('bbb')
        // this.data.b.push('bbb')
        // this.data.b.push('bbb')
        
        // this.data.c.mama = 'coll'
        // this.data.c.mama = 'coll1'
        // this.data.c.mama = 'coll2'

        console.log( this.data )
        console.log( this.original_data )

        // this.vnode = new renderVNode(this.el).render( {},this )

    }
}


export default Wue