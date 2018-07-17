const path = require('path');
const koa  = require('koa');
const view = require('koa-view');
const serve  = require('koa-static');
const Router = require('koa-router');
const app = new koa();

var router = new Router();

app.use(view(path.resolve(__dirname,'view'),{ extensions:'html' }));
app.use(serve(__dirname));

router.get('/',async ctx=>{
	await ctx.render('index');
})

app.use(router.routes(),router.allowedMethods());

app.listen('8080',()=>{
	console.log('open 8080');
});