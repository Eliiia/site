const http = require('http')
const fs = require("fs")

const conf = require("./config.json")

http.createServer((req, res) => {
    if(req.url.endsWith("/")) req.url += "index.html"

    console.log(`${req.socket.localAddress} ${req.method} ${req.url}`)

    if(req.method == "GET") {
        fs.readFile(__dirname + conf.dir + req.url, (err,data) => {
            res.setHeader('Content-Type', 'text/html');

            if (err) {
                res.writeHead(404);

                fs.readFile(__dirname + "/other/error.html", (err,data) => {
                    res.end(data)
                })
                //res.end(JSON.stringify(err))
                return
            }

            res.writeHead(200)
            res.end(data)
        });
    }

    if(req.method == "POST") {
        res.writeHead(405);

        fs.readFile(__dirname + "/other/post.html", (err,data) => {
            res.end(data)
        })
    }
}).listen(conf.port)