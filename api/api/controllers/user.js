'use strict'
let mongoose = require('mongoose')
let User = mongoose.model('User')
let Client = mongoose.model('Client')
let Initiative = mongoose.model('Initiative')
let _ = require('underscore')
let crypto = require('crypto')
let fs = require('fs')
let path = require('path')
let nodemailer = require('nodemailer')
mongoose.Promise = global.Promise
let async = require("async")
const mailjet = require('node-mailjet')
.connect('458cf66afb6428c2f49ab347328a055a', '5429900e929e771c13cb2306935b6cad')
// user: 'admin@changevu.com', pass: Admin@1234

let transporter = nodemailer.createTransport('SMTP', {
  host: 'smtpout.secureserver.net', // hostname
  secureConnection: true, // use SSL
  port: 465, // port for secure SMTP
  auth: {
    user: 'admin@changevu.com',
    pass: 'Admin@CV2'
  }
})

exports.init = function () {
  User.findOne({email: 'admin@changevu.com'}).exec(function (err, admin) {
    if (!err) {
      if (!admin) {
        let user = new User({email: 'admin@changevu.com'})
        user.setPassword('admin')
        user.type = 'superAdmin'
        user.save(function (err, user) {
          if (err) { console.log(err) }
        })
      }
    }
  })
}

exports.getLocalUser = function (req, res, next) {
  User.findOne({'_id': req.user._id}).populate('admin', 'logoPath').populate('currentInitiative', '_id initiativeName teamName implementationStage teamLead').exec(function (err, user) {
    if (!err && user) {
      let logoPath = ''
      if (user.logoPath) {
        logoPath = user.logoPath
      }
      if (user.admin && user.role != 'companyAdmin') {
        if (user.admin.logoPath) {
          logoPath = user.admin.logoPath
        }
      }
      if (user.currentInitiative) {
        Initiative.findOne({'_id': user.currentInitiative._id}).populate('teamLead', 'firstName lastName').select('_id initiativeName implementationStage teamName teamLead').exec(function (err, initiative) {
          res.status(200).json({logoPath: logoPath, profilePicture: user.profilePicture, diagonactics: user.diagonactics, currentInitiative: initiative, firstName: req.user.firstName, lastName: req.user.lastName, email: req.user.email, role: req.user.type, _id: req.user._id})
        })
      } else {
        res.status(200).json({logoPath: logoPath, profilePicture: user.profilePicture, diagonactics: user.diagonactics, currentInitiative: user.currentInitiative, firstName: req.user.firstName, lastName: req.user.lastName, email: req.user.email, role: req.user.type, _id: req.user._id})
      }
    } else {
      return res.status(401).end()
    }
  })
}

exports.getUser = function (req, res, next) {
  let id = req.params.id

  User.findOne({ _id: id }, '-salt -password').exec(function (err, user) {
    if (err) {
      next(err)
    } else {
      if (!user) {
        return res.status(401).end()
      } else {
        return res.status(200).json(user)
      }
    }
  })
}

exports.getUsers = function (req, res, next) {
  User.find().exec(function (err, users) {
    if (err) {
      next(err)
    } else {
      return res.status(200).json(users)
    }
  })
}

exports.getCreatedUsers = function (req, res, next) {
  let id = req.params.id
  User.find({admin: id}, '-salt -password').exec(function (err, users) {
    if (err) {
      next(err)
    } else {
      return res.status(200).json(users)
    }
  })
}

exports.createUser = function (req, res, next) {
  User.findOne({'email': new RegExp(req.body.user.email, 'i')}).exec(function (err, user) {
    if (user.password.toString() !== '') {
      return res.status(422).json({message: 'This email address is not available.'})
    } else {
      user.firstName = req.body.user.firstName
      user.lastName = req.body.user.lastName
      user.type = req.body.user.type
      user.joining = Date.now()
      if (req.body.user.password) { user.setPassword(req.body.user.password) }
      user.save(function (err, user) {
        if (err) {
          return res.status(422).json({error: 'error in saving existing'})
        } else {
          return res.status(200).json(user)
        }
      })
    }
  })
}

exports.onboardUser = function (req, res, next) {
  User.find({'email': new RegExp(req.body.email, 'i')}).exec(function (err, user) {
    if (user.length > 0) {
      if (user.password != null) {
        return res.status(422).json({message: 'User with this email already exist.'})
      } else {
        let user = new User({email: req.body.email})
        if (req.body.email) {
          if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,10})+$/.test(req.body.email)) {async
            user.email = req.body.email
          } else {
            return res.status(422).json({message: 'Invalid email address.'})
          }
        }
        if (req.body.email) {
          // Produce 6 digit random code
          let number = Math.floor(100000 + Math.random() * 900000)
          user.updateOne({email: req.body.email}, function (err) {
            if (err) {
              return res.status(422).json({error: err})
            } else {
              console.log(number)
              return res.status(200).json({number: number})
              /* let subject = 'Please verify your email for ChangeVU free trial.'
              const request = mailjet.post('send', {'version': 'v3.1'}).request({
                'Messages': [
                  {
                    'From': {
                      'Email': 'admin@changevu.com',
                      'Name': 'ChangeVU Team'
                    },
                    'To': [
                      {
                        'Email': req.body.email
                      }
                    ],
                    'TemplateID': 1191514,
                    'TemplateLanguage': true,
                    'Subject': subject,
                    'Variables': {
                      'VerificationCode': number
                    }
                  }
                ]
              })
              request
              .then((result) => {
                // save contact in mailjet for email marketing
                const requestContact = mailjet.post('listrecipient', {'version': 'v3'}).request({
                  'IsUnsubscribed': false,
                  'ContactAlt': req.body.email,
                  'ListID': '11360'
                })
                requestContact
                .then((result) => {
                  return res.status(200).json({number: number})
                })
                .catch((err) => {
                  console.log('error saving contact:' + err)
                  return res.status(200).json({number: number})
                })
              })
              .catch((err) => {
                console.log('error sending email:' + err)
                return res.status(422).json({error: 'error sending email'})
              }) */
            }
          })
        }
      }
    } else {
      let user = new User({email: req.body.email})
      if (req.body.email) {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,10})+$/.test(req.body.email)) {
          user.email = req.body.email
          // Produce 6 digit random code
          let number = Math.floor(100000 + Math.random() * 900000)
          // console.log('new' + number)
          user.save(function (err) {
            if (err) {
              return res.status(422).json({error: err})
            } else {
              // send email
              console.log(number)
              return res.status(200).json({number: number})
              /* let subject = 'Please verify your email for ChangeVU free trial.'
              const request = mailjet.post('send', {'version': 'v3.1'}).request({
                'Messages': [
                  {
                    'From': {
                      'Email': 'admin@changevu.com',
                      'Name': 'ChangeVU Team'
                    },
                    'To': [
                      {
                        'Email': req.body.email
                      }
                    ],
                    'TemplateID': 1191514,
                    'TemplateLanguage': true,
                    'Subject': subject,
                    'Variables': {
                      'VerificationCode': number
                    }
                  }
                ]
              })
              request
                .then((result) => {
                  // save contact
                  const requestContact = mailjet.post('listrecipient', {'version': 'v3'}).request({
                    'IsUnsubscribed': false,
                    'ContactAlt': req.body.email,
                    'ListID': '11360'
                  })
                  requestContact
                  .then((result) => {
                    return res.status(200).json({number: number})
                  })
                  .catch((err) => {
                    console.log('error saving contact:' + err)
                    return res.status(200).json({number: number})
                  })
                })
                .catch((err) => {
                  console.log('error sending email:' + err)
                  return res.status(422).json({error: 'error sending email'})
                }) */
            }
          })
        } else {
          return res.status(422).json({message: 'Invalid email address.'})
        }
      }
    }
  })
}

exports.invite = function (req, res, next) {
  let msgSentCounter = 0
  async.forEachOf(req.body.members, (value, callback) => {
    let email = value.email
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,10})+$/.test(email)) {
      let user = new User({email: email})
      user.email = email
      user.save(function (err, user) {
        if (err) {
          console.log(err)
        } else {
          msgSentCounter++
          // Send invitation email
          Initiative.findOne({'_id': req.body.initiativeID}).exec(function (err, initiative) {
            initiative.members.push({user: user})
            initiative.save(function (err) {
              if (err) {
                console.log(err)
              } else {
              }
            })
          })
        }
      })
    } else {
      console.log('Not email:' + email)
    }
  }, err => {
    if (err) console.error(err.message);
  });
  return res.status(200).json({msgSentCounter: msgSentCounter})
}

exports.updateUser = function (req, res, next) {
  User.findOne({'_id': req.params.id}).exec(function (err, user) {
    if (err) {
      return res.status(422).json({error: err})
    } else {
      if (!user) {
        return res.status(422).json({error: 'user not found'})
      } else {
        if (req.body.initiativeId && req.body.riskValue) {
          if (user.diagonactics) {
            let find = _.filter(user.diagonactics, function (item) {
              return item.initiative.equals(req.body.initiativeId)
            })

            if (find.length) {
              find[0].risks[req.body.index] = req.body.riskValue
            } else {
              user.diagonactics.push({initiative: req.body.initiativeId})
              let len = user.diagonactics.length - 1
              if (len < 0) {
                len = 0
              }
              user.diagonactics[len].risks = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
              user.diagonactics[len].risks[req.body.index] = req.body.riskValue
            }
          } else {
            user.diagonactics = []
            user.diagonactics.push({initiative: req.body.initiativeId})
            user.diagonactics[0].risks = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
            user.diagonactics[0].risks[req.body.index] = req.body.riskValue
          }
          user.markModified('diagonactics')
        } else if (req.body.initiativeId && req.body.commentValue) {
          if (user.diagonactics) {
            let find = _.filter(user.diagonactics, function (item) {
              return item.initiative.equals(req.body.initiativeId)
            })

            if (find.length) {
              find[0].comments[req.body.index] = req.body.commentValue
            } else {
              user.diagonactics.push({initiative: req.body.initiativeId})
              let len = user.diagonactics.length - 1
              if (len < 0) {
                len = 0
              }
              user.diagonactics[len].comments = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
              user.diagonactics[len].comments[req.body.index] = req.body.commentValue
            }
          } else {
            user.diagonactics = []
            user.diagonactics.push({initiative: req.body.initiativeId})
            user.diagonactics[0].comments = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
            user.diagonactics[0].comments[req.body.index] = req.body.commentValue
          }
          user.markModified('diagonactics')
        } else if (req.body.newPassword) {
          if (!user.isValidPassword(req.body.oldPassword)) {
            return res.status(200).json({error: 'old password is incorrect'})
          } else {
            user.setPassword(req.body.newPassword)
          }
        } else {
          for (let prop in req.body) {
            if (prop == '_id' || prop == '_v' || prop == 'salt' || prop == 'joining') {
              continue
            } else if (prop == 'password') {
              user.setPassword(req.body.password)
            } else if (prop == 'userType') {
                if (req.body.userType !== 'Default') {
                  user.type = 'admin'
                } else {
                  user.type = 'general'
                }
              }
            else {
                user[prop] = req.body[prop]
              }
          }
        }

        //check if all risk value in entered
        let valueEnterCounter = 0
        for(let i = 0; i < 16; i++) {
          if (user.diagonactics[0].risks[i] !== '') {
            valueEnterCounter++
          }
        }
        if (valueEnterCounter === 16){
          user.diagonacticCompleted = true
        }
        //end check if all risk value in entered

        user.save(function (err) {
          if (err) {
            return res.status(422).json({error: err})
          } else {
            return res.status(200).json(user)
          }
        })
      }
    }
  })
}

exports.deleteUser = function (req, res, next) {
  let id = req.params.id
  User.remove({
    _id: id
  }, function (err, user) {
    if (err) { res.send(err) }
    return res.status(200).json({ message: 'User successfully deleted' })
  })
}

exports.upload = function (req, res, next) {
    // upload.single(req.body);
    // return res.status(200).json({ message: 'User image successfully uploaded' });
    // console.log(req.files);
  if (req.file) {
    if (req.body.clientId) {
      User.findOne({'client': req.params.id}).exec(function (err, user) {
        if (err) {
          return res.status(422).json({error: err})
        } else {
          if (!user) {
            return res.status(422).json({error: 'document not found'})
          } else {
            user.logoPath = 'uploads/img/' + req.file.filename
            Client.findOne({'_id': req.params.id}).exec(function (err, client) {
              if (!err && client) {
                client.logoPath = 'uploads/img/' + req.file.filename
                client.save(function (err) {
                  user.save(function (err) {
                    if (err) {
                        return res.status(422).json({error: err})
                      } else {
                        return res.status(200).json({path: user.logoPath})
                      }
                  })
                })
              } else {
                return res.status(422).json({error: 'client not found'})
              }
            })
          }
        }
      })
    } else {
      User.findOne({'_id': req.params.id}).exec(function (err, user) {
        if (err) {
          return res.status(422).json({error: err})
        } else {
          if (!user) {
            return res.status(422).json({error: 'document not found'})
          } else {
            if (user.type === 'companyAdmin' && !req.body.profilePictureFlag) {
              user.logoPath = 'uploads/img/' + req.file.filename
              Client.findOne({'_id': user.client}).exec(function (err, client) {
                if (!err && client) {
                  client.logoPath = 'uploads/img/' + req.file.filename
                  client.save(function (err) {
                    user.save(function (err) {
                        if (err) {
                          return res.status(422).json({error: err})
                        } else {
                          return res.status(200).json({path: user.logoPath})
                        }
                      })
                  })
                } else {
                  user.save(function (err) {
                    if (err) {
                        return res.status(422).json({error: err})
                      } else {
                        return res.status(200).json({path: user.logoPath})
                      }
                  })
                }
              })
            } else {
              user.profilePicture = 'uploads/img/' + req.file.filename
              user.save(function (err) {
                if (err) {
                  return res.status(422).json({error: err})
                } else {
                  return res.status(200).json({path: user.profilePicture})
                }
              })
            }
          }
        }
      })
    }
  } else {
    return res.status(200).json({path: path})
  }
}

exports.submitContactForm = function (req, res, next) {
  console.log(req.body)
  let mailOptions = {
    from: 'info@changevu.com', // sender address
    to: 'amashiyat@gmail.com', // list of receivers
    subject: 'Contact Form', // Subject line
        // text: 'your request has bee accepted. Your password is: 1234', // plaintext body
    html: '<b>name:</b> ' + req.body.name + '<br/><br/> <b>email:</b> ' + req.body.email + '<br/><br/> <b>Phone Number:</b> ' + req.body.phoneNumber + '<br/><br/> <b>Time:</b> ' + req.body.time + '<br/><br/> <b>message:</b> ' + req.body.details
  }
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
            // return console.log(error);
    }
    console.log('Message sent: ' + info.response)
    return res.status(204).send()
  })
}

exports.forgot = function (req, res, next) {
  crypto.randomBytes(20, function (err, buf) {
    let token = buf.toString('hex')
        // done(err, token);
        // console.log(token);
    User.findOne({ email: req.body.email }, function (err, user) {
      if (!user) {
        return res.status(200).json({error: 'No User Found'})
      }
      user.resetPasswordToken = token
      user.resetPasswordExpires = Date.now() + 3600000 // 1 hour

      user.save(function (err) {
      })

      let mailOptions = {
        to: req.body.email,
        from: 'info@changevu.com',
        subject: 'Password Reset',
        text: 'You are receiving this because you have requested the reset of the password for your account.\n\n' +
                  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                  'http://' + req.headers.host + '/resetPassword/' + token + '\n\n' +
                  'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      }
      transporter.sendMail(mailOptions, function (err) {
        console.log('email sent')
        return res.status(200).json({message: 'Email Sent', token: token})
      })
    })
  })
}

exports.resetPassword = function (req, res, next) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
    if (!user) {
      return res.status(200).json('error', 'Password reset token is invalid or has expired.')
    }
    user.setPassword(req.body.password)
        // user.password = req.body.password;
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined

    user.save(function (err) {
      return res.status(200).json('message', 'Password changed successfully.')
    })
  })
}

exports.fileServe = function (req, res, next) {
  let filePath = 'uploads/' + req.params.fileName
  let extension = req.params.fileName.split('.')
  extension = extension[1]
  console.log(extension)
  fs.readFile(filePath, function (err, data) {
    console.log(err)
    if (extension == 'pdf') { res.contentType('application/pdf') }
    if (extension == 'doc') { res.contentType('application/vnd.openxmlformats-officedocument.wordprocessingml.document') }
    if (extension == 'docx') { res.contentType('application/vnd.openxmlformats-officedocument.wordprocessingml.document') }
    if (extension == 'xls') { res.contentType('application/vnd.ms-excel') }
    if (extension == 'xlsx') { res.contentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') }
    if (extension == 'ppt') { res.contentType('application/vnd.ms-powerpoint') }
    if (extension == 'txt') { res.contentType('application/text/plain') }
    res.send(data)
  })
}
