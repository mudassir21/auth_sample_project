'use strict'
var multer = require('multer')
var auth = require('../../auth/auth.service')
var crypto = require('crypto')
var mime = require('mime')
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype))
    })
  }
})
var storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/img/')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype))
    })
  }
})
var upload = multer({ storage: storage2 })
var upload2 = multer({ storage: storage })
var attachmentUploads = upload2.fields([
  {name: 'file1', maxCount: 1 },
  {name: 'file2', maxCount: 1 },
  {name: 'file3', maxCount: 1 },
  {name: 'file4', maxCount: 1 },
  {name: 'file5', maxCount: 1 },
  {name: 'file6', maxCount: 1 },
  {name: 'file7', maxCount: 1 },
  {name: 'file8', maxCount: 1 },
  {name: 'file9', maxCount: 1 },
  {name: 'file10', maxCount: 1 },
  {name: 'file11', maxCount: 1 },
  {name: 'file12', maxCount: 1 },
  {name: 'file13', maxCount: 1 },
  {name: 'file14', maxCount: 1 },
  {name: 'file15', maxCount: 1 },
  {name: 'file16', maxCount: 1 }
])

module.exports = function (app) {
  var user = require('../controllers/user')
  var client = require('../controllers/client')
  var initiative = require('../controllers/initiative')

  user.init()

    // app.route('/api/v1/users/login')
    //   .post(user.login);
  app.route('/api/v1/onboardUser')
  .post(user.onboardUser)

  app.route('/api/v1/invite')
      .post(auth.isAuthenticated(), user.invite)

  app.route('/api/v1/users')
      .post(user.createUser)
      .get(user.getUsers)

  app.use('/auth', require('../../auth'))

  app.route('/auth/local')
    .get(auth.isAuthenticated(), user.getLocalUser)

  app.route('/api/v1/createdUsers/:id')
    .get(auth.isAuthenticated(), user.getCreatedUsers)
  app.route('/api/v1/users/:id')
    .get(auth.isAuthenticated(), user.getUser)
    .put(auth.isAuthenticated(), user.updateUser)
    .delete(auth.hasRole('admin'), user.deleteUser)

  app.route('/api/v1/users/:id/upload')
      .post(auth.isAuthenticated(), upload.single('file'), user.upload)

  app.route('/api/v1/initiatives/:id/upload')
      .post(auth.isAuthenticated(), attachmentUploads, initiative.upload)

  app.route('/api/v1/clients')
      .post(auth.isAuthenticated(), client.createClient)
      .get(auth.isAuthenticated(), client.getClients)
  app.route('/api/v1/clients/:id')
      .get(auth.isAuthenticated(), client.getClient)
      .put(auth.isAuthenticated(), client.updateClient)
      .delete(auth.hasRole('admin'), client.deleteClient)

  app.route('/api/v1/initiatives')
      .post(auth.isAuthenticated(), initiative.createInitiative)
      .get(auth.isAuthenticated(), initiative.getInitiatives)
  app.route('/api/v1/createdInitiatives/:id')
      .get(auth.isAuthenticated(), initiative.getCreatedInitiatives)
  app.route('/api/v1/teamDetailsReport/:id')
      .get(auth.isAuthenticated(), initiative.getTeamDetailsReport)
  app.route('/api/v1/moderatorList/:id')
      .get(auth.isAuthenticated(), initiative.getModeratorList)
  app.route('/api/v1/commentDetailsReport/:id')
      .get(auth.isAuthenticated(), initiative.getCommentDetailsReport)
  app.route('/api/v1/initiatives/:id')
      .get(auth.isAuthenticated(), initiative.getInitiative)
      .put(auth.isAuthenticated(), initiative.updateInitiative)
      .delete(auth.isAuthenticated(), initiative.deleteInitiative)

  app.post('/api/v1/submitContactForm', user.submitContactForm)
  app.post('/api/v1/forgot', user.forgot)
  app.post('/api/v1/resetPassword/:token', user.resetPassword)
  app.get('/uploads/:fileName', auth.isAuthenticated(), user.fileServe)
}
