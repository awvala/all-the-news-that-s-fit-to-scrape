

module.exports = function (app) {
    // Landing page
    app.get("/", function (req, res) {
        res.render("index");
        console.log("I made a scrape!")
    });

    // Retrieve data from the db
    app.get("/all", function (req, res) {
        // Find all results from the scrapedData collection in the db
        db.scrapedData.find({}, function (error, found) {
            // Throw any errors to the console
            if (error) {
                console.log(error);
            }
            // If there are no errors, send the data to the browser as json
            else {
                res.json(found);
            }
        });
    });

    // Scrape data from one site and place it into the mongodb db
    app.get("/scrape", function (req, res) {
        // Make a request for the news section of `kotaku`
        request("https://kotaku.com/", function (error, response, html) {
            // Load the html body from request into cheerio
            const $ = cheerio.load(html);
            // For each element with a "title" class
            $(".js_post-wrapper").each(function (i, element) {
                // Save the text and href of each link enclosed in the current element
                const title = $(element).find(".entry-title").children("a").text();
                const link = $(element).find(".entry-title").children("a").attr("href");
                const author = $(element).find(".meta__byline").children("a").text();
                const summary = $(element).find(".entry-summary").children("p").text();
                const image = $(element).find(".lazy-image").find("img").attr("src");

                // If this found element has all requested properties, create a document in the scrapedData db
                if (title && link && author && summary && image) {
                    // Insert the data in the scrapedData db
                    db.scrapedData.insert({
                        title: title,
                        link: link,
                        author: author,
                        summary: summary,
                        image: image
                    },
                        function (err, inserted) {
                            if (err) {
                                // Log the error if one is encountered during the query
                                console.log(err);
                            }
                            else {
                                // Otherwise, log the inserted data
                                console.log(inserted);
                            }
                        });
                }
            });
        });

        // Send a "Scrape Complete" message to the browser
        res.send("Scrape Complete");
    });
};