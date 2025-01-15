const http = require("http");
const dotenv = require("dotenv").config();
const axios = require("axios");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const DATA_LOCATION = path.resolve(path.dirname(__dirname), "data");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
  const dataPath = path.resolve(DATA_LOCATION, name);
  if (!cache[name]) {
    if (fs.existsSync(dataPath)) {
      cache[name] = fs.readFileSync(dataPath, 'utf8');
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


app.listen(8080, () => {
  console.log("Server started at port 8080");
});
