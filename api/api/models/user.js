'use strict'
var mongoose = require('mongoose'),
	 Schema = mongoose.Schema,
	 crypto = require('crypto'),
	 uuid = require('node-uuid')

var user_schema = mongoose.Schema({
  firstName: String,
  lastName: String,
  userRole: String,
  email: String,
  profilePicture: String,
  logoPath: String,
  Role: String,
  Regions: String,
  Departments: String,
  password: {type: String, default: ''},
  salt: { type: String, required: true, default: uuid.v1 },
  joining: {type: Date},
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  type: {type: String, default: 'user'},
  lastlogin: {type: Date},
  invitedBy: { // creator admin ref.
    type: Schema.ObjectId,
    ref: 'User'
  },
  client: {
    type: Schema.ObjectId,
    ref: 'Client'
  },
  admin: { // creator admin ref.
    type: Schema.ObjectId,
    ref: 'User'
  },
  currentInitiative: {
    type: Schema.ObjectId,
    ref: 'Initiative'
  },
  diagonactics: [{
    initiative: {
      type: Schema.ObjectId,
      ref: 'Initiative'
    },
    risks: [],    // 16 elements
    comments: [] // 16 elements
  }],
  diagonacticCompleted: false
})

// Validate empty email
user_schema
	.path('email')
	.validate(function (email) {
  return email.length
}, 'Email cannot be blank')

/* // Validate empty password
user_schema
	.path('password')
	.validate(function (password) {
  return password.length
}, 'Password cannot be blank') */

// Validate email is not taken
/* user_schema
	.path('email')
	.validate(function(value, respond) {
		var self = this;
		return this.constructor.findOne({ email: new RegExp(value, "i") }).exec()
			.then(function(user) {
				if (user) {
					if (self.id === user.id) {
						return respond(true);
					}
					return respond(false);
				}
				return respond(true);
			})
			.catch(function(err) {
				throw err;
			});
	}, 'The specified email address is already in use.')

var validatePresenceOf = function(value) {
	return value && value.length;
} */

var hash = function (passwd, salt) {
  return crypto.createHmac('sha256', salt).update(passwd).digest('hex')
}

user_schema.methods.setPassword = function (passwordString) {
  this.password = hash(passwordString, this.salt)
}
user_schema.methods.isValidPassword = function (passwordString) {
  return this.password === hash(passwordString, this.salt)
}

mongoose.model('User', user_schema)

exports.getUserSchema = function () {
  return user_schema
}
