"use strict";

const fs = require("fs");
const drawght = require("./drawght");
const data = require("./example.json");
const templates = [
  "example.md.in",
  "example.html.in",
]

console.log("Dataset", data);
templates.forEach(function(file) {
  fs.readFile(file, "utf8", function(fail, template) {
    if (fail) {
      return console.error(fail);
    }
    console.log(`------------------------------------------------------------------------------`);
    console.log(`Template file ${file}...`);
    console.log(`------------------------------------------------------------------------------`);
    console.log(template);
    console.log(`------------------------------------------------------------------------------`);
    console.log(drawght.parse(template, data));
  });
});
