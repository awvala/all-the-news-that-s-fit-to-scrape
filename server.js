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
const db = require("./models");

// Initialize Express
const app = express();

// Hook mongojs configuration to the db variable
//const db = mongojs(databaseUrl, collections);
//db.on("error", function (error) {
//    console.log("Database Error:", error);
//});

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/kotakuscraper");

// Connect to the Mongo DB
//const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/kotakuscraper";

//db.on("error", function(error) {
//    console.log("Mongoose Error: ", error);
//  });

//  db.once("open", function() {
//   console.log("Mongoose connection sucessful.");
// });

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

//require("./routes/scraperRoutes")(app);

//if (process.env.NODE_ENV === "test") {
//    syncOptions.force = true;
//}

app.get("/", function (req, res) {
    res.render("index");
    //console.log("I made a scrape!")
});

// Route to scrape Kotaku
app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with request
    axios.get("https://kotaku.com/").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        let handlebarsObject = {
            data: []
        }; // Initialize Empty Object to Store Cheerio Objects

        $(".js_post-wrapper").each(function (i, element) {
            // Save an empty result object
            //var result = {};
            handlebarsObject.data.push({ // Store Scrapped Data into handlebarsObject
                title: $(element).find(".entry-title").children("a").text(),
                summary: $(element).find(".entry-summary").children("p").text(),
                link: $(element).find(".entry-title").children("a").attr("href"),
                author: $(element).find(".meta__byline").children("a").text(),
                image: $(element).find(".lazy-image").find("img").attr("src"),
                comments: null
            }); // Store HTML Data as an Object within an Object

            // Add the text and href of every link, and save them as properties of the result object
            //result.title = $(this)
            //    .find(".entry-title").children("a").text();
            //result.link = $(this)
            //    .find(".entry-title").children("a").attr("href");
            //result.author = $(element).find(".meta__byline").children("a").text();
            //result.summary = $(element).find(".entry-summary").children("p").text();
            //result.image = $(element).find(".lazy-image").find("img").attr("src");

            // Create a new Article using the `result` object built from scraping
            //db.Article.create(result)
            //    .then(function (dbArticle) {
            // View the added result in the console
            //        console.log(dbArticle);
            //    })
            //    .catch(function (err) {
            // If an error occurred, send it to the client
            //        return res.json(err);
            res.render("/", handlebarsObject);
        });
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete");
});

// Route for getting all Articles from the db
app.get("/all", function (req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("note")
        .then(function (dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Listen on port 3000
app.listen(3000, function () {
    console.log("App running on port 3000!");
});
