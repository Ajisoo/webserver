const http = require("http");
const https = require("https");
const dotenv = require("dotenv").config();
const axios = require("axios");
const express = require("express");
const rateLimit = require('express-rate-limit');
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const CERT_LOCATION = process.env.CERT_LOCATION;
const DATA_LOCATION = path.join(__dirname, "data");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minute window
  max: 100, // limit IP 100 requests per 5 min
  message: "Too many requests, please try again later."
});
//app.use(limiter)

var cache = {}

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/msg", function (req, res) {
  console.log(req.body);
  res.redirect("/");
});

app.get("/healthcheck", function (req, res) {
  res.status(200).send("Health Check OK!");
});

app.get("/scheduling", function (req, res) {
  res.sendFile(path.join(__dirname, "scheduling.html"));
});

const re = new RegExp("^[a-zA-Z][a-zA-Z0-9]{0,49}$")
app.get("/scheduling/:name", function (req, res) {
  const name = req.params.name;
  if (!re.test(name)) {
    res.status(400).send("Invalid Topic");
  }
  const dataPath = path.join(DATA_LOCATION, name);
  if (!cache[name]) {
    if (fs.existsSync(dataPath)) {
      cache[name] = fetch(dataPath);
    } else {
      cache[name] = {
        name: name
      }
      fs.writeFile(dataPath, JSON.stringify(cache[name]), (err) => {
        if (err) {
          console.error('Error writing to file:', err);
        }
      });
    }
  }
  const data = cache[name];
  res.status(200).send(JSON.stringify(data));
  
});

const options = {
  key: fs.readFileSync(path.join(CERT_LOCATION, "privkey.pem")),
  cert: fs.readFileSync(path.join(CERT_LOCATION, "fullchain.pem")),
};

https.createServer(options, app).listen(443, () => {
  console.log("Server started at port 443");
});
