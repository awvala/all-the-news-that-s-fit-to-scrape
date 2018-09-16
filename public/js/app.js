$(document).ready(function() {

$('#scrapeButton').on("click", () => {
    fetch("/scrape", {method: "GET"});
  });

});