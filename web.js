var express = require('express');

var app = express.createServer(express.logger());

var hello_buf = fs.readfile('index.html', function (err, data) {
    if (err) throw err;
    return data;
});

var hello_str = hello_buf.toString();

app.get('/', function(request, response) {
  response.send(hello_str);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
