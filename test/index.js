'use strict';
require('should');

var mongoose = require('mongoose');
var mongooseFS = require('../index.js');

var DB_URI = 'mongodb://localhost/test';

describe('For a single record', function () {
  var File = null;
  var id = null;

  before(function (done) {
    mongoose.connect(DB_URI, function(err) {
      if(err) {
        return done(err);
      }

      var fileSchema = mongoose.Schema({
        name: String,
        content: String,
        complement: {}
      });

      fileSchema.plugin(mongooseFS, {keys: ['content', 'complement']});
      File = mongoose.model('File', fileSchema);

      var file = new File({
        name: "huge.txt",
        content: "anyFetch is cool",
        complement: { some: { complicated: { stuff: true } } }
      });

      file.save(function (err, savedFile) {
        if(err) {
          return done(err);
        }
        id = savedFile._id;
        done();
      });
    });
  });

  it('does not store blobs into the mongo document', function (done) {
    File.findById(id, function (err, file) {
      if(err) {
        return done(err);
      }
      (file.get('content') === undefined).should.be.ok;
      (file.get('complement') === undefined).should.be.ok;
      file.get('name').should.be.exactly("huge.txt");
      done(err);
    });
  });

  it('does store blobs into GridFS', function (done) {
    File.findById(id, function (err, file) {
      if(err) {
        return done(err);
      }
      file.retrieveBlobs(function (err) {
        if(err) {
          return done(err);
        }
        file.get('content').should.be.exactly('anyFetch is cool');
        file.get('complement.some.complicated.stuff').should.be.ok;
        file.get('name').should.be.exactly("huge.txt");
        done();
      });
    });
  });

  it('does not alter the document if GridFS is not reloaded', function (done) {
    File.findById(id, function (err, file) {
      if(err) {
        return done(err);
      }
      file.save(function(err, file) {
        if(err) {
          return done(err);
        }
        file.retrieveBlobs(function (err) {
          if(err) {
            return done(err);
          }
          file.get('content').should.be.exactly('anyFetch is cool');
          done();
        });
      });
    });
  });

  after(function (done) {
    File.findByIdAndRemove(id, done);
  })

});