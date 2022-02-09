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
const gameURLs = [];
const gameAvailInfo = [];
let totalPage;

axios
  .get(`${baseURL}${pageURL}`, {
    params: {
      suchbegriff: CONSOLE,
    },
  })
  // 1. init: get total page, and record game urls on first page
  .then((response) => {
    const $ = getParsedPage(response);
    _recordGameURLOnPage($);
    totalPage = _getTotalPages($);
    return totalPage;
  })
  // 2. record game urls on the rest pages
  .then(() => {
    recordRestGameURL();
    // console.log(`${gameURLs.length} games recorded`);
  })
  // // 3. record available game info
  // .then(() => {
  //   checkAllGames();
  // })
  .catch((error) => {
    console.error(error);
  });

// ------------ check availability of games ------------

const checkAllGames = () => {
  // --- attempt to user axios.all ---
  // const gameAxiosReqs = gameURLs.map((gameURL) => {
  //   return axios.get(`${baseURL}${gameURL}`);
  // });

  // axios.all(gameAxiosReqs).then((responses) => {
  //   responses.forEach((resp) => {
  //     const $ = getParsedPage(resp);
  //     if (_anyCopyAvailable($)) {
  //       _recordGameAvailInfo($);

  //     }
  //   });
  // });

  gameURLs.forEach((gameURL) => {
    _checkOneGame(gameURL);
  });
};

const _checkOneGame = (gameURL) => {
  axios.get(`${baseURL}${gameURL}`).then((response) => {
    const $ = getParsedPage(response);
    const availLibraries = $(selector["availLibraries"]);
    if (availLibraries.length !== 0) {
      availLibraries.each((i, ele) => {
        _writeARow($, ele, `${baseURL}${gameURL}`);
      });
    }
  });
};
const _writeARow = ($, ele, link) => {
  // for now just print to console
  const title = $(selector["title"]).text();
  const url = link;
  const library = $(ele).find(selector["library"]).text();
  const availableCopy = $(ele).find(selector["availableCopy"]).text();
  const totalCopy = __computeTotalCopyNr($);
  console.log({
    title: title,
    url: url,
    library: library,
    availableCopy: availableCopy,
    totalCopy: totalCopy,
  });
};

const _recordGameAvailInfo = ($) => {
  $(selector["availLibraries"]).each((i, ele) => {});
};

const _anyCopyAvailable = ($) => {
  if ($(selector["availLibraries"]).length !== 0) {
    return true;
  }
  return false;
};

const __computeTotalCopyNr = ($) => {
  let count = 0;
  const pattern = /\d+$/;
  $(selector["availableCopy"]).each((i, ele) => {
    count += parseInt($(ele).text().match(pattern)[0]);
  });
  return count;
};

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
 * For a cheerio obj (of a page of games), recode a game's URL if the
 * game's title contains `CONSOLE`.
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
