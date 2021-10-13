const http = require('http')
const fs = require("fs")

const conf = require("./config.json")

const dir = __dirname+"/www"

http.createServer((req, res) => {

    req.url = decodeURI(req.url)

    if(conf.knownIPs.hasOwnProperty(req.socket.remoteAddress)) addr = conf.knownIPs[req.socket.remoteAddress]
    else addr = req.socket.remoteAddress

    d = new Date(); h = d.getHours(); m = d.getMinutes(); s = d.getSeconds()
    if((h+"").length === 1) h = "0" + h
    if((m+"").length === 1) m = "0" + m
    if((s+"").length === 1) s = "0" + s
    console.log(`[${h}:${m}:${s}] ${addr} ${req.method} ${req.url}`)

    if(req.method == "GET") {
        if(req.url.endsWith("/")) req.url += "index.html"
        else if(!req.url.includes(".")) req.url += ".html"

        fs.readFile(dir + req.url, (err,data) => {
            if(req.url.endsWith(".html")) res.setHeader("Content-Type", "text/html")
            else res.setHeader("Content-Type", "text/plain")

            if (err) {
                res.writeHead(404);

                fs.readFile(dir + "/other/404.html", (err,data) => {
                    res.end(data)
                })
                return
            }

            if(req.url.endsWith(".html")) {
                data = data.toString().replace("INSERT_IP", req.socket.remoteAddress)
            }

            res.writeHead(200)
            res.end(data)
        });
    }

    if(req.method == "POST") {
        let body = "";

        req.on("data", (chunk) => {
            body += chunk

            if(body.length > 1e6) res.end() // yes, i know i need a proper way of doing this but whatever
        })

        req.on("end", async () => {
            if(req.url == "/ip") { 
                if(conf.knownIPs[req.socket.remoteAddress]) {
                    console.log("\tlmao")
                }

                let s = body.toString().split("=")
                conf.knownIPs[addr] = s[1]
                fs.writeFileSync("./config.json", JSON.stringify(conf, null, 4))
            }
            else if(req.url == "/upload/") {
                if(!conf.whitelist.includes(req.socket.remoteAddress)) return res.end()

                body = body.split("\n")
                let filename = body[1].split('"')[3]
                delete body[0]; delete body[1]; delete body[2]; delete body[body.length -2]
                body = body.join("\n")
                
                console.log("\tfile uploaded")

                fs.writeFileSync(`${dir}/downloads/${filename}`, body, "utf-8", {recursive:true})
            }
            else {
                res.writeHead(405);
    
                fs.readFile(__dirname + "/other/post.html", (err,data) => {
                    res.end(data)
                })
            }

            console.log("\tPOST request finished")

            res.end()
        })
    }
}).listen(conf.port, conf.hostname)

console.log("started :)")