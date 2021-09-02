const http = require('http')
const fs = require("fs")

const conf = require("./config.json")

http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});

    if(req.url == "/") req.url = "/index.html"

    res.end(fs.readFileSync(`${conf.public}${req.url}`));
}).listen(conf.port);