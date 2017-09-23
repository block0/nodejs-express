var express = require('express');
var router = express.Router();
  
/**
 * POST /1/device
 */
router.post('/', function(req, res, next) {
  var Device = req.app.db.model.Device;

  var data = {
    DeviceId:     req.body.DeviceId,
    Value:        req.body.Value
  };

  var doc = new Device(data);
  doc.save();

  res.end();
});

module.exports = router;
