'use strict'
var mongoose = require('mongoose')
var Client = mongoose.model('Client')
var User = mongoose.model('User')
mongoose.Promise = global.Promise

exports.getClient = function (req, res, next) {
  var id = req.params.id
  Client.findOne({ _id: id }).exec(function (err, client) {
    if (err) {
      next(err)
    } else {
      if (!client) {
        return res.status(401).end()
      } else {
        return res.status(200).json(client)
      }
    }
  })
}

exports.getClients = function (req, res, next) {
  Client.find().exec(function (err, clients) {
    if (err) {
      next(err)
    } else {
      return res.status(200).json(clients)
    }
  })
}

exports.createClient = function (req, res, next) {
  User.findOne({email: req.body.contactPerson.email}).exec(function (err, _user) {
    if (err) {
      return res.status(422).json({error: 'error finding user in creat client'})
    } else {
      if (!_user) {
        return res.status(422).json({error: 'no user find'})
      } else {
        var client = new Client()
        if (_user.type === 'superAdmin') {
          client.companyName = req.body.companyName
          client.websiteURL = req.body.websiteURL
          client.logoPath = req.body.logoPath
          client.contactPerson = req.body.contactPerson
          client.address = req.body.address
          client.save(function (err, client) {
            if (err) {  // TODO handle the error
              return res.status(422).json({error: 'error in saving client superadmin'})
            } else {
              var user = new User({email: req.body.contactPerson.email})
              user.firstName = req.body.contactPerson.firstName
              user.lastName = req.body.contactPerson.lastName
              user.joining = new Date()
              user.userRole = req.body.contactPerson.userRole
              user.client = client._id
              user.type = 'companyAdmin'
              if (req.body.contactPerson.password) { user.setPassword(req.body.contactPerson.password) }
              user.save(function (err, user) {
                if (err) {
                  console.log(err)
                }
              })
              return res.status(200).json({client: client, userId: user._id})
            }
          })
        } else {  // creating client from onboarding
          client.companyName = req.body.companyName
          client.contactPerson = req.body.contactPerson
          client.save(function (err, client) {
            if (err) {  // TODO handle the error
              return res.status(422).json({error: 'error in saving client onboarding'})
            } else {
              var user = new User(_user)
              user.client = client._id
              user.save(function (err, user) {
                if (err) {
                  console.log('error in updating user')
                } else {
                  console.log(client)
                  return res.status(200).json({client: client, userId: user._id})
                }
              })
            }
          })
        }
      }
    }
  })
}

exports.updateClient = function (req, res, next) {
  Client.findOne({'_id': req.params.id}).exec(function (err, client) {
    if (err) {
      return res.status(422).json({error: err})
    } else {
      if (!client) {
        return res.status(422).json({error: 'document not found'})
      } else {
        for (var prop in req.body) {
          if (prop == '_id' || prop == '_v') {
            continue
          } else {
            client[prop] = req.body[prop]
          }
        }
        User.findOne({client: client._id}).exec(function (err, user) {
          if (!err && user) {
            user.firstName = req.body.contactPerson.firstName
            user.lastName = req.body.contactPerson.lastName
            user.userRole = req.body.contactPerson.role

            user.save(function (err) {
              client.save(function (err) {
                if (err) {
                  return res.status(422).json({error: err})
                } else {
                  return res.status(200).json(client)
                }
              })
            })
          } else {
            return res.status(401).end()
          }
        })
      }
    }
  })
}

exports.deleteClient = function (req, res, next) {
  var id = req.params.id
  Client.remove({
    _id: id
  }, function (err, client) {
    if (err) { res.send(err) }
    return res.status(200).json({ message: 'Client successfully deleted' })
  })
}
