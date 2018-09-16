// Dependencies
const express = require("express");
//const mongojs = require("mongojs");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const logger = require("morgan");
const mongoose = require("mongoose");
const axios = require("axios");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;
// Require request and cheerio. This makes the scraping possible
const request = require("request");
const cheerio = require("cheerio");

// Require all models
// const db = require("./models");

// Initialize Express
const app = express();

// Hook mongojs configuration to the db variable
//const db = mongojs(databaseUrl, collections);
//db.on("error", function (error) {
//    console.log("Database Error:", error);
//});

// Connect to the Mongo DB
//mongoose.connect("mongodb://localhost/kotakuscraper");

// Connect to the Mongo DB
//const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/kotakuscraper";

// Database configuration with mongoose
const databaseUri = "mongodb://localhost/kotakuscraper";

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect(databaseUri);
}

const db = mongoose.connection;

db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
  });
  
  db.once("open", function() {
    console.log("Mongoose connection sucessful.");
  });

// Middleware
// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Use express.static to serve the public folder as a static directory
app.use(express.static(__dirname + "/public"));

// Handlebars
app.engine(
    "handlebars",
    exphbs({
        defaultLayout: "main"
    })
);
app.set("view engine", "handlebars");

require("./routes/scraperRoutes")(app);

if (process.env.NODE_ENV === "test") {
    syncOptions.force = true;
}

// Listen on port 3000
app.listen(3000, function () {
    console.log("App running on port 3000!");
});