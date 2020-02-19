'use strict'
var mongoose = require('mongoose'),
  Schema = mongoose.Schema

var initiative_schema = mongoose.Schema({
  creator: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  members: [{// status: {type: String,default: "member"},//admin
		user: {
      type: Schema.ObjectId,
      ref: 'User'
    }
  }],
  teamLead: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  membersCount: {
    type: Number,
    default: 1
  },
  invitedCount: {
    type: Number,
    default: 1
  },
  initiativeName: {type: String, default: ''},
  initiativeDescription: {type: String, default: ''},
  phase: {type: String, default: ''},
  identifier: {type: String, default: ''},
  deadline: {type: Date},
  type: {type: String, default: ''},
  scope: {type: String, default: ''},
  timeFrame: {type: String, default: ''},
  implementationStage: {type: String, default: ''},
  benifitDescription: {type: String, default: ''},
  benifitAllocation: {type: String, default: ''},
  benifitMetrics: {type: String, default: ''},
  teamName: {type: String, default: ''},
  teamType: {type: String, default: ''},
  teamDescription: {type: String, default: ''},
  phaseIdentifier: {type: String, default: ''},

		// there will be only one debrief session per initiative as this point
		// still making it a array in case we need it in future.
  debrief: [{
    Moderator: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    BaselineScore: [],
    Range: [],
    Comments: [], // 16 elements
    adjustedRsiks: [],  // 16 elements
    RiskPriority: [],
    ifDebriefSubmitted: {type: Boolean, default: false}
  }],
  mitigation: [{
    Moderator: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    PhaseIdentifier: {type: String, default: ''},
	// BaselineScore:[],
    risks: [],    // 16 elements
    comments: [], // 16 elements
    successActions: [],  // 16 elements
    priority: [],
    Deliverable: [], // 16 files
    DeliverablePath: [], // 16 files
    Responsibility: [], // 16 files
    deadlines: [],   // 16 dates,
    submitted: {type: Boolean, default: false}
  }]

})

mongoose.model('Initiative', initiative_schema)
