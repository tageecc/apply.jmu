var mongoose = require('mongoose');
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId
var ApplySchema = new Schema({
    user: {type: ObjectId, ref: 'User'},//申请的用户
    admin: {type: ObjectId, ref: 'User'},//审核人
    eventime: Date,
    apn: Number,//012早上下午晚上
    place: String,//地点
    eventname: String,//活动名称
    eventdetail: String,//活动详情
    isread:{
        type: Number,
        default: 0
    },//是否审核过
    verify: {
        type: Number,
        default: 0
    },//是否通过
    remark: {
        type: String,
        default: ''
    },//附加原因
    createAt: {
        type: Date,
        default: Date.now()
    }

})

ApplySchema.statics = {
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

module.exports = ApplySchema