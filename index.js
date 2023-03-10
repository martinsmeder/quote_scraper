// Puppeteer: 
// .$ = querySelector
// .$$ = querySelectorAll
// page.evaluate() = A function that allow you to execute a callback function within the browser context and return it's result to the node.js environment
// page.$eval() = A function that allow you to execute a callback function within the context of a single DOM element, takes two arguments (selector and callback function)

// Javascript:
// Array.from() = Creates array from array like object, such as a NodeList
// map() = Iterate over array and apply a function to each element and returns new array with results of applying the function to each element

const puppeteer = require('puppeteer');
const fs = require('fs');

async function getQuotes() {
    // Launch browser
    const browser = await puppeteer.launch({
        headless: false, // Show the browser window
        defaultViewport: null, // Set the viewport to the full page size
    });

    // Open a new page
    const page = await browser.newPage();
    
    let allQuotes = []; // An array to hold all quotes from all pages
    let currentPage = 1; // Start at the first page

    while (true) { // Loop through all pages
        console.log(`Extracting quotes from page ${currentPage}...`);
        await page.goto(`http://quotes.toscrape.com/page/${currentPage}/`);
        await page.waitForSelector('.quote'); // waitForSelector works better than domContentLoaded

        // Get quote, author, and about link for each quote on the current page
        const quotes = await page.evaluate(() => {
            const quotes = document.querySelectorAll(".quote");
            return Array.from(quotes).map((quoteAndAuthor) => ({ // Convert NodeList to array and map each quote to an object with its data
                quote: quoteAndAuthor.querySelector(".text").innerText,
                author: quoteAndAuthor.querySelector(".author").innerText,
                aboutLink: quoteAndAuthor.querySelector("span > a"),
            }));
        });

        // Loop through each quote object in quotes array and get the birth details for each author
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

        allQuotes = allQuotes.concat(quotes); // Add the quotes from the current page to the allQuotes array
        

        // Check if there is a next page button and go to the next page if there is
        const nextPageButton = await page.$('.next > a');
        if (!nextPageButton) {
            console.log(`Done extracting quotes from all pages`);
            break;
        }
        currentPage++;
        await nextPageButton.click();
    }

    // Sort by author name in alphabetical order
    allQuotes.sort((a, b) => a.author.localeCompare(b.author));

    // Write quotes to CSV file
    const header = Object.keys(allQuotes[0]).join(',');
    const csv = allQuotes.map(quote => Object.values(quote).join(',')).join('\n');
    fs.writeFileSync('quotes.csv', `${header}\n${csv}`);

    console.log('Quotes written to quotes.csv');
    // Close the browser
    await browser.close();
}

getQuotes();