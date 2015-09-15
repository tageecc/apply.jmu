var mongoose = require('mongoose');
var User = require('../model/user');
var Apply = require('../model/apply');//
var Setting = require('../model/setting');
var Util = require('../util/util');

//处理用户登陆
exports.signin = function (req, res) {
    console.log('signin...');
    var _username = req.body.username;
    var _password = req.body.password;
    User.findOne({username: _username, password: _password}, function (err, user) {
        if (err) console.error(err);
        //如果用户存在添加session
        if (user) {
            req.session.user = user;
            if (user.role == 1) {
                //如果是管理员
                res.end(JSON.stringify({msg: '登陆成功，正在跳转！', flag: true, url: '/admin'}));
            } else {
                res.end(JSON.stringify({msg: '登陆成功，正在跳转！', flag: true, url: '/'}));
            }
        } else {
            res.end(JSON.stringify({msg: '登陆失败，请输入正确的用户名或密码！'}));
        }

    })
}
//处理用户注销
exports.logout = function (req, res) {
    console.log('logout...');
    delete req.session.user;
    //delete app.locals.user
    res.redirect('/')
}
exports.userMsg = function (req, res) {
    console.log('userMsg...');
    var _user = req.session.user;
    var arr = [];
    Apply.find({user: _user._id}).exec(function (err, applies) {
        if (err) console.log(err);
        else if (applies.length > 0) {
            var str;
            applies.forEach(function (apply) {
                var msg = {};
                if (apply.isread == 1) {
                    if (apply.verify == 1) {
                        if (apply.remark == '') {
                            str = '您申请的活动《' + apply.eventname + '》已通过管理员审核，管理员好像没有什么要说的。';
                        } else {
                            str = '您申请的活动《' + apply.eventname + '》已通过管理员审核，管理员想对你说：' + apply.remark;
                        }
                        msg.flag = true;
                    } else {
                        str = '您申请的活动《' + apply.eventname + '》已被管理员拒绝，拒绝原因：' + apply.remark + '<br> 如有疑问请联系办公室，电话：123456789';
                        msg.flag = false;
                    }
                    msg.msg = str;
                    msg.eventime = apply.eventime;
                    msg.apn = apply.apn;
                    arr.push(msg);
                }
            })
            res.end(JSON.stringify({msg: arr}));


        }
    })
}
//申请页面
exports.index = function (req, res) {
    console.log('index...');
    var user = req.session.user;
    if (user) {
        //如果用户已登录 则返回主页 setting值
        Setting.fetch(function (err, setting) {
            if (err) console.log(err);
            if (setting) {
                console.log(setting)
                res.render('index', {title: '集美大学活动申请', subtitle: '主页', setting: setting[0]})
            } else {
                res.render('index', {error: '内部修整中，敬请期待！'})
            }
        })

    }
    else res.render('login', {title: '集美大学活动申请', subtitle: '登陆', msg: ''})
}
//根据地点和时间段获取申请
exports.apply = function (req, res) {
    console.log('apply...');
    var _place = req.query.place;
    Setting.fetch(function (err, setting) {
        if (err) console.log(err);
        if (setting) {
            Apply.find({
                    place: _place,
                    eventime: {
                        "$gte": Util.day(setting[0].earliest),
                        "$lt": Util.day(setting[0].latest)
                    }
                },
                function (err, apply) {
                    if (err) console.log(err);
                    if (apply) {
                        res.end(JSON.stringify({apply: apply}));
                    }
                }
            )
        }
    })

}
exports.saveApply = function (req, res) {
    console.log('saveApply...');
    //如果提交申请成功 则剩余申请数减一，若申请被驳回再加一
    User.findOne({_id: req.session.user._id}, function (err, user) {
        if (err) console.log(err);
        else {
            console.log(user);
            if (--user.applies >= 0) {
                user.save();
                Apply.create({
                    user: req.session.user._id,
                    place: req.body.place,
                    eventime: req.body.eventime,
                    apn: req.body.apn,
                    eventname: req.body.eventname,
                    eventdetail: req.body.eventdetail
                }, function (err) {
                    if (err) {
                        console.log(err);
                        res.end(JSON.stringify({msg: '申请提交失败' + msg, flag: false}));
                    }
                    else {
                        res.end(JSON.stringify({msg: '申请提交成功！', flag: true}));
                    }
                })
            } else {
                res.end(JSON.stringify({msg: '您本学期的剩余申请次数不足，请联系管理员！', flag: false}));
            }

        }
    })

}
exports.showAdmin = function (req, res) {
    console.log('showAdmin...');
    res.render('admin', {title: '集美大学活动申请', subtitle: '后台管理'})
}
exports.showLogin = function (req, res) {
    console.log('showLogin...');
    res.render('login', {title: '集美大学活动申请', subtitle: '登陆', msg: ''})
}
exports.applyNum = function (req, res) {
    console.log('applyNum...');
    Apply.where({verify: 0, eventime: {$gte: Util.timeNow()}}).count(function (err, count) {
        if (err) res.end(JSON.stringify({msg: '获取未审核申请数失败！', flag: false}));
        else res.end(JSON.stringify({count: count, flag: true}));
    })
}
exports.addUser = function (req, res) {
    console.log('addUser...');
    User.create({
        username: req.body.username,
        password: req.body.password,
        organize: req.body.organize,
        phone: req.body.phone,
    }, function (err) {
        if (err) {
            var msg = err.code == 11000 ? ',已存在该用户！' : '!'
            res.end(JSON.stringify({msg: '用户添加失败' + msg, flag: false}));
        }
        else res.end(JSON.stringify({msg: '用户添加成功！', flag: true}));
    })
}
exports.userList = function (req, res) {
    console.log('userList...');
    User.find({}).exec(function (err, users) {
        if (err) res.end(JSON.stringify({msg: '获取用户列表失败！', flag: false}));
        else res.end(JSON.stringify({msg: '获取用户列表成功！', flag: true, user: users}));
    })
}
exports.getUserInfo = function (req, res) {
    console.log('getUserInfo...');
    var _username = req.body.username;
    User.find({username: _username}).exec(function (err, user) {
        if (err) res.end(JSON.stringify({msg: '获取用户信息失败！', flag: false}));
        if (user.length > 0) {
            res.end(JSON.stringify({msg: '获取用户信息成功！', flag: true, user: user[0]}));
        } else {
            res.end(JSON.stringify({msg: '未找到该用户！', flag: false}));
            return false;
        }
    })

}
exports.updateUser = function (req, res) {
    console.log('updateUser...');
    var _username = req.body.username;
    var _password = req.body.password;
    var _organize = req.body.organize;
    var _phone = req.body.phone;
    var _applies = req.body.applies;
    User.update({username: _username},
        {
            password: _password,
            organize: _organize,
            phone: _phone,
            applies: _applies
        }
        , function (err) {
            if (err) res.end(JSON.stringify({msg: '更新失败！', flag: false}));
            else res.end(JSON.stringify({msg: '更新成功！', flag: true}));
        })
}
exports.resetApplies = function (req, res) {
    console.log('resetApplies...');
    User.update({}, {applies: 2}, {multi: true}, function (err) {
        if (err) res.end(JSON.stringify({msg: '重置剩余申请数失败！', flag: false}));
        else res.end(JSON.stringify({msg: '重置剩余申请数成功！', flag: true}));
    })
}
exports.delUser = function (req, res) {
    console.log('delUser...');
    var _username = req.query.username;
    User.remove({username: _username}, function (err) {
        if (err) res.end(JSON.stringify({msg: '删除用户失败！', flag: false}));
        else res.end(JSON.stringify({msg: '删除用户成功！', flag: true}));
    })

}
exports.unCheckedApply = function (req, res) {
    console.log('unCheckedApply...');
    Apply.find({isread: 0})
        .populate('user')
        .exec(function (err, applys) {
            if (err) res.end(JSON.stringify({msg: '获取未审核申请失败！', flag: false}));
            else {
                res.end(JSON.stringify({msg: '获取未审核申请成功！', flag: true, apply: applys}));
            }
        })

}
exports.checkedApply = function (req, res) {
    console.log('checkedApply...');
    Apply.find({isread: 1})
        .populate('user')
        .exec(function (err, applys) {
            if (err) res.end(JSON.stringify({msg: '获取已审核申请失败！', flag: false}));
            else res.end(JSON.stringify({msg: '获取已审核申请成功！', flag: true, apply: applys}));
        })

}
exports.agreeApply = function (req, res) {
    console.log('agreeApply...');
    Apply.update({_id: req.body.id}, {isread: 1, verify: 1, remark: req.body.remark}, function (err) {
        if (err) res.end(JSON.stringify({msg: '审核失败！', flag: false}));
        else res.end(JSON.stringify({msg: '审核成功！', flag: true}));
    })

}
exports.disagreeApply = function (req, res) {
    console.log('disagreeApply...');
    Apply.findOneAndUpdate({_id: req.body.id}, {isread: 1, verify: 0, remark: req.body.remark}, function (err, apply) {
        if (err) res.end(JSON.stringify({msg: '审核失败！', flag: false}));
        else {
            //如果申请失败 则申请者剩余申请次数加一
            User.findOne({_id: apply.user}).exec(function (err, user) {
                if (err) console.log(err)
                else {
                    user.applies++;
                    user.save();
                }
            })
            res.end(JSON.stringify({msg: '审核成功！', flag: true}));
        }
    })

}
exports.timeCtrl = function (req, res) {
    console.log('timeCtrl...');
    console.log(req.query.earliest, req.query.latest);
    Setting.update({}, {earliest: req.query.earliest, latest: req.query.latest}, function (err) {
        if (err) {
            console.log(err);
            res.end(JSON.stringify({msg: '修改失败！', flag: false}));
        }
        else res.end(JSON.stringify({msg: '修改成功！', flag: true}));
    })

}
exports.openTime = function (req, res) {
    console.log('openTime...');
    Setting.findOne({}, function (err, setting) {
        if (err) res.end(JSON.stringify({msg: '获取活动地址失败！', flag: false}));
        else res.end(JSON.stringify({msg: '获取活动地址成功！', flag: true, setting: setting}));
    })
}
exports.openPlace = function (req, res) {
    console.log('openPlace...');
    Setting.findOne({}, function (err, setting) {
        if (err) res.end(JSON.stringify({msg: '获取活动地址失败！', flag: false}));
        else res.end(JSON.stringify({msg: '获取活动地址成功！', flag: true, setting: setting}));
    })

}
exports.savePlace = function (req, res) {
    console.log('savePlace...');
    console.log(req.query.saveplace)
    Setting.findOne({}, function (err, setting) {
        if (err) res.end(JSON.stringify({msg: '活动场所添加失败' + msg, flag: false}));
        else {
            setting.place.push(req.query.saveplace);
            setting.markModified('place');
            setting.save();
            res.end(JSON.stringify({msg: '活动场所添加成功！', flag: true}));
        }
    })

}
exports.delPlace = function (req, res) {
    console.log('savePlace...');
    console.log(req.query.delplace)
    Setting.findOne({}, function (err, setting) {
        if (err) res.end(JSON.stringify({msg: '活动场所删除失败' + msg, flag: false}));
        else {
            setting.place.splice(Util.arrayDel(setting.place, req.query.delplace), 1);
            setting.markModified('place');
            setting.save();
            res.end(JSON.stringify({msg: '活动场所删除成功！', flag: true}));
        }
    })

}

// midware for user
exports.signinRequired = function (req, res, next) {
    var user = req.session.user

    if (!user) {
        return res.redirect('/login')
    }

    next()
}

exports.adminRequired = function (req, res, next) {
    var user = req.session.user
    console.log(user);
    if (!user) {
        return res.redirect('/login')
    }
    if (user.role == 0) {
        return res.redirect('/login')
    }

    next()
}