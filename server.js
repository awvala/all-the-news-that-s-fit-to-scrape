// Dependencies
const express = require("express");
const mongojs = require("mongojs");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
// Require request and cheerio. This makes the scraping possible
const request = require("request");
const cheerio = require("cheerio");

// Require all models
var db = require("./models");

// Initialize Express
const app = express();

// Database configuration
//const databaseUrl = "kotakuscraper";
//const collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
//const db = mongojs(databaseUrl, collections);
//db.on("error", function (error) {
//    console.log("Database Error:", error);
//});

// Connect to the Mongo DB
//mongoose.connect("mongodb://localhost/week18Populater");

// Middleware
// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Use express.static to serve the public folder as a static directory
app.use(express.static(__dirname + "/public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/kotakuscraper";

// Handlebars
app.engine(
    "handlebars",
    exphbs({
        defaultLayout: "main"
    })
);
app.set("view engine", "handlebars");

require("./routes/htmlRoutes")(app);

if (process.env.NODE_ENV === "test") {
    syncOptions.force = true;
}

// Listen on port 3000
app.listen(3000, function () {
    console.log("App running on port 3000!");
});