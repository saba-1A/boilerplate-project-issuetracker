'use strict';
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const issueSchema = new mongoose.Schema({
  project: String,
  assigned_to: String,
  status_text: String,
  open: { type: Boolean, default: true },
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  created_on: Date,
  updated_on: Date
});

const IssueModel = mongoose.model('Issue', issueSchema);

module.exports = function (app) {
  app.route('/api/issues/:project')

    // GET: View all issues for a project, with optional filters
    .get(async function (req, res) {
      const project = req.params.project;
      const query = { project, ...req.query };

      if (query.open === 'true') query.open = true;
      if (query.open === 'false') query.open = false;

      try {
        const issues = await IssueModel.find(query).select('-__v');
        res.json(issues);
      } catch (err) {
        res.status(500).json({ error: 'server error' });
      }
    })

    // POST: Create a new issue
    .post(async function (req, res) {
      const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      const newIssue = new IssueModel({
        project,
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || '',
        open: true,
        created_on: new Date(),
        updated_on: new Date()
      });

      try {
        const savedIssue = await newIssue.save();
        const { _id, created_on, updated_on } = savedIssue;

        res.json({
          _id,
          issue_title,
          issue_text,
          created_by,
          assigned_to: savedIssue.assigned_to,
          status_text: savedIssue.status_text,
          open: savedIssue.open,
          created_on,
          updated_on
        });
      } catch (err) {
        res.status(500).json({ error: 'could not create issue' });
      }
    })

    // PUT: Update an existing issue
    .put(async function (req, res) {
      const { _id, ...updates } = req.body;

      if (!_id) return res.json({ error: 'missing _id' });

      // Filter out empty update fields
      const fieldsToUpdate = {};
      for (const key in updates) {
        if (updates[key] !== '') {
          fieldsToUpdate[key] = updates[key];
        }
      }

      if (Object.keys(fieldsToUpdate).length === 0) {
        return res.json({ error: 'no update field(s) sent', _id });
      }

      fieldsToUpdate.updated_on = new Date();

      try {
        const updated = await IssueModel.findByIdAndUpdate(_id, fieldsToUpdate, { new: true });
        if (!updated) return res.json({ error: 'could not update', _id });

        res.json({ result: 'successfully updated', _id });
      } catch (err) {
        res.json({ error: 'could not update', _id });
      }
    })

    // DELETE: Delete an issue by ID
    .delete(async function (req, res) {
      const { _id } = req.body;

      if (!_id) return res.json({ error: 'missing _id' });

      try {
        const deleted = await IssueModel.findByIdAndDelete(_id);
        if (!deleted) return res.json({ error: 'could not delete', _id });

        res.json({ result: 'successfully deleted', _id });
      } catch (err) {
        res.json({ error: 'could not delete', _id });
      }
    });
};
