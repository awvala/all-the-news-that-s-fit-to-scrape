// Dependecies
const axios = require("axios");
// Require request and cheerio. This makes the scraping possible
const request = require("request");
const cheerio = require("cheerio");
const mongoose = require("mongoose");

const db = require("./models");

// Set mongoose to leverage Built in JavaScript ES6 Promises
mongoose.Promise = Promise;


module.exports = function (app) {
    // Default Route
    app.get("/", (req, res) => res.render("index"));

    // Scrape Articles Route
    app.get("/api/search", (req, res) => {

        axios.get("https://www.npr.org/sections/news/").then(response => {
            // First, we grab the body of the html with request
            const $ = cheerio.load(response.data);

            // Initialize Empty Object to Store Cheerio Objects
            let handlebarsObject = {
                data: []
            };

            $(".js_post-wrapper").each(function (i, element) {
                handlebarsObject.data.push({ // Store Scrapped Data into handlebarsObject
                    title: $(element).find(".entry-title").children("a").text(),
                    link: $(element).find(".entry-title").children("a").attr("href"),
                    author: $(element).find(".meta__byline").children("a").text(),
                    summary: $(element).find(".entry-summary").children("p").text(),
                    image: $(element).find(".lazy-image").find("img").attr("src"),
                    comments: null
                }); // Store HTML Data as an Object within an Object
            }); // End of Article Search

            // Return Scrapped Data to Handlebars for Rendering
            res.render("index", handlebarsObject);
        });
    });

    // Add Article Route
    app.post("/api/add", (req, res) => {

        const articleObject = req.body;

        // Save the Article to the Database
        db.Articles.
            findOne({ link: articleObject.link }). // Look for an Existing Article with the Same URL
            then(function (response) {

                if (response === null) { // Only Create Article if it has not been Created
                    db.Articles.create(articleObject).then((response) => console.log(" ")).catch(err => res.json(err));
                }
                // If we were able to successfully save an Article, send a message to the client
                res.send("Article Saved");
            }).catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Saved Article Route
    app.get("/api/savedArticles", (req, res) => {
        // Grab every document in the Articles collection
        db.Articles.find({}). // Find all Saved Articles
            then(function (dbArticle) {
                // If we were able to successfully find Articles, send them back to the client
                res.json(dbArticle);
            }).catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Delete Article Route
    app.post("/api/deleteArticle", (req, res) => {
        sessionArticle = req.body;

        db.Articles.findByIdAndRemove(sessionArticle["_id"]). // Look for the Article and Remove from DB
            then(response => {
                if (response) {
                    res.send("Sucessfully Deleted");
                }
            });
    }); // End deleteArticle Route

    // Delete Comment Route
    app.post("/api/deleteComment", (req, res) => {
        const comment = req.body;
        db.Notes.findByIdAndRemove(comment["_id"]). // Look for the Comment and Remove from DB
            then(response => {
                if (response) {
                    res.send("Sucessfully Deleted");
                }
            });
    }); // End delete Article Route

    // Create Notes Route
    app.post("/api/createNotes", (req, res) => {
        sessionArticle = req.body;
        db.Notes.create(sessionArticle.body).then(function (dbNote) {
            return db.Articles.findOneAndUpdate({
                _id: sessionArticle.articleID.articleID
            }, {
                    $push: {
                        note: dbNote._id
                    }
                });
        }).then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        }).catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
    }); // End Create Notes Route

    // Route for grabbing a specific Article by id, populate it with it's note
  app.post("/api/populateNote", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    // console.log("ID is "+ req.body.articleID);

    db.Articles.findOne({_id: req.body.articleID}).populate("Note"). // Associate Notes with the Article ID
    then((response) => {

      if (response.note.length == 1) { // Note Has 1 Comment

        db.Notes.findOne({'_id': response.note}).then((comment) => {
          comment = [comment];
          console.log("Sending Back One Comment");
          res.json(comment); // Send Comment back to the Client
        });

      } else { // Note Has 0 or more than 1 Comments

        console.log("2")
        db.Notes.find({
          '_id': {
            "$in": response.note
          }
        }).then((comments) => {
          // console.log("Sending Back Multiple Comments");
          res.json(comments); // Send Comments back to the Client
        });
      }
      // If we were able to successfully find an Article with the given id, send it back to the client
    }).catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
  }); // End of Post Populate Note
};