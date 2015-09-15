var mongoose = require('mongoose');

var SettingSchema = new mongoose.Schema({
    //申请开放时间，单位为天，默认最早和最晚为7,30
    earliest: {
        type: Number,
        default: 7
    },
    latest: {
        type: Number,
        default: 30
    },
    ban: {//不开放的时间 周一到周日，默认1,4
        type: mongoose.Schema.Types.Mixed,
        default: [1, 4]
    },
    place: {
        type: mongoose.Schema.Types.Mixed,
        default: ['月明楼小舞厅', '万人体育场']
    }
});
SettingSchema.statics = {
    fetch: function (cb) {
        return this
            .find({})
            .exec(cb)
    }
};
module.exports = SettingSchema;