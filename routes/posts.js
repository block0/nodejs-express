var express = require('express');
var router = express.Router();
var etag = require('etag');
var winston = require('winston');
var cors = require('cors')

var response = function(req, res, data, safe = false) {
  // Stateless
  res.setHeader('Connection', 'close');

  // ETag and 304 Status
  var etagString = etag(JSON.stringify(data));

  if (typeof req.headers['if-none-match'] !== 'undefined'
      && req.headers['if-none-match'] === etagString)
    return res.status(304).end();

  // Cache control
  res.setHeader('Cache-Control', 'max-age=60');
  //res.append('Expires', 'Sat, 02 Sep 2017 16:00:00 GMT');

  // Invalidation
  res.setHeader('ETag', etagString);
  //res.append('Last-Modified', 'Sat, 02 Sep 2017 16:00:00 GMT');

  if (safe === true)
  	return res.end();

  res.json(data);
};

winston.add(winston.transports.File, { 
  name: 'blog-1',
  filename: 'blog-1.log',
  level: 'info'
});

/**
 * GET /1/post
 */
router.get('/1/post', cors()); 
router.head('/1/post', function(req, res, next) {
	next();
});
router.get('/1/post', function(req, res, next) {
	var db = req.app.db.model.Post;

	winston.log('info', 'read all posts');

    db.find({}, function(err, posts) {
		response(req, res, posts);
    }); 	
});

/**
 * GET /1/post/:id
 */
router.get('/1/post/:id', function(req, res, next) {
	var id = req.params.id;
});

/**
 * GET /1/post/subject/:subject
 */
router.get('/1/post/subject/:subject', function(req, res, next) {
	var subject = req.params.subject;
});

/**
 * POST /1/post
 */
router.post('/1/post', function(req, res, next) {
  var Post = req.app.db.model.Post;
  var post = {
    title:    req.body.title,
    content:  req.body.content
  };

  var doc = new Post(post);
  doc.save();

  res.end();	
});

/**
 * PUT /1/post
 */
router.put('/1/post', function(req, res, next) {
});

/**
 * PUT /1/post/:subject/publish	
 */
router.put('/1/post/:subject/publish	', function(req, res, next) {
	var subject = req.params.subject;
});

/**
 * PUT /1/post/:subject/unpublish	
 */
router.put('/1/post/:subject/unpublish	', function(req, res, next) {
	var subject = req.params.subject;
});

/**
 * DELETE /1/post/:id
 */
router.delete('/1/post/:id', function(req, res, next) {
	var id = req.params.id;
	var db = req.app.db.model.Post;

	db.remove({_id: id}, function(err, result) {
	  res.send(result);
	}); 	
});

module.exports = router;


