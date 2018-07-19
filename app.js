const path = require('path');
const koa  = require('koa');
const view = require('koa-view');
const serve  = require('koa-static');
const Router = require('koa-router');
const fs = require('fs')

const app = new koa();

var router = new Router();

const readFilePromise = (path,encrypt) => {
    return new Promise((reslove,reject)=>{
        fs.readFile(path,encrypt,(err, data)=>{
			console.log( err )
			if(err) reject(err)
			console.log(data)
            reslove(data) 
        });
    })
}

// app.use(view(path.resolve(__dirname,'view')));
app.use(serve(__dirname));

router.get('/',async ctx=>{
	const htmlContent = await readFilePromise(path.resolve(__dirname,'view/index.html'),'utf8')
	console.log(htmlContent)

	ctx.body = htmlContent
})

app.use(router.routes(),router.allowedMethods());

app.listen('8080',()=>{
	console.log('open 8080');
});