const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

    let testId
  
    test('Create an issue with every field', function(done) {
    chai
      .request(server)
      .post('/api/issues/chai-test-project')
      .send({"issue_title": "Test 1 Title", "issue_text": "Test 1 text.", "created_by": "Chai", "assigned_to": "Andy", "status_text": "Testing" })
      .end(function(err, res) {
        assert.equal(res.status, 200)
        assert.equal(res.body.issue_title, "Test 1 Title")
        assert.equal(res.body.issue_text, "Test 1 text.")
        assert.equal(res.body.created_by, "Chai")
        assert.equal(res.body.assigned_to, "Andy")
        assert.equal(res.body.status_text, "Testing")
        testId = res.body._id
        console.log(res.body._id)
        done()
      })
    })

    test('Create an issue with only required fields', function(done) {
    chai
      .request(server)
      .post('/api/issues/chai-test-project')
      .send({"issue_title": "Test 2 Title", "issue_text": "Test 2 text.", "created_by": "Chai"})
      .end(function(err, res) {
        assert.equal(res.status, 200)
        assert.equal(res.body.issue_title, "Test 2 Title")
        assert.equal(res.body.issue_text, "Test 2 text.")
        assert.equal(res.body.created_by, "Chai")
        assert.equal(res.body.assigned_to, "")
        assert.equal(res.body.status_text, "")
        done()
      })
    })

    test('Create an issue with missing required fields', function(done) {
    chai
      .request(server)
      .post('/api/issues/chai-test-project')
      .send({"issue_title": "Test 3 Title"})
      .end(function(err, res) {
        assert.equal(res.status, 200)
        assert.equal(res.body.error, "required field(s) missing")
        done()
      })
    })

    test('View issues on a project', function(done) {
    chai
      .request(server)
      .get('/api/issues/chai-test-project')
      .end(function(err, res) {
        assert.equal(res.status, 200)
        assert.isArray(res.body, "should return an array")
        done()
      })
    })

    test('View issues on a project with one filter', function(done) {
    chai
      .request(server)
      .get(`/api/issues/chai-test-project?id=${Math.floor(Math.random() * 1000000)}`)
      .end(function(err, res) {
        assert.equal(res.status, 200)
        assert.isArray(res.body, "should return an array")
        assert.equal(res.body.length, 0)
        done()
      })
    })

    test('View issues on a project with multiple filters', function(done) {
    chai
      .request(server)
      .get(`/api/issues/chai-test-project?=id=${Math.floor(Math.random() * 1000000)}&issue_text="test"`)
      .end(function(err, res) {
        assert.equal(res.status, 200)
        assert.isArray(res.body, "should return an array")
        assert.equal(res.body.length, 0)
        done()
      })
    })

    test('Update one field on an issue', function(done) {
    chai
      .request(server)
      .put('/api/issues/chai-test-project')
      .send({"_id": testId, "issue_text": "Test 7 updated."})
      .end(function(err, res) {
        assert.equal(res.status, 200)
        assert.equal(res.body.result, "successfully updated")
        done()
      })
    })

    test('Update multiple fields on an issue', function(done) {
    chai
      .request(server)
      .put('/api/issues/chai-test-project')
      .send({"_id": testId, "issue_text": "Test 8 updated.", "issue_title": "Test 8 Title" })
      .end(function(err, res) {
        assert.equal(res.status, 200)
        assert.equal(res.body.result, "successfully updated")
        done()
      })
    })

    test('Update an issue with missing _id', function(done) {
    chai
      .request(server)
      .put('/api/issues/chai-test-project')
      .send({"issue_text": "Test 9 updated.", "issue_title": "Test 9 Title" })
      .end(function(err, res) {
        assert.equal(res.status, 200)
        assert.equal(res.body.error, "missing _id")
        done()
      })
    })

    test('Update an issue with no fields to update:', function(done) {
    chai
      .request(server)
      .put('/api/issues/chai-test-project')
      .send({"_id": testId})
      .end(function(err, res) {
        assert.equal(res.status, 200)
        assert.equal(res.body.error, "no update field(s) sent")
        done()
      })
    })

    test('Update an issue with no fields to update:', function(done) {
    chai
      .request(server)
      .put('/api/issues/chai-test-project')
      .send({"_id": "nonsense-id", "issue_text": "Test 11 updated."})
      .end(function(err, res) {
        assert.equal(res.status, 200)
        assert.equal(res.body.error, "could not update")
        done()
      })
    })

    test('Delete an issue', function(done) {
    chai
      .request(server)
      .delete('/api/issues/chai-test-project')
      .send({"_id": testId})
      .end(function(err, res) {
        assert.equal(res.status, 200)
        assert.equal(res.body.result, "successfully deleted")
        done()
      })
    })
    test('Delete an issue with an invalid _id', function(done) {
    chai
      .request(server)
      .delete('/api/issues/chai-test-project')
      .send({"_id": "nonsense-id"})
      .end(function(err, res) {
        assert.equal(res.status, 200)
        assert.equal(res.body.error, "could not delete")
        done()
      })
    })

    test('Delete an issue with missing _id', function(done) {
    chai
      .request(server)
      .delete('/api/issues/chai-test-project')
      .send({})
      .end(function(err, res) {
        assert.equal(res.status, 200)
        assert.equal(res.body.error, "missing _id")
        done()
      })
    })
  
});
