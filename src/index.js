import Wue from './init'

const wue = new Wue({
    el:'#one',
    data:{ 
        x:1,
        y:2,
        a:[{x:1},{y:2}],
        b:[ [[1,2],{a:1}],[[2,3],{b:1}],[[4,5],{c:2}] ],
        c:{mama:'petty',baba:'good'}
    }
})

// wue.set({ new:'hahah' })

// module.exports = {
//     Wue
// }