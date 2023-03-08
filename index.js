// .$ = Puppeteer equivalent of querySelector
// .$$ = Puppeteer equivalent of querySelectorAll
const puppeteer = require('puppeteer');

async function getQuotes() {
    // Launch browser
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });
  
    // Open a new page
    const page = await browser.newPage();
  
    // Go to page and wait for HTML content to load
    await page.goto("http://quotes.toscrape.com/");
    await page.waitForSelector('h1') // must use waitForSelector (others don't work)

    // get quote and author
    const quoteAndAuthor = await page.evaluate(() => {
        const quoteAndAuthor = document.querySelector(".quote");
        const quote = quoteAndAuthor.querySelector(".text").innerText;
        const author = quoteAndAuthor.querySelector(".author").innerText;
        return { quote, author };
    });
    
    // Click on about link
    const aboutButton= await page.$(".quote > span > a");
    // Loop until the nextButton element appears on the page
    while (aboutButton) { 
      // Use try-catch block to avoid execution context error
      try { 
        await aboutButton.click();
      } 
      catch (error) { 
        break;
      }
    };

    // get birth date and location
    const authorDetails = await page.evaluate(() => {
      const authorDetails = document.querySelector(".author-details");
      const date = authorDetails.querySelector(".author-born-date").innerText;
      const location = authorDetails.querySelector(".author-born-location").innerText;
      const born = `${date} ${location}`;
      return { born };
    });

    // Go back to previous page
    await page.goBack();
  
    // Add authorDetails to quoteAndAuthor object
    quoteAndAuthor.born = authorDetails.born;

    console.log(quoteAndAuthor)
    // Close the browser
    // await browser.close();
  }

getQuotes();


// await page.click('.quote > span:nth-child(2) > a')
// await page.waitForNavigation()

// Get the all quotes from the page
    // const quotes = await page.evaluate(() => {
    //     const quoteList = document.querySelectorAll('.quote')
    //     return Array.from(quoteList).map((quote) => {
    //         const text = quote.querySelector('.text').innerText;
    //         const author = quote.querySelector('.author').innerText;

    //         return { text, author }
    //     })
    // })
    // console.log(quotes);



