const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const exec = require('child_process').exec;
const expressStatic = require('express-static');
const repoSrc = '/Users/mac/Desktop/wcy'

//create server
var server = express();
server.listen(8083);

// cors
server.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    if(req.method=="OPTIONS") res.send(200); // options请求快速返回 
    else next();
});

// body-parser json
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: false }))

// router
server.use('/chat',(req, res)=>{
    console.log(req.body);
    request({
        url: 'http://openapi.tuling123.com/openapi/api/v2',
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: req.body
    }, function(error, response) {
        if (!error && response.statusCode == 200) {
            res.header("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ msg: response }));
        } else {
            res.status(500).end(JSON.stringify({err: 'server error'}))
        }
    });
});

server.use('/custom', function(req, res){
    var args = req.body;
    var msg = args.text;
    exec(`python3 main.py ${msg}`, {cwd: repoSrc}, function(err, stdout, stderr){
        if(err){
            res.status(500).end(JSON.stringify({err: 'server err'}));
            throw err;
        }else{
            var text = stdout.split('\n')[2]
            var reg = new RegExp("<sos>|<eos>","g");
            text = text.replace(reg,"");
            res.header("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ text: text}))
        }
    })
})

// read file from ./www
server.use(expressStatic('./www'));