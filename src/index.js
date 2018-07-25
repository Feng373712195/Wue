import Wue from './init'

const wue = new Wue({
    el:'#one',
    data:{ 
        msg:'hello WUE',
        text:'AAA'
    }
})

setTimeout(()=>{
    wue.data.text = 'hello wue 222'
},1000)

setTimeout(()=>{
    wue.data.text = 'hello wue 333'
},2000)

setTimeout(()=>{
    wue.data.text = 'hello wue 444'
},3000)

// wue.$set( wue.data,'new','haha' )

// console.log( wue.data )
// console.log( wue.original_data )

module.exports = {
    Wue
}
