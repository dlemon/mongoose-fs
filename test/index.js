'use strict';
var should = require('chai').should();

var mongoose = require('mongoose');
var gridStore = require('../index.js');
var URI = 'mongodb://localhost/test';

var email;
var emailSchema;

describe('Schema decoration',function() {

    before(function(done) {
       mongoose.connect(URI, function(err){
            if (err) {
              return done(err);
            } 
          
            emailSchema = new mongoose.Schema({
                from   : {type:String, default:''},
                to     : {type:String, default:''},
                subject: {type:String, default:''}
            });
            
            emailSchema.plugin(gridStore, {keys:['property1', 'property2']});
            var Email = mongoose.model('Email', emailSchema);
            email = new Email();   
            done();
       });
    });       
    
    it('should decorate with an attachments array', function() {
       email.should.have.property('attachments'); 
       email.attachments.should.be.an('Array');
    });
    it('should decorate with a addAttachment function', function() {
       email.should.have.property('addAttachment'); 
       email.addAttachment.should.be.a('Function');
    });
    it('should decorate with a updateAttachment function', function() {
       email.should.have.property('updateAttachment'); 
       email.updateAttachment.should.be.a('Function');
    });
    it('should decorate with a loadAttachments function', function() {
       email.should.have.property('loadAttachments'); 
       email.loadAttachments.should.be.an('Function');
    });
    it('should decorate with a removeAttachment function', function() {
       email.should.have.property('removeAttachment'); 
       email.removeAttachment.should.be.an('Function');
    });

    after(function(done) {
        mongoose.connection.close(function(err) {
            if(err) {
                return done(err);
            }
            done();
        });
    });    
});

describe('Scenario insert - addAttachment',function() {
   var email;

    before(function(done) {
       mongoose.connect(URI, function(err){
            if (err) {
              return done(err);
            }          
            var Email = mongoose.model('Email', emailSchema);
            email = new Email();   
            done();
       });
    });       
    
    it('should add an attachment', function(done) {
        email.addAttachment("file.txt", new Buffer('test'))
        .then(function(doc) {
            if (doc.attachments.length != 1) return done('attachment not added');
            if(doc.attachments[0].filename != 'file.txt') return done('filename <> file.txt');
            if(doc.attachments[0].mimetype != 'text/plain; charset=utf-8') return done('mimetype <> txt/plain');
            if(doc.attachments[0].buffer.toString('utf8') != 'test') return done('buffer <> test');
            done();
        })
        .catch(function(err) {
            done(err);
        });
    });
    
    after(function(done) {
        mongoose.connection.close(function(err) {
            if(err) {
                return done(err);
            }
            done();
        });
    });        
});

describe('Scenario update - updateAttachment',function() {
   var email;

    before(function(done) {
       mongoose.connect(URI, function(err){
            if (err) {
              return done(err);
            }          
            var Email = mongoose.model('Email', emailSchema);
            email = new Email();   
            done();
       });
    });       
    
    it('should update Attachments', function(done){
         email.addAttachment("file.txt", new Buffer('test'))
        .then(function(doc) {
                return doc.updateAttachment('file.txt', new Buffer('updated test'));
        })
        .then(function(doc) {
                return doc.save();
        })
        .then(function(doc) {
                return doc.loadAttachments();
        })
        .then(function(doc) {
            if(doc.attachments.length != 1) return done('attachment not retrieved');
            if(doc.attachments[0].filename != 'file.txt') return done('filename <> file.txt');
            if(doc.attachments[0].mimetype != 'text/plain; charset=utf-8') return done('mimetype <> txt/plain');
            if(doc.attachments[0].buffer.toString('utf8') != 'updated test') return done('buffer <> updated test');
            done();
        })
        .catch(function(err) { 
                done(err);
        });
    });
    
    after(function(done) {
        mongoose.connection.close(function(err) {
            if(err) {
                return done(err);
            }
            done();
        });
    });        
});

describe('Scenario remove - renmoveAttachment',function() {
   var email;

    before(function(done) {
       mongoose.connect(URI, function(err){
            if (err) {
              return done(err);
            }          
            var Email = mongoose.model('Email', emailSchema);
            email = new Email();   
            done();
       });
    });       
       
    it('should remove an attachment', function(done){
         email.addAttachment('file.txt', new Buffer('test'))
        .then(function(doc) {
            return doc.removeAttachment('file.txt');
        })
        .then(function(doc) {
            return doc.save();
        })
        .then(function(doc) {
            return doc.loadAttachments();
        })
        .then(function(doc) {
            if (doc.attachments.length != 0) return done('attachment not retrieved');
            done();
        })
        .catch(function(err) { 
            done(err);
        });
    }); 
    
    after(function(done) {
        mongoose.connection.close(function(err) {
            if(err) {
                return done(err);
            }
            done();
        });
    });        
});

describe('Scenario meta-data - plugin with options keys',function() {
   var email;

    before(function(done) {
       mongoose.connect(URI, function(err){
            if (err) {
              return done(err);
            }          
            var Email = mongoose.model('Email', emailSchema);
            email = new Email();   
            done();
       });
    });       
       
    it('should read back keys', function(done){
         email.addAttachment('file.txt', new Buffer('test'))
        .then(function(doc) {
            doc.attachments[0].property1 = 'test property1';
            doc.attachments[0].property2 = 'test property2';
            return doc.save();
        })
        .then(function(doc) {
            return doc.loadAttachments();
        })
        .then(function(doc) {
            if (doc.attachments.length != 1) return done('attachment not retrieved');
            if(doc.attachments[0].property1 != 'test property1') return done('test property 1 not read back');
            if(doc.attachments[0].property2 != 'test property2') return done('test property 2 not read back');
            done();
        })
        .catch(function(err) { 
            done(err);
        });
    }); 
    
    after(function(done) {
        mongoose.connection.close(function(err) {
            if(err) {
                return done(err);
            }
            done();
        });
    });        
});