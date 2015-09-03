var mongoose = require('mongoose')
var SettingSchema = require('../schema/settingSchema')
var Setting = mongoose.model('Setting', SettingSchema)

module.exports = Setting