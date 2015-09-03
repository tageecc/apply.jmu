var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    username: {
        unique: true,
        type: String
    },
    password: String,
    organize: String,//社团名
    phone: Number,//联系人电话
    applies: {//申请次数
        type: Number,
        default: 2
    },
    remark: String,//保留字段
    role: {
        type: Number,
        default: 0
    },// 0普通用户，1管理员
    createAt: {
        type: Date,
        default: Date.now()
    }

})

UserSchema.statics = {
    fetch: function (cb) {
        return this
            .find({})
            .sort('createAt')
            .exec(cb)
    },
    findById: function (id, cb) {
        return this
            .findOne({_id: id})
            .exec(cb)
    }
}

module.exports = UserSchema