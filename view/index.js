
const Wue = require('../src/index');

const wue = new Wue({
  el: '#one',
  data: {
    msg: 'hello WUE',
    text: 'AAA',
    html: '<div style="background-color:red; font-size:16px; " >HELLO</div>',
    bg: 'red',
    fontSize: '16',
    show: false,
    arr: [1, 2, 3],
    arr2: { x: '111', y: '222', z: '333' },
    text: 'hello111',
    check: [1, 2],
  },
  methods: {
    hello(value) {
      console.log('hello', value);
      wue.data.text = { x: 1 };
      console.log(wue.data);
    },
  },
});


// setTimeout(()=>{
//     wue.data.msg = 'hello wue 222'
//     wue.data.html = '<div style="background-color:red; font-size:16px;" >HELLO1</div>'
//     wue.data.bg = 'green'
//     wue.data.fontSize = '18'
//     wue.data.show = true
// },1000)

// setTimeout(()=>{
//     wue.data.msg = 'hello wue 333'
//     wue.data.html = '<div style="background-color:red; font-Size:22px; " >HELLO2</div>'
//     wue.data.bg = 'yellow'
//     wue.data.fontSize = '22'
//     wue.data.show = false
// },2000)

// setTimeout(()=>{
//     wue.data.msg = 'hello wue 444'
//     wue.data.html = '<div style="background-color:red; font-Size:26px; " >HELLO3</div>'
//     wue.data.bg = 'blue'
//     wue.data.fontSize = '26'
//     wue.data.show = true
// },3000)


// wue.$set( wue.data,'new','haha' )

// console.log( wue.data )
// console.log( wue.original_data )
