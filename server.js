// Dependencies
const express = require("express");
const mongojs = require("mongojs");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
// Require request and cheerio. This makes the scraping possible
const request = require("request");
const cheerio = require("cheerio");

// Initialize Express
const app = express();

// Database configuration
const databaseUrl = "kotakuscraper";
const collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
const db = mongojs(databaseUrl, collections);
db.on("error", function (error) {
    console.log("Database Error:", error);
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

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