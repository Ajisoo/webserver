const path = require('path');
const express = require('express');
const http = require('http');
const dotenv = require("dotenv").config();
const fs = require("fs");

const DOMAIN_URL = process.env.DOMAIN_URL;

const app = express();
app.use('/dist', express.static(path.join(__dirname, 'dist')));

app.get('*', (req,res,next) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(3000, () => {
  console.log("React Server started at port 3000");
});
