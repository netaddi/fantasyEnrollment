const Koa = require('koa');
const Router = require('koa-router');
const serve = require('koa-static');
const koaBody = require('koa-body');
const mongo = require('koa-mongo');
const session = require('koa-session');
const views = require('koa-views');
// const render = require('koa-views-render');

const config = require('./config/config');
const logger = require('./lib/logger');
const requestProcessor = require('./lib/requestProcessor');
const staticCache = require('koa-static-cache');

const app = new Koa();
const router = new Router();
// let files = {};

router.post('/joinus', requestProcessor.newMember);
router.get('/getInfo', requestProcessor.getInfo);
router.get('/getMemberList', requestProcessor.getMemberList);
router.get('/newMember/:id', requestProcessor.getMember);
router.get('/scheduleInterview', requestProcessor.scheduleInterview);
router.post('/login', requestProcessor.login);
router.post('/reg', requestProcessor.reg);
router.post('/postComment/:id', requestProcessor.commentMember);
router.post('/pay/:id', requestProcessor.pay);
router.post('/changeInterviewTime/:id', requestProcessor.changeTime);

const viewOptions = {
    extension: 'hbs',
    map: {
        hbs: 'handlebars'
    },
    options: {
        helpers: {
            renderText: (str) => {
                return str
                    .replace(new RegExp('\r?\n','g'), '<br/>')
                    .replace(new RegExp(' ','g'), '&nbsp;') ;
            }
        }
    }
};

app.keys = config.appKeys;
app
    .use(logger.log)
    .use(session(config.sessionConfig, app))
    .use(koaBody())
    .use(mongo(config.db))
    .use(views(__dirname + '/views', viewOptions))
    .use(router.routes())
    .use(router.allowedMethods())
    .use(staticCache('./public'))
    .use(serve('./public'));

const port = config.port;

app.listen(port);


console.log(`server listening on port ${port}`);
