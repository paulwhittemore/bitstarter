var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

var hello_buf = fs.readFileSync('index.html');
var hello_str = hello_buf.toString();

//console.log(hello_str);

app.get('/', function(request, response) {
  response.send(hello_str);
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
