/* eslint-disable no-unused-vars */
let express = require('express'),
  app = express(),
  port = process.env.PORT || 8080,
  mongoose = require('mongoose'),
  bodyParser = require('body-parser'),
  path = require('path'),
  fs = require('fs'),
  rootPath = path.normalize(__dirname)

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,PUT,DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, authorization, Accept')
  // res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');
  next()
})

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.engine('.html', require('ejs').__express)
app.set('views', rootPath + '/')
app.set('view engine', 'html')
app.use(express.static(__dirname + '/public'))

mongoose.connect('mongodb://localhost/risk', { promiseLibrary: require('bluebird'), useNewUrlParser: true, useUnifiedTopology: true })
mongoose.connection.on('error', function (err) {
  console.error('MongoDB connection error: ' + err)
  process.exit(-1)
})

if (!fs.existsSync('public/uploads/img')) {
  fs.mkdirSync('public/uploads/img')
}

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads')
}

let users = require('./api/models/user')
let clients = require('./api/models/client')
let initiatives = require('./api/models/initiative')

let routes = require('./api/routes/routes')
routes(app)

let server = app.listen(port)
console.log('Risk Assessment API server started on: ' + port)
