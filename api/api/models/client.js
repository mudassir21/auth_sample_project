'use strict';
var mongoose = require('mongoose')
	, Schema = mongoose.Schema

var client_schema=mongoose.Schema({
  companyName: String,
  websiteURL: String,
  logoPath: String,
  contactPerson:{
	firstName:String,
	lastName:String,
	email:String,
	role:String,
	phone:String
	},
  address: {
	country:String,
	city:String,
	postalCode:String,
	street:String
	}
});

mongoose.model('Client',client_schema);