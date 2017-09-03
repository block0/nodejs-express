/*
Decoupling
-----------

Legacy CGI:

```
GET /cgi-bin/user.php?action=create&user1=jollen&user2=hellen&user3=paul
GET /cgi-bin/user.php?action=delete&userId=123456
```

RESTful:

```
POST http://192.168.1.100:3000/users   - { username: 'jollen' }
POST http://192.168.1.100:3000/users   - { username: 'hellen' }
POST http://192.168.1.100:3000/users   - { username: 'paul' }
DELETE http://192.168.1.100:6000//users/123456
```
*/

var request = require('superagent');

function performanceNow() {
	var hr = process.hrtime();                                                            
	return hr[0] * 1e9 + hr[1];
}

var start = performanceNow();

request
  .post('http://localhost:5000/users')
  .set('Accept', 'application/json')  
  .send({
    Name:     'TEST_somebody',
    Phone:    '123456',
    Email:    'test@somedomain.com',
    Address:  'Taipei',
    Age:      20
  })
  .end(function(err, res) {
  	var end = performanceNow();

  	if (typeof res !== 'undefined')
  		return console.log({
  			status: 'ok',
  			ns: end - start  // nanoseconds
  		});

  	return console.log('failed');
  });