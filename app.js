const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const index = require('./routes/index')
const users = require('./routes/users')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

// socket
const Fiora = require('./socket/fiora.js');
const NAMI = require('./socket/nami.js');
const fiora = new Fiora();
const nami = new NAMI();

nami.login()
.then((ret) => {
  console.log('success(nami)');
  nami.join();
  nami.listen('593292a601d3b75ae98a7541', (message) => {
    console.log('接受消息(nami): ', message);
    fiora.send('cr', message.type, message.content)
  })
  nami.listen('59db460c4528507d9baf6485', (message) => {
    console.log('接受消息(fiora): ', message);
    fiora.send('fiora', message.type, message.content)
  })
})

fiora.login('robot', 'robot').then(function () {
   console.log('success');
   fiora.join('cr').catch(function (e) {
       console.log(e);
   });

   fiora.listen('cr', function (message) {
       console.log('cr message:', message);
       nami.sendMessage('593292a601d3b75ae98a7541', message.type, message.content);
   });
   fiora.listen('fiora', function (message) {
       console.log('fiora message: ', message);
       nami.sendMessage('59db460c4528507d9baf6485', message.type, message.content);
   });

}).catch(function (e) {
   console.log(e);
});

module.exports = app
