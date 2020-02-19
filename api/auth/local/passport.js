var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy

function localAuthenticate (User, email, password, done) {
  User.findOne({email: email}).exec()
    .then(user => {
      if (!user) {
        return done(null, false, {
          message: 'This email is not registered.'
        })
      }
      if (!user.isValidPassword(password)) {
        return done(null, false, { message: 'This password is not correct.' })
      } else {
        return done(null, user)
      }
    })
    .catch(err => done(err))
}

exports.setup = function (User) {
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password' // this is the virtual field on the model
  }, function (email, password, done) {
    return localAuthenticate(User, email, password, done)
  }))
}
