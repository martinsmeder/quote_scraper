// Puppeteer: 
// .$ = querySelector
// .$$ = querySelectorAll
// page.evaluate() = A function that allow you to execute a callback function within the browser context and return it's result to the node.js environment
// page.$eval() = A function that allow you to execute a callback function within the context of a single DOM element, takes two arguments (selector and callback function)

// Javascript:
// Array.from() = Creates array from array like object, such as a NodeList
// map() = Iterate over array and apply a function to each element and returns new array with results of applying the function to each element

const puppeteer = require('puppeteer');

async function getQuotes() {
    // Launch browser
    const browser = await puppeteer.launch({
      headless: false, // Show the browser window
      defaultViewport: null, // Set the viewport to the full page size
    });
  
    // Open a new page
    const page = await browser.newPage();
  
    // Go to page and wait for HTML content to load
    await page.goto("http://quotes.toscrape.com/");
    await page.waitForSelector('.quote') // Wait for at least one quote to appear on the page

    // get quote, author, and about link for each quote
    const quotes = await page.evaluate(() => {
        const quotes = document.querySelectorAll(".quote");
        return Array.from(quotes).map(quoteAndAuthor => { // Convert NodeList to array and map each quote to an object with its data
            const quote = quoteAndAuthor.querySelector(".text").innerText; 
            const author = quoteAndAuthor.querySelector(".author").innerText; 
            const aboutLink = quoteAndAuthor.querySelector("span > a"); 
            return { quote, author, aboutLink }; // Return an object with the quote, author, and aboutLink data
        });
    });
    
    // Loop through each quote object in quotes array
    for (let quote of quotes) { 
        const aboutHref = await page.$eval('.quote > span > a', el => el.href); // Get the href attribute of the aboutLink element
        await page.goto(aboutHref); 
        await page.waitForSelector('.author-details');
        quote.born = await page.evaluate(() => {
            const authorDetails = document.querySelector(".author-details"); 
            const date = authorDetails.querySelector(".author-born-date").innerText; 
            const location = authorDetails.querySelector(".author-born-location").innerText;
            return `${date} ${location}`; 
        });
        await page.goBack();
    }

    console.log(quotes)
    // Close the browser
    // await browser.close();
}

getQuotes();