/* 
steps: 
1. [done] from startURL get two kinds of things: 
    * [done] total number of pages and url pattern of each page 
    * [done] urls of each game title
2. [done] from each pageURL, get a list of gameURL
3. from each gameURL, get whether the game is available somewhere, 
write result
4. (optional) for each location that has an available game, 
query google map api to find the ones that are nearest to me
*/

const axios = require("axios");
const cheerio = require("cheerio");
const selector = require("./selector");

const CONSOLE = "[Nintendo Switch]";
const baseURL = "https://www.buecherhallen.de/";
const pageURL = "katalog-suchergebnisse.html";
const gameURLs = [];
let totalPage;

// ------------ get urls of all games ------------
axios
  .get(`${baseURL}${pageURL}`, {
    params: {
      suchbegriff: CONSOLE,
    },
  })
  .then((response) => {
    const $ = getParsedPage(response);
    _recordGameURLOnPage($);
    totalPage = _getTotalPages($);
  })
  .then(() => {
    console.log("skip recording all game url for now..");
    // recordRestGameURL();
  })
  .catch((error) => {
    console.error(error);
  });

// ------------ check availability of games ------------
const tempGame =
  "https://www.buecherhallen.de/suchergebnis-detail/medium/T019782113.html";

axios.get(`${baseURL}${gameURLs[0]}`).then((response) => {
  const $ = getParsedPage(response);
});
// ------------ helper functions ------------
/*
 * For a response obj from an axios call,
 * return a parsed cheerio obj.
 */
const getParsedPage = (axiosRes) => {
  const rawPage = axiosRes["data"];
  return cheerio.load(rawPage, null, false);
};

/*
 * For a cheerio obj, recode all `CONSOLE` game's URL.
 */
const _recordGameURLOnPage = ($) => {
  $(selector["gameTitles"]).each((i, ele) => {
    if ($(ele).text().includes(CONSOLE)) {
      gameURLs.push($(ele).attr("href"));
    }
  });
};

/*
 * From the cheerio obj of the first page,
 * get the number of total pages.
 */
const _getTotalPages = ($) => {
  const totalPageInfo = $(selector["totalPageInfo"]).text();
  const pattern = /\d+$/;
  return parseInt(totalPageInfo.match(pattern)[0]);
};

/*
 * Construct many axios.get Promise and fire them,
 * extract the game URL of the many responses and record them.
 */
const recordRestGameURL = () => {
  // TODO: what is ...?
  const restPageNrs = [...Array(totalPage).keys()]
    .map((e) => e + 1)
    .filter((e) => e >= 2);

  // get an array of axios get promise
  const restAxiosReqs = restPageNrs.map((e) => {
    return axios.get(`${baseURL}${pageURL}`, {
      params: {
        suchbegriff: CONSOLE,
        "seite-m37": e,
      },
    });
  });

  axios.all(restAxiosReqs).then((responses) => {
    responses.forEach((resp) => {
      _recordGameURLOnPage(getParsedPage(resp));
    });
    console.log(`${gameURLs.length} games recorded`);
  });
};
