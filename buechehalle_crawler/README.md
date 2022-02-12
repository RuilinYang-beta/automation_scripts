# About

## Basic functionality

The script would search Nintendo Switch games available to lend at various locations of Hamburg Library ([Büchehallen Hamburg](https://www.buecherhallen.de/)) and record relevant information in a .csv file.

## Future functionality

After knowing what games are available at which libraries, it further queries the travel time from my location to each library.

## What I learned

- JavaScript:
  asynchronous programming; the use of Promise
- Clean code:
  promise chaining grows down, rather than grow right; stay flat rather than nested
- Server side:
  how a server can block crawlers, see [this post](https://www.scrapehero.com/how-to-prevent-getting-blacklisted-while-scraping/). My takeaway is:
  - read `Robots.txt`
  - crawl slower
  - introduce randomness
- Programming: recursion brushup
  a long promise chain calls recursive function at its `finally` clause, to make sure next promise chain happen when the previous promise chain is finished

## Modules used

- `Axios` to send HTTP request
- `Cheerio` to parse the HTML in the HTTP response
- `fast-csv` to write results as csv
