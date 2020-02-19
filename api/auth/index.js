'use strict'

var express = require('express')
var mongoose = require('mongoose')
var User = mongoose.model('User')

// Passport Configuration
require('./local/passport').setup(User)

var router = express.Router()

router.use('/local', require('./local'))

exports = module.exports = router
