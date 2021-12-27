const http = require('http')
const https = require("https")
const fs = require("fs")
const formidable = require("formidable")

const conf = require("./config.json")

const httpsOptions = {
    key: fs.readFileSync(conf.key),
    cert: fs.readFileSync(conf.cert)
}

function server(req, res) {

    // redirects for historic pages:
    if(req.url.startsWith("/greg/")) return res.writeHead(308, {Location: `https://${conf.domain}${req.url.replace("/greg/", "/elia/")}`}).end()
    if(req.url.startsWith("/me/")) return res.writeHead(308, {Location: `https://${conf.domain}${req.url.replace("/me/", "/elia/")}`}).end()

    // other redirects
    if(req.url.startsWith("/github/")) return res.writeHead(308, {Location: `https://github.com/Eliiia/${req.url.replace("/github/","")}`}).end()

    // allow access to server files
    let dir
    if(req.url.startsWith("/serverfiles/")) { 
        dir = __dirname
        req.url = req.url.replace("/serverfiles/", "/")
    } else dir = __dirname+"/www"
    if(req.url.startsWith("/hidden")) { // if accesses hidden folder, send 403
        res.writeHead(403)
        //res.setHeader("Content-Type", "text/html")

        fs.readFile(__dirname + "/www/other/403.html", (err,data) => {
            res.end(data)
        })
        return
    }

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
            if (err) {
                res.writeHead(404)
                res.setHeader("Content-Type", "text/html")

                fs.readFile(dir + "/other/404.html", (err,data) => {
                    res.end(data)
                })
                return
            }

            if(req.url.endsWith(".html")) res.setHeader("Content-Type", "text/html")
            else res.setHeader("Content-Type", "text/plain")

            if(req.url.endsWith(".html")) {
                // this can likely be much more efficient and well coded, but i'll rewrite this whole thing soon anyway
                data = data.toString()
                    .replace("INSERT_IP", req.socket.remoteAddress)
                    .replace("INSERT_DOMAIN", conf.domain).replace("INSERT_DOMAIN", conf.domain)
            }

            res.writeHead(200)
            res.end(data)
        });
    }

    if(req.method == "POST") {

        let form = new formidable.IncomingForm()

        form.parse(req, (err, fields, files) => {
            if(req.url == "/ip") { 
                console.log(fields)

                if(conf.knownIPs[req.socket.remoteAddress]) {
                    console.log("\tlmao")
                }

                conf.knownIPs[addr] = fields["name"]
                fs.writeFileSync("./config.json", JSON.stringify(conf, null, 4))
            }
            else if(req.url == "/upload/") {
                if(!conf.whitelist.includes(req.socket.remoteAddress)) return res.end()

                console.log(files)
                
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
}

http.createServer((req, res) => {
    res.writeHead(308, {Location: `https://${conf.domain}${req.url}`}).end()
}).listen(conf.http, conf.hostname, () => {
    console.log(`cool http server running at http://${conf.hostname}:${conf.http}/`)
})
https.createServer(httpsOptions, server).listen(conf.https, conf.hostname, () => {
    console.log(`cool https server running at https://${conf.hostname}:${conf.https}/`)
})

console.log("started :)")
