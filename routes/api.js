'use strict';
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);

const issueSchema = new mongoose.Schema({
    project: String,
    assigned_to: String, 
    status_text: String, 
    open: Boolean, 
    issue_title: String, 
    issue_text: String, 
    created_by: String, 
    created_on: Date, 
    updated_on: Date
})

const IssueModel = mongoose.model('Issue', issueSchema)

module.exports = function (app) {
  app.route('/api/issues/:project')
    
    .get(function (req, res){
      let project = req.params.project
      
      const queries = req.query
      if (queries._id) {
        queries.id = queries._id
      }
      const queryKeys = Object.keys(queries)
          
      IssueModel.find({project: project}, (err, data) => {
        
        let filteredData = data
        
        for (let n = 0; n < queryKeys.length; n++) {
          if (queryKeys[n] === "_id") {
            continue
          }
          
          if (queries[queryKeys[n]] === "true") {
            queries[queryKeys[n]] = true
          }
          if (queries[queryKeys[n]] === "false") {
            queries[queryKeys[n]] = false
          }
          
          filteredData = filteredData.filter(issue => issue[queryKeys[n]] === queries[queryKeys[n]])

        }

        res.json(filteredData.map(issue => ({
          assigned_to: issue.assigned_to || "", 
          status_text: issue.status_text || "", 
          open: issue.open, 
          _id: issue._id, 
          issue_title: issue.issue_title, 
          issue_text: issue.issue_text, 
          created_by: issue.created_by, 
          created_on: issue.created_on,
          updated_on: issue.updated_on})))
        })
      })
      
    
    
    .post(function (req, res) {
      let project = req.params.project;
      if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
        res.json({ error: 'required field(s) missing' })
      } else {
        const newIssue = new IssueModel({
          project: project,
          assigned_to: req.body.assigned_to, 
          status_text: req.body.status_text, 
          open: true, 
          issue_title: req.body.issue_title, 
          issue_text: req.body.issue_text, 
          created_by: req.body.created_by, 
          created_on: new Date(), 
          updated_on: new Date()
          })

          newIssue.save((err, data) => {
           if (err) return console.error(err)
           res.send({status_text: req.body.status_text || "", 
                    assigned_to: data.assigned_to || "", 
                    open: data.open, _id: data._id, 
                    issue_title: data.issue_title, 
                    issue_text: data.issue_text, 
                    created_by: data.created_by, 
                    created_on: data.created_on, 
                    updated_on: data.updated_on})
        })
        

    }})        
  
      

    
    .put(function (req, res){
      let project = req.params.project;
      
      if (!req.body._id) {
        res.json({ error: 'missing _id' })
        return
      }

      let fieldNums = 0
      for (const key in req.body) {
          if (req.body[key]) {
            fieldNums++
          }
        }
      
      if (fieldNums < 2) {
        res.json({ error: 'no update field(s) sent', '_id': req.body._id })
        return
      }
      

      IssueModel.findById({_id: req.body._id}, (err, data) => {
    
        if (err) {
          res.json({ error: 'could not update', '_id': req.body._id })
          return console.error(err)
        }
        
        if (!data) {
            res.json({ error: 'could not update', '_id': req.body._id })
            return
        }
        
        for (const key in req.body) {
          if (req.body[key]) {
            data[key] = req.body[key]
          }
        }
        data.updated_on = new Date()
        data.save((err, data) => {
          if (err) return console.error(err);
          res.json({  result: 'successfully updated', '_id': req.body._id })
       })
      })
    })
    
    .delete(function (req, res) {
      let project = req.params.project;
      
      if (!req.body._id) {
        res.json({ error: 'missing _id' })
        return
      }
      
      IssueModel.findByIdAndRemove({_id: req.body._id}, (err, data) => {

        if (!data) {
          res.json({ error: 'could not delete', '_id': req.body._id })
          return
        }
        
        if (err) {
          console.error(err)
          res.json({ error: 'could not delete', '_id': req.body._id })
          return
        }
        
        res.json({ result: 'successfully deleted', '_id': req.body._id })
        return
       })
      });
    
};
