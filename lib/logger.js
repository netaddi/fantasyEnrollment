const moment = require('moment');
const moment_timezone = require('moment-timezone');

async function log(ctx, next) {
    // console.log(ctx);
    await next();
    const logArray = [
        ctx.request.method,
        ctx.request.url,
        moment().tz('Asia/Shanghai').format(),
        ctx.response.status,
        ctx.ip,
        ctx.header['user-agent'],
        ctx.header['referer'],
        ctx.get("x-forwarded-for"),
        ctx.session.nickname
    ];
    console.log(logArray.join('|'));
}

function getTime() {
    return moment().tz('Asia/Shanghai').format();
}

module.exports.log = log;
module.exports.getTime = getTime;
