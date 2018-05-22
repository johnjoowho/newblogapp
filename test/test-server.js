const chai = require('chai');
const chaiHttp = require('chai-http');

// Import server.js and use destructuring assignment to create variables for
// server.app, server.runServer, and server.closeServer
const {app, runServer, closeServer} = require('../server');

// declare a variable for expect from chai import
const expect = chai.expect;

chai.should(); 

chai.use(chaiHttp);

describe('Blogs', function() {
  // Before our tests run, we activate the server. Our `runServer`
  // function returns a promise, and we return the promise by
  // doing `return runServer`. If we didn't return a promise here,
  // there's a possibility of a race condition where our tests start
  // running before our server has started.
  before(function() {
    return runServer();
  });

  // Close server after these tests run in case
  // we have other test modules that need to 
  // call `runServer`. If server is already running,
  // `runServer` will error out.
  after(function() {
    return closeServer();
  });

  it ('should list blogs on GET', function() { 
    return chai.request(app)
      .get('/blog-posts')
      .then(function(res) { 
        res.should.have.status(200); 
        res.should.be.json; 
        res.body.should.be.a('array'); 
        res.body.length.should.be.above(0);
        res.body.forEach(function(item) { 
          item.should.be.a('object'); 
          item.should.have.all.keys('id', 'title', 'content', 'author', 'publishDate')
        });
      });
  });

  it ('should add a blog post on POST', function() {
    const newPost = { 
      title: 'The Tao of Jeet Kune Do',
      content: 'fooey chooey gooey',
      author: "Bruce Lee"
    };
    const expectedKeys = ['id', 'publishDate'].concat(Object.keys(newPost)); 

    return chai.request(app)
      .post('/blog-posts')
      .send(newPost)
      .then(function(res) { 
        res.should.have.status(201); 
        res.should.be.json; 
        res.body.should.be.a('object'); 
        res.body.should.have.all.keys(expectedKeys); 
        res.body.title.should.equal(newPost.title); 
        res.body.content.should.equal(newPost.content); 
        res.body.author.should.equal(newPost.author)
      });
  });

  it('should error if POST missing expected values', function() {
    const badRequestData = {}; 
    return chai.request(app)
      .post('/blog-posts')
      .send(badRequestData)
      .catch(function(res) {
        res.should.have.status(400); 
      });
  });

  it('should update blog posts on PUT', function () {
    return chai.request(app)
    //first have to get sample
    .get('/blog-posts')
    .then(function(res) {
      const updatedPost = Object.assign(res.body[0], { 
        title: 'connect the dots', 
        content: 'la la la la la'
      });
      return chai.request(app)
        .put('/blog-posts/${res.body[0].id}')
        .send(updatedPost)
        .then(function(res) {
          res.should.have.status(204);
        });
    });
  });

  it('should delete posts on DELETE', function() {
    return chai.request(app)
    //first have to get
      .get('/blog-posts')
      .then(function(res) {
        return chai.request(app)
          .delete('/blog-posts/${res.body[0].id}')
          .then(function(res) {
            expet(res).to.have.status(204);
          });
      });
  });

});

