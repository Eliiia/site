const http = require('http')
const fs = require("fs")

const conf = require("./config.json")

http.createServer(function (req, res) {
    if(req.url.endsWith("/")) req.url += "index.html"

    console.log(`${req.socket.localAddress} GET ${req.url}`)

    fs.readFile(__dirname + "/www" + req.url, function (err,data) {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      res.writeHead(200);
      res.end(data);
    });
}).listen(conf.port);