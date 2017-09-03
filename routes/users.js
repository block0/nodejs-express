var express = require('express');
var router = express.Router();
var etag = require('etag');
var Memcached = require('memcached');

var memcached = new Memcached('127.0.0.1:11211');

var response = function(req, res, users) {
  // Stateless
  res.setHeader('Connection', 'close');

  // ETag and 304 Status
  var etagString = etag(JSON.stringify(users));

  if (typeof req.headers['if-none-match'] !== 'undefined'
      && req.headers['if-none-match'] === etagString)
    return res.status(304).end();

  // Cache control
  res.setHeader('Cache-Control', 'max-age=60');
  //res.append('Expires', 'Sat, 02 Sep 2017 16:00:00 GMT');

  // Invalidation
  res.setHeader('ETag', etagString);
  //res.append('Last-Modified', 'Sat, 02 Sep 2017 16:00:00 GMT');

  res.json(users);
};
  
/**
 * GET /users
 */
router.get('/', function(req, res, next) {
  var db = req.app.db.model.User;

  memcached.get('api_get_users', function (err, data) {
    if (typeof data !== 'undefined') {
      return response(req, res, data);
    }

    db.find({}, function(err, users) {
      memcached.set('api_get_users', users, 86400, function(err) {
        response(users);
      });
    });    
  });
});

/**
 * GET /users/:id
 */
router.get('/:id', function(req, res, next) {
  var db = req.app.db.model.User;

  // See: http://expressjs.com/en/guide/routing.html
  var id = req.params.id;

  db.find({_id: id}, function(err, user) {
  	res.json(user);
  });  
});

/**
 * POST /users
 */
router.post('/', function(req, res, next) {
  var User = req.app.db.model.User;
  var user = {
    Name:     req.body.Name,
    Phone:    req.body.Phone,
    Email:    req.body.Email,
    Address:  req.body.Address,
    Age:      req.body.Age
  };

  var doc = new User(user);
  doc.save();

  res.end();
});

/**
 * PUT /users/:id
 */
router.put('/:id', function(req, res, next) {
  var db = req.app.db.model.User;
  var id = req.params.id;
  var phone = req.body.phone;

  db
  .update({_id: id}, { $set: {Phone: phone} })
  .exec(function(err, nModified) {
    res.send({ status: "ok" });
  });
});

/**
 * DELETE /users/:id
 */
router.delete('/:id', function(req, res, next) {
  var db = req.app.db.model.User;
  var id = req.params.id;

  db.remove({_id: id}, function(err, result) {
    res.send(result);
  });  
});

module.exports = router;
