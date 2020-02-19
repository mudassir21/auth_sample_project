'use strict'

var jwt = require('jsonwebtoken')
var expressJwt = require('express-jwt')
var mongoose = require('mongoose')
var User = mongoose.model('User')
var compose = require('composable-middleware')

var validateJwt = expressJwt({
  secret: 'ChangeVUAPI-Secret'
})

/**
 * Checks if the user role meets the minimum requirements of the route
 */
exports.hasRole = function (roleRequired) {
  if (!roleRequired) {
    throw new Error('Required role needs to be set')
  }

  return compose()
    .use(exports.isAuthenticated())
    .use(function meetsRequirements (req, res, next) {
      if (roleRequired === 'admin') {
        if (req.user.type === 'companyAdmin' || req.user.type === 'superAdmin') {
          next()
        } else {
          res.status(403).send('Forbidden')
        }
      } else {
        if (req.user.type === roleRequired) {
          next()
        } else {
          res.status(403).send('Forbidden')
        }
      }
    })
}

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
exports.isAuthenticated = function () {
  return compose()
    // Validate jwt
    .use(function (req, res, next) {
      // console.log('-------------------------------------------------------');
      // console.log(req.headers.authorization);
      if (req.headers.authorization) { req.headers.authorization = req.headers.authorization.trim() }
      // allow access_token to be passed through query parameter as well
      // if (req.query && req.query.hasOwnProperty('access_token')) {
      //   req.headers.authorization = 'Bearer ' + req.query.access_token;
      // }
      validateJwt(req, res, next)
    })
    // Attach user to request
    .use(function (req, res, next) {
      // console.log(req.user);
      User.findById(req.user._id).exec()
        .then(user => {
          if (!user) {
            return res.status(401).end()
          }
          req.user = user
          next()
        })
        .catch(err => next(err))
    })
}

/**
 * Returns a jwt token signed by the app secret
 */
exports.signToken = function (id, role) {
  return jwt.sign({ _id: id, role: role }, 'ChangeVUAPI-Secret', {
    expiresIn: 60 * 60 * 5
  })
}

/**
 * Set token cookie directly for oAuth strategies
 */
exports.setTokenCookie = function (req, res) {
  if (!req.user) {
    return res.status(404).send('It looks like you aren\'t logged in, please try again.')
  }
  var token = signToken(req.user._id, req.user.Role)
  res.cookie('token', token)
  res.redirect('/')
}
