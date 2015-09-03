//点击登陆
function signin() {
    var data = {};
    var username = $.trim($('#uname').val());
    if (username.length <= 0 || username == 'Email') {
        globalTip({
            flag: false,
            msg: '请填写用户名'
        });
        $('#uname').focus();
        return false;
    }
    data.username = username;

    password = $.trim($('#pwd').val());

    if (password.length <= 0 || password == 'Password') {
        globalTip({
            flag: false,
            msg: '请填写密码'
        });
        $('#pwd').focus();
        return false;
    }
    data.password = $.md5(password);
    $('#login-button').attr('disabled', 'true');
    $.ajax({
        type: 'post',
        url: '/user/signin',
        dataType: "json",
        data: data,
        success: function (msg) {
            console.log(msg);
            globalTip(msg);
            $('#login-button').removeAttr("disabled");
        },
        error: function () {
            console.log('error');
            globalTip({mgs: '网络异常,刷新重试', flag: false});
            $('#login-button').removeAttr("disabled");
        }
    });
    return false;

}

function globalTip(obj) {
    var $msg = $('#msg');
    $msg.text(obj.msg);
    $msg.css('background-color', obj.flag ? '#00b3ee' : '#cc0000');
    $msg.velocity({top: 0}, [250, 15]);
    setTimeout(function () {
        $msg.velocity({top: '-66px'}, 250);
    }, 1500)

    if (obj.url) window.location.href = obj.url;
}

