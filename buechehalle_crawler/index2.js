/*
 * steps:
 * 1. [done] from startURL get two kinds of things:
 *    - [done] total number of pages and url pattern of each page
 *    - [done] urls of each game title
 * 2. [done] from each pageURL, get a list of gameURL
 * 3. from each gameURL, get whether the game is available somewhere,
 * write result
 * 4. (optional) for each location that has an available game,
 * query google map api to find the ones that are nearest to me
 */

const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const { format } = require("@fast-csv/format");
const selector = require("./selector");

const CONSOLE = "[Nintendo Switch]";
const baseURL = "https://www.buecherhallen.de/";
const pageURL = "katalog-suchergebnisse.html";
const gameRecords = {}; // {gameTitle: gameURL}
const gameAvailInfo = [];
let totalPage;

// --------------------------------- new ---------------------------------

const init = axios.get(`${baseURL}${pageURL}`, {
  params: {
    suchbegriff: CONSOLE,
  },
});

// get total page
init
  .then((response) => {
    const $ = getParsedPage(response);
    totalPage = getTotalPages($);
    return $;
  })
  // prep to fire query on the games on this page
  .then(($) => {
    const gameURLs = getGameURLsOnPage($);
    const reqs = getAxiosFromGameURLs(gameURLs);

    return Promise.all(reqs);
  })
  // parse, check, and write game if available
  .then((gamePages) => {
    gamePages.forEach((gamePage) => {
      recordAvailableGame(gamePage);
    });
  });

// ---------- general work ----------
/*
 * For a response obj from an axios call,
 * return a parsed cheerio obj.
 */
const getParsedPage = (axiosRes) => {
  const rawPage = axiosRes["data"];
  return cheerio.load(rawPage, null, false);
};

// ---------- work on game list page ----------
/*
 * From the cheerio obj of the first page,
 * get the number of total pages.
 */
const getTotalPages = ($) => {
  const totalPageInfo = $(selector["totalPageInfo"]).text();
  const pattern = /\d+$/;
  return parseInt(totalPageInfo.match(pattern)[0]);
};

const getGameURLsOnPage = ($) => {
  return $(selector["gameTitles"])
    .toArray()
    .map((ele) => {
      if ($(ele).text().includes(CONSOLE)) {
        return $(ele).attr("href");
      }
    });
};

const getAxiosFromGameURLs = (urls) => {
  return urls.map((gameURL) => {
    return axios.get(`${baseURL}${gameURL}`);
  });
};

// ---------- work on game title page ----------
const recordAvailableGame = (response) => {
  const $ = getParsedPage(response);
  const availLibraries = $(selector["availLibraries"]).toArray();
  if (availLibraries.length !== 0) {
    const title = $(selector["title"]).text();
    console.log(`game ${title} has >= 1 available copy!`);
    const url = response.config.url;
    const totalCopy = computeTotalCopyNr($);
    availLibraries.forEach((ele) => {
      makeRecord({
        title: title,
        url: url,
        library: $(ele).find(selector["library"]).text(),
        availableCopy: $(ele)
          .find(selector["availableCopy"])
          .text()
          .replace("/", " of "),
        totalCopy: totalCopy,
      });
    });
  }
};

const computeTotalCopyNr = ($) => {
  let count = 0;
  const pattern = /\d+$/;
  $(selector["availableCopy"]).each((i, ele) => {
    count += parseInt($(ele).text().match(pattern)[0]);
  });
  return count;
};

const makeRecord = (obj) => {
  gameAvailInfo.push(obj);
};

// get url of the request out of a response obj
// console.log(response.config.url);
// console.log(response.config.params);
