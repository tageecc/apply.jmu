var mongoose = require('mongoose')
var ApplySchema = require('../schema/applySchema')
var Apply = mongoose.model('Apply', ApplySchema)

module.exports = Apply