const moment = require('moment');
const momentTimezone = require('moment-timezone');
const config = require('../config/config');
const logger = require('./logger');
const md5 = require("md5");
const mongo = require('koa-mongo');
const pdfPacker = require('./pdfPacker');
const escape = require('escape-html');

// function escape(str) {
//     return str
//         // .replace(new RegExp('\r?\n','g'), '<br />')
//         // .replace(new RegExp('\s','g'), '&nbsp;');
// }

async function processNewMember(ctx, next) {
    const newMemberJson = ctx.request.body;
    newMemberJson['time'] = moment().tz('Asia/Shanghai').format();
    newMemberJson['paid'] = false;

    console.log(newMemberJson);
    const dbResult = await ctx.mongo.db('fantasy')
        .collection('newMembers')
        .insertOne(newMemberJson);

    if (dbResult.insertedCount === 1){
        ctx.body = "success"
    }
}

async function getEnrollInfo(ctx, next) {
    // const memberCount = await ctx.mongo.db('fantasy')
    //     .collection('newMembers')
    //     .find({"ifJoinDepartment": "是"})
    //     .count();
    // const available = memberCount < config.memberLimit;

    ctx.body = {
        // interviewDays: config.interviewDays,
        // interviewSlots: config.interviewTimeSpans,
        interviewTimeSlots: config.interviewDaysAndTimeSlots,
        departInfo: config.departmentList,
        // interviewAvailable: available
    };
}

async function getMemberList(ctx, next) {
    const attributeList = ['_id', 'name', 'nickname', 'sex', 'studentId', 'qq', 'phoneNumber', 'ifJoinDepartment', 'interviewTime',
    'group1', 'group2', 'group3', 'department1', 'department2', 'department3'];
    const memberList = await ctx.mongo.db('fantasy')
        .collection('newMembers')
        .find({}).toArray();

    if (ctx.session.nickname) {
        ctx.body = [attributeList].concat(
            memberList.map(member => {
                let cellList = attributeList.map(attribute => {
                    return member[attribute];
                });
                // cellList.push([1, 2, 3].map(groupId => {
                //     return member['group' + groupId];
                // }).filter(group => {
                //     return group
                // }));
                return cellList;
            })
        );
    } else {
        ctx.body = 'login';
    }
}

function extractQuestions(member) {
    return config.departmentList.map((department, departId) => {
        const groupQuestions = department.groups.map((group, groupId) => {
            return group.questions.map((question, questionId) => {
                return {
                    questionContent: question,
                    questionId: `depart${departId}group${groupId}question${questionId}`,
                    from: group.name
                }
            });
        }).reduce((x, y) => {
            return x.concat(y);
        });
        let departQuestions = [];
        if (department.questions){
            departQuestions = department.questions.map((question, questionId) => {
                return {
                    questionContent: question,
                    questionId: `depart${departId}question${questionId}`,
                    from: department.department
                }
            });
        }
        return groupQuestions.concat(departQuestions);
    }).reduce((x, y) => {
        return x.concat(y);
    }).filter(question => {
        return member[question.questionId];
    }).map(question => {
        question['answer'] = escape(member[question.questionId]);
        return question;
    });
}

function getInterviewTimeList() {
    if (config.useSeparateSlotsInDays) {
        return config.interviewDaysAndTimeSlotsForChange.map(dayWithSlots => {
            return dayWithSlots.slots.map(slot => {
                return dayWithSlots.day + slot
            });
        }).reduce((x, y) => {
            return x.concat(y);
        })
    } else {
        // TODO: finish another scenario.
        return [];
    }
}

async function getMemberInfo(ctx, next) {
    if (ctx.session.nickname) {
        const memberQuery = await ctx.mongo.db('fantasy')
            .collection('newMembers')
            .find({_id: mongo.ObjectId(ctx.params.id)})
            .toArray();
        const memberRecord = memberQuery[0];
        memberRecord['joinDepartment'] = memberRecord.ifJoinDepartment === '是';
        memberRecord['extraQuestions'] = extractQuestions(memberRecord);
        memberRecord['interviewTimeList'] = JSON.stringify(getInterviewTimeList());
        memberRecord['freeTalk'] = memberRecord['freeTalk'] ?
            escape(memberRecord['freeTalk']) : '';
        await ctx.render('newMember', memberRecord);

    } else {
        ctx.body = 'login';
    }
}

async function processReg(ctx, next) {
    const regJson = ctx.request.body;
    console.log(regJson);
    if (regJson.inviteCode === config.regCode){
        const memberCount = await ctx.mongo.db('fantasy')
            .collection('managers').find({nickname: regJson.nickname})
            .count();
        if (memberCount > 0) {
            ctx.body = "该昵称已被注册";
        } else {
            const dbResult = await ctx.mongo.db('fantasy')
                .collection('managers')
                .insertOne({
                    nickname: regJson.nickname,
                    password: md5(regJson.password)
                });
            if (dbResult.insertedCount === 1){
                ctx.body = "success";
            } else {
                ctx.body = "failed";
            }
        }
    } else {
        ctx.body = "邀请码不正确";
    }
}

async function processLogin(ctx, next) {
    const loginJson = ctx.request.body;
    console.log(loginJson);

    const userRecord = await ctx.mongo.db('fantasy')
        .collection('managers')
        .find({nickname: loginJson.nickname}).toArray();
    if (userRecord.length < 1) {
        ctx.body = "昵称不存在";
    } else {
        if (userRecord[0].password === md5(loginJson.password)){
            ctx.body = 'success';
            ctx.session.nickname = loginJson.nickname;
        } else {
            ctx.body = '密码错误';
        }
    }
}

async function commentMember(ctx, next) {
    if (ctx.session.nickname) {
        const memberId = ctx.params.id;
        const comment = ctx.request.body['comment'];
        const dbResult = await ctx.mongo.db('fantasy')
            .collection('newMembers').updateOne(
                { _id: mongo.ObjectId(memberId) },
                {
                    $push: {
                        comments: {
                            content: comment,
                            user: ctx.session.nickname,
                            time: logger.getTime()
                        }
                    }
                });
        if (dbResult.modifiedCount) {
            ctx.body = 'success';
        }
    }
}

async function pay(ctx, next) {
    if (ctx.session.nickname) {
        const memberId = ctx.params.id;
        const dbResult = await ctx.mongo.db('fantasy')
            .collection('newMembers').updateOne(
                { _id: mongo.ObjectId(memberId) },
                {
                    $set: {
                        paid: true
                    }
                });
        if (dbResult.modifiedCount) {
            ctx.body = 'success';
        }
    }
}

async function scheduleInterviews(ctx, next) {
    if (ctx.session.nickname) {
        const members = await ctx.mongo.db('fantasy')
            .collection('newMembers')
            .find({interviewTime: null}).toArray();

        const timeSlots = config.interviewDaysAndTimeSlots.map(day => {
            return day.slots.map(slot => {
                return day.day + slot
            })
        }).reduce((x, y) => {
            return x.concat(y)
        }).reduce((obj, current) => {
            obj[current] = [];
            return obj
        }, {});


        const timeSchedule = members.reverse().map(member => {
            let interviewTime = '未安排面试';
            if (member.freeTime.length > 0) {
                interviewTime = member.freeTime.reduce((t1, t2) => {
                    return timeSlots[t1].length <= timeSlots[t2].length ? t1 : t2;
                });
                timeSlots[interviewTime].push(member);
            }
            return {
                memberId: member._id,
                interviewTime: interviewTime
            };
        });

        const rescheduleCount = 300;
        for (let i = 0; i < rescheduleCount; i++) {
            const slotToMoveFrom = Object.keys(timeSlots).reduce((s1, s2) => {
                return timeSlots[s1].length > timeSlots[s2].length ? s1 : s2 ;
            });
            const membersWithMinSlot = timeSlots[slotToMoveFrom].map(member => {
                member.minAssignedSlot = member.freeTime.reduce((s1, s2) => {
                    return timeSlots[s1].length < timeSlots[s2].length ? s1 : s2 ;
                });
                return member;
            });
            const memberToMove = membersWithMinSlot.reduce((member1, member2) => {
                return member1.minAssignedSlot.length < member2.minAssignedSlot.length ? member1 : member2 ;
            });
            const moveToSlot = memberToMove.minAssignedSlot;
            memberToMove.interviewTime = moveToSlot;
            timeSlots[moveToSlot].push(memberToMove);
            timeSlots[slotToMoveFrom] = timeSlots[slotToMoveFrom].filter(member => {
                return member !== memberToMove;
            });
        }

        timeSchedule.forEach(member => {
            const writeResult = ctx.mongo.db('fantasy')
                .collection('newMembers')
                .updateOne(
                    { _id: mongo.ObjectId(member.memberId) },
                    {
                        $set: {
                            interviewTime: member.interviewTime
                        }
                    }
                );
            console.log(writeResult);
        });

        ctx.body = Object.keys(timeSlots).map(slot => {
            // return [slot, timeSlots[slot].length];
            return timeSlots[slot].length;
        });
    }
}

async function changeTime(ctx, next){
    const newTime = ctx.request.body.newTime;
    console.log(newTime);
    if (ctx.session.nickname) {
        const memberId = ctx.params.id;
        const dbResult = await ctx.mongo.db('fantasy')
            .collection('newMembers').updateOne(
                { _id: mongo.ObjectId(memberId) },
                {
                    $set: {
                        interviewTime: newTime
                    }
                });
        if (dbResult.modifiedCount) {
            ctx.body = 'success';
        }
    }
}

async function downloadMemberPDFs(ctx, next){
    if (ctx.session.nickname) {
        const memberList = await ctx.mongo.db('fantasy')
            .collection('newMembers')
            .find({}).toArray();
        pdfPacker(memberList);
    }
}

module.exports.newMember = processNewMember;
module.exports.getInfo = getEnrollInfo;
module.exports.getMemberList = getMemberList;
module.exports.login = processLogin;
module.exports.reg = processReg;
module.exports.getMember = getMemberInfo;
module.exports.commentMember = commentMember;
module.exports.pay = pay;
module.exports.scheduleInterview = scheduleInterviews;
module.exports.changeTime = changeTime;
module.exports.getPDFs = downloadMemberPDFs;
