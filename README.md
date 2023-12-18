# quote_scraper
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) 

A simple quote scraper build with JavaScript and Puppeteer.

What the script does:
1. Launches a browser
2. Opens page
3. Extracts quote, author, and about link for each quote on the current page
4. For each quote, follows the about link to get the birth details for each author
5. Does the same for every page
6. Sorts all quotes by author name in alphabetical order
7. Writes the quotes to a CSV file
