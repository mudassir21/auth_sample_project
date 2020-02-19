'use strict'
let mongoose = require('mongoose')
let Initiative = mongoose.model('Initiative')
let User = mongoose.model('User')
let _ = require('underscore')
mongoose.Promise = global.Promise

exports.getInitiative = function (req, res, next) {
  let id = req.params.id
  Initiative.findOne({ _id: id }).exec(function (err, initiative) {
    if (err) {
      next(err)
    } else {
      if (!initiative) {
        return res.status(401).end()
      } else {
        return res.status(200).json(initiative)
      }
    }
  })
}

exports.getModeratorList = function (req, res, next) {
  let id = req.params.id

  Initiative.findOne({_id: id}).populate('members.user', 'firstName lastName _id').populate('creator', 'firstName lastName _id').exec(function (err, initiative) {
    if (err) {
      next(err)
    } else {
      if (!initiative) {
        return res.status(401).end()
      } else {
        let userList = []
        let moderatorList = []
        userList.push(initiative.creator._id.toString())
        moderatorList.push({_id: initiative.creator._id, name: initiative.creator.firstName + ' ' + initiative.creator.lastName})
        for (let i = 0; i < initiative.members.length; i++) {
          userList.push(initiative.members[i].user._id.toString())
          moderatorList.push({_id: initiative.members[i].user._id, name: initiative.members[i].user.firstName + ' ' + initiative.members[i].user.lastName})
        }
        return res.status(200).json({moderatorList: moderatorList})
      }
    }
  })
}
exports.getTeamDetailsReport = function (req, res, next) {
  let id = req.params.id

  Initiative.findOne({_id: id}).populate('members.user', 'firstName lastName _id').populate('creator', 'firstName lastName _id').exec(function (err, initiative) {
    if (err) {
      next(err)
    } else {
      if (!initiative) {
        return res.status(401).end()
      } else {
        let userList = []
        let moderatorList = []
        userList.push(initiative.creator._id.toString())
        moderatorList.push({_id: initiative.creator._id, name: initiative.creator.firstName + ' ' + initiative.creator.lastName})
        for (let i = 0; i < initiative.members.length; i++) {
          userList.push(initiative.members[i].user._id.toString())
          moderatorList.push({_id: initiative.members[i].user._id, name: initiative.members[i].user.firstName + ' ' + initiative.members[i].user.lastName})
        }
        User.find({'diagonactics.initiative': id}).exec(function (err, users) {
          if (err) {
            next(err)
          } else {
                        // console.log(users);
            let report = []
            let sponsorshipAvg
            let programmeManagementAvg
            let organizationCapabilityAvg
            let peopleEngagementAvg
            let userTag
            let j, i

            for (i = 0; i < users.length; i++) {
              let index = userList.indexOf(users[i]._id.toString())
              if (index !== -1) {
                userList.splice(index, 1)
              }
              let find = _.filter(users[i].diagonactics, function (item) {
                return item.initiative.equals(id)
              })

              sponsorshipAvg = 0
              let count = 0
              for (j = 0; j < 4; j++) {
                if (find[0].risks[j]) {
                  sponsorshipAvg += parseFloat(parseFloat(find[0].risks[j]).toFixed(1))
                  count++
                }
              }
              if (count) {
                sponsorshipAvg = parseFloat(sponsorshipAvg / count).toFixed(1)
              } else {
                sponsorshipAvg = ''
              }

              programmeManagementAvg = 0
              count = 0
              for (j = 4; j < 8; j++) {
                if (find[0].risks[j]) {
                  programmeManagementAvg += parseFloat(parseFloat(find[0].risks[j]).toFixed(1))
                  count++
                }
              }
              if (count) {
                programmeManagementAvg = parseFloat(programmeManagementAvg / count).toFixed(1)
              } else {
                programmeManagementAvg = ''
              }

              organizationCapabilityAvg = 0
              count = 0
              for (j = 8; j < 12; j++) {
                if (find[0].risks[j]) {
                  organizationCapabilityAvg += parseFloat(parseFloat(find[0].risks[j]).toFixed(1))
                  count++
                }
              }
              if (count) {
                organizationCapabilityAvg = parseFloat(organizationCapabilityAvg / count).toFixed(1)
              } else {
                organizationCapabilityAvg = ''
              }

              peopleEngagementAvg = 0
              count = 0
              for (j = 12; j < 16; j++) {
                if (find[0].risks[j]) {
                  peopleEngagementAvg += parseFloat(parseFloat(find[0].risks[j]).toFixed(1))
                  count++
                }
              }
              if (count) {
                peopleEngagementAvg = parseFloat(peopleEngagementAvg / count).toFixed(1)
              } else {
                peopleEngagementAvg = ''
              }

              userTag = 'R' + (i + parseInt(1))

              report.push({userTag: userTag,
                risks: find[0].risks,
                sponsorshipAvg: sponsorshipAvg,
                programmeManagementAvg: programmeManagementAvg,
                organizationCapabilityAvg: organizationCapabilityAvg,
                peopleEngagementAvg: peopleEngagementAvg})
            }
            let l = i
            if (userList.length > 0) {
              let blankRisk = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
              for (let i = 0; i < userList.length; i++) {
                userTag = 'R' + (l + parseInt(1))
                report.push({userTag: userTag,
                  risks: blankRisk,
                  sponsorshipAvg: '',
                  programmeManagementAvg: '',
                  organizationCapabilityAvg: '',
                  peopleEngagementAvg: ''})
                l++
              }
            }

            let teamAvg = []
            let rangeMin = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
            let rangeMax = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
            for (let i = 0; i < 16; i++) {
              teamAvg[i] = 0
              count = 0
              for (let j = 0; j < report.length; j++) {
                if (!rangeMin[i]) { rangeMin[i] = report[j].risks[i] }
                if (!rangeMax[i]) { rangeMax[i] = report[j].risks[i] }

                if (parseFloat(report[j].risks[i]) <= parseFloat(rangeMin[i])) {
                  rangeMin[i] = report[j].risks[i]
                }

                if (parseFloat(report[j].risks[i]) >= parseFloat(rangeMax[i])) {
                  rangeMax[i] = report[j].risks[i]
                }
                if (report[j].risks[i]) {
                  teamAvg[i] += parseFloat(parseFloat(report[j].risks[i]).toFixed(1))
                  count++
                }
              }
              if (count > 0) {
                teamAvg[i] = parseFloat(teamAvg[i] / count).toFixed(1)
              } else {
                teamAvg[i] = ''
                rangeMin[i] = ''
                rangeMax[i] = ''
              }
            }

           let teamAvgFinal = [0, 0, 0, 0]
            count = 0
            for (let i = 0; i < 4; i++) {
              if (teamAvg[i]) {
                teamAvgFinal[0] += parseFloat(parseFloat(teamAvg[i]).toFixed(1))
                count++
              }
            }
            if (count > 0) {
              teamAvgFinal[0] = parseFloat(teamAvgFinal[0] / count).toFixed(1)
            } else {
              teamAvgFinal[0] = ''
            }

            count = 0
            for (let i = 4; i < 8; i++) {
              if (teamAvg[i]) {
                teamAvgFinal[1] += parseFloat(parseFloat(teamAvg[i]).toFixed(1))
                count++
              }
            }
            if (count > 0) {
              teamAvgFinal[1] = parseFloat(teamAvgFinal[1] / count).toFixed(1)
            } else {
              teamAvgFinal[1] = ''
            }

            count = 0
            for (let i = 8; i < 12; i++) {
              if (teamAvg[i]) {
                teamAvgFinal[2] += parseFloat(parseFloat(teamAvg[i]).toFixed(1))
                count++
              }
            }
            if (count > 0) {
              teamAvgFinal[2] = parseFloat(teamAvgFinal[2] / count).toFixed(1)
            } else {
              teamAvgFinal[2] = ''
            }

            count = 0
            for (let i = 12; i < 16; i++) {
              if (teamAvg[i]) {
                teamAvgFinal[3] += parseFloat(parseFloat(teamAvg[i]).toFixed(1))
                count++
              }
            }
            if (count > 0) {
              teamAvgFinal[3] = parseFloat(teamAvgFinal[3] / count).toFixed(1)
            } else {
              teamAvgFinal[3] = ''
            }

            let rangeMinFinal = ['', '', '', '']
            let rangeMaxFinal = ['', '', '', '']
            let minFlag = [0, 0, 0, 0]
            let maxFlag = [0, 0, 0, 0]

            for (let i = 0; i < report.length; i++) {
              if (!rangeMinFinal[0]) {
                rangeMinFinal[0] = report[i].sponsorshipAvg
              }
              if (!rangeMinFinal[1]) {
                rangeMinFinal[1] = report[i].programmeManagementAvg
              }
              if (!rangeMinFinal[2]) {
                rangeMinFinal[2] = report[i].organizationCapabilityAvg
              }
              if (!rangeMinFinal[3]) {
                rangeMinFinal[3] = report[i].peopleEngagementAvg
              }

              if (!rangeMaxFinal[0]) {
                rangeMaxFinal[0] = report[i].sponsorshipAvg
              }
              if (!rangeMaxFinal[1]) {
                rangeMaxFinal[1] = report[i].programmeManagementAvg
              }
              if (!rangeMaxFinal[2]) {
                rangeMaxFinal[2] = report[i].organizationCapabilityAvg
              }
              if (!rangeMaxFinal[3]) {
                rangeMaxFinal[3] = report[i].peopleEngagementAvg
              }

              if (parseFloat(report[i].sponsorshipAvg) <= parseFloat(rangeMinFinal[0])) {
                rangeMinFinal[0] = report[i].sponsorshipAvg
                minFlag[0] = 1
              }
              if (parseFloat(report[i].sponsorshipAvg) >= parseFloat(rangeMaxFinal[0])) {
                rangeMaxFinal[0] = report[i].sponsorshipAvg
                maxFlag[0] = 1
              }

              if (parseFloat(report[i].programmeManagementAvg) <= parseFloat(rangeMinFinal[1])) {
                rangeMinFinal[1] = report[i].programmeManagementAvg
                minFlag[1] = 1
              }
              if (parseFloat(report[i].programmeManagementAvg) >= parseFloat(rangeMaxFinal[1])) {
                rangeMaxFinal[1] = report[i].programmeManagementAvg
                maxFlag[1] = 1
              }

              if (parseFloat(report[i].organizationCapabilityAvg) <= parseFloat(rangeMinFinal[2])) {
                rangeMinFinal[2] = report[i].organizationCapabilityAvg
                minFlag[2] = 1
              }
              if (parseFloat(report[i].organizationCapabilityAvg) >= parseFloat(rangeMaxFinal[2])) {
                rangeMaxFinal[2] = report[i].organizationCapabilityAvg
                maxFlag[2] = 1
              }

              if (parseFloat(report[i].peopleEngagementAvg) <= parseFloat(rangeMinFinal[3])) {
                rangeMinFinal[3] = report[i].peopleEngagementAvg
                minFlag[3] = 1
              }
              if (parseFloat(report[i].peopleEngagementAvg) >= parseFloat(rangeMaxFinal[3])) {
                rangeMaxFinal[3] = report[i].peopleEngagementAvg
                maxFlag[3] = 1
              }
            }
           return res.status(200).json({moderatorList: moderatorList, rangeMinFinal: rangeMinFinal, rangeMaxFinal: rangeMaxFinal, teamAvgFinal: teamAvgFinal, report: report, teamAvg: teamAvg, rangeMin: rangeMin, rangeMax: rangeMax})
          }
        })
      }
    }
  })
}

exports.getCommentDetailsReport = function (req, res, next) {
  let id = req.params.id

  Initiative.findOne({_id: id}).exec(function (err, initiative) {
    if (err) {
      next(err)
    } else {
      if (!initiative) {
        return res.status(401).end()
      } else {
                // let userList = [];
        let commentReport = []
                // userList.push(initiative.creator.toString());
                // for(let i=0;i<initiative.members.length;i++){
                //     userList.push(initiative.members[i].user.toString());
                // }
        User.find({'diagonactics.initiative': id}).select('_id firstName lastName diagonactics').exec(function (err, users) {
          if (err) {
            next(err)
          } else {
            for (let i = 0; i < users.length; i++) {
                            // console.log(users[i].diagonactics);
              let find = _.filter(users[i].diagonactics, function (item) {
                return item.initiative.equals(id)
              })
                            // console.log(find);
              if (find.length > 0) {
                if (find[0].comments.length > 0) {
                  commentReport.push({userName: 'R' + i, comments: find[0].comments})
                }
              }
            }
            let x, j
            for (let i = commentReport.length - 1; i > 0; i--) { // suffle comments randomly
              for (let k = 0; k < 16; k++) {
                j = Math.floor(Math.random() * (i + 1))
                x = commentReport[i].comments[k]
                commentReport[i].comments[k] = commentReport[j].comments[k]
                commentReport[j].comments[k] = x
              }
            }
            console.log(commentReport)
            return res.status(200).json(commentReport)
          }
        })
      }
    }
  })
}

exports.getCreatedInitiatives = function (req, res, next) {
  let id = req.params.id

  User.findOne({_id: id}).exec(function (err, user) {
    if (err) {
      next(err)
    } else {
      if (user.type === 'companyAdmin') {
        Initiative.find({creator: id}).populate('creator', 'firstName lastName _id').populate('teamLead', 'firstName lastName _id').populate('members.user', 'firstName lastName _id joining email diagonacticCompleted type').exec(function (err, initiatives) {
          if (err) {
            next(err)
          } else {
            return res.status(200).json(initiatives)
          }
        })
      } else if (user.type === 'superAdmin') {
        Initiative.find().populate('creator', 'firstName lastName _id').populate('teamLead', 'firstName lastName _id').populate('members.user', 'firstName lastName _id joining email diagonacticCompleted type').exec(function (err, initiatives) {
          if (err) {
            next(err)
          } else {
            return res.status(200).json(initiatives)
          }
        })
      } else {
        Initiative.find({'members.user': id}).populate('creator', 'firstName lastName _id').populate('teamLead', 'firstName lastName _id').populate('members.user', 'firstName lastName _id joining email diagonacticCompleted type').exec(function (err, initiatives) {
          if (err) {
            next(err)
          } else {
            return res.status(200).json(initiatives)
          }
        })
      }
    }
  })
}

exports.getInitiatives = function (req, res, next) {
  Initiative.find().exec(function (err, initiatives) {
    if (err) {
      next(err)
    } else {
      return res.status(200).json(initiatives)
    }
  })
}

exports.createInitiative = function (req, res, next) {
  User.findOne({_id: req.body.userID}).exec(function (err, user) {
    if (err) {
      next(err)
    } else {
      let initiative = new Initiative(req.body.initiative)
      initiative.teamLead = user
      initiative.creator = user
      initiative.members = []
      initiative.members.push({user: user})
      if (initiative.members) {
        initiative.membersCount = initiative.members.length
      }
      initiative.save(function (err, initiative) {
        if (err) {  // TODO handle the error
          console.log(err)
          return res.status(422).json({error: 'error in saving Initiative'})
        } else {
          return res.status(200).json(initiative)
        }
      })
    }
  })
}

exports.updateInitiative = function (req, res, next) {
  Initiative.findOne({'_id': req.params.id}).exec(function (err, initiative) {
    if (err) {
      return res.status(422).json({error: err})
    } else {
      if (!initiative) {
        return res.status(422).json({error: 'document not found'})
      } else {
                // initiative = _l.merge(initiative,req.body);
        if (req.body.currentMitigation) {
          console.log(req.body)
          let find = _.filter(initiative.mitigation, function (item) {
            return item._id.equals(req.body.currentMitigation._id)
          })
          if (find.length > 0) {
            if (req.body.currentMitigation.score) { find[0].risks = req.body.currentMitigation.score }
            if (req.body.currentMitigation.successActions) { find[0].successActions = req.body.currentMitigation.successActions }
            if (req.body.currentMitigation.deadlines) { find[0].deadlines = req.body.currentMitigation.deadlines }
            if (req.body.currentMitigation.priority) { find[0].priority = req.body.currentMitigation.priority }
            if (req.body.currentMitigation.responsibility) { find[0].Responsibility = req.body.currentMitigation.responsibility }
            initiative.markModified('mitigation')
          } else {
            return res.status(422).json({error: 'document not found'})
          }
        } else if (req.body.question) {
                    // console.log(req.body);
          if (!initiative.mitigation) {
            initiative.mitigation = []
          }

          let len = initiative.mitigation.length - 1

          if (req.body.question.name) { initiative.mitigation[len].PhaseIdentifier = req.body.question.name }
          if (req.body.question.comments) { initiative.mitigation[len].comments = req.body.question.comments }
          if (req.body.question.score) { initiative.mitigation[len].risks = req.body.question.score }
          if (req.body.question.successActions) { initiative.mitigation[len].successActions = req.body.question.successActions }
          if (req.body.question.deadlines) { initiative.mitigation[len].deadlines = req.body.question.deadlines }
          if (req.body.question.priority) { initiative.mitigation[len].priority = req.body.question.priority }
          if (req.body.question.responsibility) { initiative.mitigation[len].Responsibility = req.body.question.responsibility }
          initiative.mitigation[len].submitted = true
          initiative.markModified('mitigation')
                    // console.log(initiative.mitigation);
        } else {
          for (let prop in req.body) {
            if (prop == '_id' || prop == '_v' || prop == 'creator' || prop == 'index') {
              continue
            } else if (prop == 'mitigationModerator') {
              if (!initiative.mitigation) {
                initiative.mitigation = []
              }
              let index = initiative.mitigation.length - 1
              if (index < 0) {
                index = 0
              }
              if (initiative.mitigation.length > 0) {
                if (initiative.mitigation[index].Moderator && !initiative.mitigation[index].submitted) {
                                    // console.log('yes')
                    initiative.mitigation[index].Moderator = req.body.mitigationModerator
                  } else {
                                    // console.log('no')
                    initiative.mitigation.push({Moderator: req.body.mitigationModerator})
                  }
              } else {
                initiative.mitigation.push({Moderator: req.body.mitigationModerator})
              }

              initiative.markModified('mitigation')
            } else if (prop == 'moderator') {
              if (!initiative.debrief) {
                  initiative.debrief = []
                  initiative.debrief.push({Moderator: req.body.moderator})
                } else if (!initiative.debrief[0]) {
                  initiative.debrief = []
                  initiative.debrief.push({Moderator: req.body.moderator})
                } else {
                  initiative.debrief[0].Moderator = req.body.moderator
                }
              initiative.markModified('debrief')
            } else if (prop == 'baselineScore' && req.body.baselineScore) {
                if (!initiative.debrief[0].BaselineScore) {
                  initiative.debrief[0].BaselineScore = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
                } else {
                  initiative.debrief[0].BaselineScore[req.body.index] = req.body.baselineScore
                }
                initiative.markModified('debrief')
              } else if (prop == 'baselineScoreArray' && req.body.baselineScoreArray) {
                initiative.debrief[0].BaselineScore = req.body.baselineScoreArray

                initiative.markModified('debrief')
              } else if (prop == 'riskPriority' && req.body.riskPriority) {
                  if (!initiative.debrief[0].RiskPriority) {
                      initiative.debrief[0].RiskPriority = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
                    } else {
                      initiative.debrief[0].RiskPriority[req.body.index] = req.body.riskPriority
                    }
                  initiative.markModified('debrief')
                } else if (prop == 'comment' && req.body.comment) {
                    if (!initiative.debrief[0].Comments) {
                        initiative.debrief[0].Comments = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
                      } else {
                        initiative.debrief[0].Comments[req.body.index] = req.body.comment
                      }
                    initiative.markModified('debrief')
                  } else if (prop == 'submissionIndex') {
                      initiative.debrief[0].ifDebriefSubmitted = true

                      initiative.markModified('debrief')
                    } else {
                      initiative[prop] = req.body[prop]
                    }
          }
        }

        if (initiative.members) {
          initiative.membersCount = initiative.members.length
        }
        initiative.save(function (err) {
          if (err) {
            console.log(err)
            return res.status(422).json({error: err})
          } else {
            Initiative.findOne({'_id': req.params.id}).populate('creator', 'firstName lastName _id').populate('teamLead', 'firstName lastName _id').populate('members.user', 'firstName lastName _id').exec(function (err, initiative) {
              if (err) {
                next(err)
              } else {
                return res.status(200).json(initiative)
              }
            })
          }
        })
      }
    }
  })
}

exports.deleteInitiative = function (req, res, next) {
  let id = req.params.id
  Initiative.remove({
    _id: id
  }, function (err, user) {
    if (err) { res.send(err) }
    return res.status(200).json({ message: 'Initiative successfully deleted' })
  })
}

exports.upload = function (req, res, next) {
    // console.log(req.files)
    // console.log(req.file)
    // console.log(req.body);
  let fileNameList = req.body.fileNameList
  let id = req.params.id
  if (req.files) {
    Initiative.findOne({'_id': req.params.id}).exec(function (err, initiative) {
      if (err) {
        return res.status(422).json({error: err})
      } else {
        let index = initiative.mitigation.length - 1
                // console.log(initiative.mitigation.length);
                // console.log(index);
        if (index < 0) {
          index = 0
        }
        if (!initiative.mitigation[index].Deliverable) {
          initiative.mitigation[index].Deliverable = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
        }
        if (!initiative.mitigation[index].DeliverablePath) {
          initiative.mitigation[index].DeliverablePath = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
        }
        for (let prop in req.files) {
          let fileIndex = prop.split('file')
                    // console.log(fileIndex);
          fileIndex = fileIndex[1]
          fileIndex--
          initiative.mitigation[index].Deliverable[fileIndex] = fileNameList[fileIndex]
          initiative.mitigation[index].DeliverablePath[fileIndex] = 'uploads/' + req.files[prop][0].filename
        }
        initiative.markModified('mitigation')
        initiative.save(function (err) {
          if (err) {
            console.log(err)
            return res.status(422).json({error: err})
          } else {
            return res.status(200).json(initiative)
          }
        })
      }
    })
  } else {
    return res.status(204).end()
  }
}
