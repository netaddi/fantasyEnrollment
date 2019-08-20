/**
 * Created by yx on 9/1/2016.
 */
var regInfo = {};
var jsonDepartInfo = {};
var jsonGroupInfo = {};

const undergraduateIdReg = /^31[0-8]0\d{6}$/;
const graduateReg = /^[1-2]1[0-8]\d{5}$/;
const mobilePhoneReg = /^1\d{10}$/;
const emailReg = /^.+@.+\..+$/;

function getGroupQuestionId(departId, groupId, questionId){
    return 'depart' + departId + 'group' + groupId + 'question' + questionId
}

function getDepartQuestionId(departId, questionId){
    return 'depart' + departId + 'question' + questionId
}

function checkAvailability(data) {
    // if (data.interviewAvailable){
    //     document.getElementById('fullNotice').style.display = 'none';
    // } else {
        document.getElementById('formDiv').style.display = 'none';
    // }
}

function extractDepartmentInfoAndRenderQuestion(data) {
    data.departInfo.forEach(function (depart, departId) {
        var groupInfo = {};
        if (depart.questions){
            depart.questions.forEach(function (question, questionId) {
                renderQuestion(getDepartQuestionId(departId, questionId), question);
            });
        }
        depart.groups.forEach(function (group, groupId) {
            groupInfo[group.name] = {
                groupId: groupId,
                questions: group.questions,
                remark: group.remark
            };
            jsonGroupInfo[group.name] = groupInfo[group.name];
            group.questions.forEach(function (question, questionId) {
                renderQuestion(getGroupQuestionId(departId, groupId, questionId), question);
            });
        });
        jsonDepartInfo[depart.department] = {
            id: departId,
            groups:groupInfo,
            questions: depart.questions,
            remark: depart.remark
        };
    });
}

function renderDepartment(departInfo) {
    [1, 2, 3].forEach(function (id) {
        var select = document.getElementById("department" + id);
        select.innerHTML += '<option value="">不选择</option>';
        departInfo.forEach(function(depart){
            var option = depart.department;
            select.innerHTML += '<option value="' + option + '">' + option + '</option>'
        })
    });
}

function checkMultiDay(day) {
    var dayCheckBoxes = document.getElementsByClassName('dayCheckBox' + day);
    for (var i = 0; i < dayCheckBoxes.length; i++) {
        if (document.getElementById('daySelect' + day).checked) {
            dayCheckBoxes[i].checked = true;
        } else {
            dayCheckBoxes[i].checked = false;
        }
    }
}

function renderInterviewTime(timeInfo){
    var checkBoxDiv = document.getElementById('timeContainer');
    timeInfo.forEach(function (day, dayId) {
        checkBoxDiv.innerHTML += '<label class="checkbox-inline">';
        checkBoxDiv.innerHTML += '</br>' +
            '<input id="daySelect' + dayId + '" type="checkbox" class="timeCheckBox" value="true" name="' + day.day + '"' +
            'onchange="checkMultiDay(' + dayId + ')">&nbsp;'
            + day.day + '这天我都有空';
        day.slots.forEach(function (slot) {
            var timeStr = day.day + slot;
            checkBoxDiv.innerHTML += '</br>' +
                '<input type="checkbox" class="slotCheckBox timeCheckBox dayCheckBox' + dayId + '" ' +
                'value="true" name="' + timeStr + '">&nbsp;' + timeStr;
        });
        checkBoxDiv.innerHTML += '</label></br>';
    })
}

function handleDepartmentChange(id) {
    var form = getForm();
    var selectedDepartment = form['department' + id];
    if (selectedDepartment) {
        var groupSelect = document.getElementById("group" + id);
        groupSelect.innerHTML = '<option></option>';
        Object.keys(jsonDepartInfo[selectedDepartment].groups).forEach(function (group) {
            groupSelect.innerHTML += '<option value="' + group + '">' + group + '</option>'
        });
    }
    updateQuestions();
}

function handleGroupChange() {
    updateQuestions();
}

function updateQuestions() {
    hideQuestions();
    var form = getForm();
    [1, 2, 3].forEach(function (id) {
        var group = form['group' + id];
        var depart = form['department' + id];
        if (depart && jsonDepartInfo[depart].questions){
            jsonDepartInfo[depart].questions.forEach(function (question, questionId) {
                document.getElementById(getDepartQuestionId(
                    jsonDepartInfo[depart].id, questionId
                )).style.display = 'block';
            });
        }
        if (depart && group){
            var groupInfo = jsonDepartInfo[depart].groups[group];
            if (groupInfo.questions){
                groupInfo.questions.forEach(function (question, questionId) {
                    document.getElementById(getGroupQuestionId(
                        jsonDepartInfo[depart].id, groupInfo.groupId, questionId
                    )).style.display = 'block';
                });
            }
        }
    });
}

function hideQuestions() {
    var divList = document.getElementById('exQuestion').children;
    for (var i = 0; i < divList.length; i++){
        divList[i].style.display = 'none';
    }
}

function renderQuestion(questionId, questionContent){
    document.getElementById('exQuestion').innerHTML +=
        '<div class="container question-container" id="' + questionId + '">' +
        '                <div class="container">\n' +
        '                    <div class="col-sm-2"></div>\n' +
        '                    <div class="col-sm-8">\n' +
        '                        <h5><span class="requiredMark">*</span>' + questionContent + '</h5>\n' +
        '                    </div>\n' +
        '                </div>\n' +
        '                <div class="col-sm-2"></div>\n' +
        '                <div class="col-sm-8">\n' +
        '                    <textarea type="text" class="form-control" name="' + questionId + '" rows="3"></textarea>\n' +
        '                </div>' +
        '</div>';
}

function getForm() {
    var formData = {};
    var form = document.forms[0];
    var formLength = form.length;
    var freeTime = [];

    for (var i = 0; i < formLength; i++){
        var input = form[i];
        if(input.name) {
            if (input.type === 'checkbox') {
                if (input.classList.contains('slotCheckBox')
                    && input.checked) {
                    freeTime.push(input.name)
                }
            } else {
                if (input.value) {
                    formData[input.name] = input.value;
                }
            }
        }
    }
    formData['freeTime'] = freeTime;
    return formData;
}

function setupBackgroundImage() {
    var width = document.documentElement.clientWidth;
    var height = document.documentElement.clientHeight;
    var img = new Image();
    if (width >= height){
        document.getElementById('bgPic').style.display = 'none';
        document.body.style.webkitBackgroundSize = 'auto 100%';
        document.body.style.backgroundSize = 'auto 100%';
    }//for the computer screen
    else{
        document.body.style.background = '#554455';
        document.getElementById('bgPic').style.width = '100%';
        document.getElementById('bgPic').style.height = 'auto';
    }
}


function initializePage() {

    setupBackgroundImage();

    $.get("getInfo", function (data) {
        regInfo = data;
        checkAvailability(data);
        extractDepartmentInfoAndRenderQuestion(data);
        renderDepartment(regInfo.departInfo);
        renderInterviewTime(regInfo.interviewTimeSlots);
        hideQuestions();
    });
}

function changeJoinDepart() {
    var departmentSection = document.getElementById('departmentInfo');
    if (getForm().ifJoinDepartment === '否'){
        departmentSection.style.display = 'none';
    }
    else {
        departmentSection.style.display = 'block';
    }
}

function verifyForm(formData) {
    if(formData.sex !== '男' && formData.sex !== '女'){
        alert('喂……这个性别只是放在那里好玩的，不是让你真的选啦！\n快去选个正常的～');
        return false;
    }
    if(!emailReg.test(formData.email)){
        alert('email格式不对');
        return false;
    }
    if(!(undergraduateIdReg.test(formData.studentId) || graduateReg.test(formData.studentId))){
        alert('学号格式不对');
        return false;
    }
    if(!mobilePhoneReg.test(formData.phoneNumber)){
        alert('手机号格式不对');
        return false;
    }
    if (formData.ifJoinDepartment === '是') {
        if ((!formData.department1)
            && (!formData.department2)
            && (!formData.department3)) {
            alert('既然都要成为部员了，那就选个部门嘛～');
            return false;
        }

        if ((formData.department1 && !formData.group1)
            || (formData.department2 && !formData.group2)
            || (formData.department3 && !formData.group3)) {
            alert('好像有的部门没有选具体的组呢');
            return false;
        }
    }
    if (formData.ifJoinDepartment === '是' && formData.freeTime.length < 1) {
        alert('选个面试时间嘛～');
        return false;
    }
    return true;
}

function submitForm() {
    document.getElementById('submitButton').disabled = true;
    document.getElementById('submitting').style.display = 'block';

    var formData = getForm();

    if (verifyForm(formData)){
        $.ajax({
            type: 'POST',
            url: '/joinus',
            contentType: 'application/json',
            dataType: 'text',
            data: JSON.stringify(formData),
            success: function () {
                window.location = '/success.html';
                // document.getElementById('submitButton').disabled = false;
                // return false;
            },
            error: function () {
                alert('哎呀……报名失败了\n请再试一次吧_(:з)∠)_');
                document.getElementById('submitButton').disabled = false;
            }
        });
    } else {
        document.getElementById('submitButton').disabled = false;
        document.getElementById('submitting').style.display = 'none';
    }
    return false;
}
