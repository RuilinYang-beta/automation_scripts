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

axios
  // 0. fire init req
  .get(`${baseURL}${pageURL}`, {
    params: {
      suchbegriff: CONSOLE,
    },
  })
  // 1. get total page, and record game urls on first page
  .then((response) => {
    const $ = getParsedPage(response);
    _recordGameURLOnPage($);
    totalPage = _getTotalPages($);
    return totalPage;
  })
  // 2. prep and fire reqs to get game urls on the rest pages
  .then((totalPage) => {
    // const restPageReqs = makeRestPageReqs(totalPage);
    // it's likely that there is a quota nr. of request per ip can send in a period of time
    const restPageReqs = makeRestPageReqs(5);
    return axios.all(restPageReqs);
  })
  // 3. record game urls from axios response
  .then((responses) => {
    return new Promise((resolve, reject) => {
      responses.forEach((resp) => {
        _recordGameURLOnPage(getParsedPage(resp));
      });
      resolve(gameRecords);
    });
  })
  // 4. prep and fire reqs to check all games
  .then(() => {
    // why nr. of records differ each time????
    const nrGame = Object.keys(gameRecords).length;
    console.log(`collected ${nrGame} games`);

    // write to csv
    // prepare file write stream
    const fileName = "availableGames.csv";
    const csvFile = fs.createWriteStream(fileName);
    // prepare csv config
    const csvStream = format({ headers: true });
    csvStream.pipe(csvFile).on("end", () => process.exit());

    for (let key in gameRecords) {
      // send an axios req per 1 seconds
      setTimeout(() => {
        _checkOneGame(key, gameRecords[key], csvStream);
      }, 1000);
    }

    // why this function never get executed????
    setTimeout(() => {
      console.log(`ending csv stream...`);
      csvStream.end();
    }, 1500 * nrGame);
  })
  // // 3. record available game info
  // .then(() => {
  //   checkAllGames();
  // })
  .catch((error) => {
    if (error.isAxiosError) {
      console.log(`outer err: ${error.config.params}`);
      console.log(`outer err: ${error.config.url}`);
      console.log(
        `outer err: ${error.response.status}: ${error.response.statusText}`
      );
    }
  });

// ------------ check availability of games ------------
const _checkOneGame = (title, url, writer) => {
  axios
    .get(`${baseURL}${url}`)
    .then((response) => {
      const $ = getParsedPage(response);
      const availLibraries = $(selector["availLibraries"]);
      if (availLibraries.length !== 0) {
        console.log(`game ${title} has >= 1 available copy!`);
        availLibraries.each((i, ele) => {
          _writeARow($, ele, `${baseURL}${url}`, writer);
        });
      }
    })
    .catch((error) => {
      console.log(
        `error at ${baseURL}${url}, the ${Object.values(gameRecords).indexOf(
          url
        )}-th game of all`
      );
      if (error.isAxiosError) {
        console.log(
          `inner err: ${error.response.status}: ${error.response.statusText}`
        );
      }
    });
};

const _writeARow = ($, ele, link, writer) => {
  const title = $(selector["title"]).text();
  const url = link;
  const library = $(ele).find(selector["library"]).text();
  const availableCopy = $(ele).find(selector["availableCopy"]).text();
  const totalCopy = __computeTotalCopyNr($);
  writer.write({
    title: title,
    url: url,
    library: library,
    availableCopy: availableCopy,
    totalCopy: totalCopy,
  });
};

const __computeTotalCopyNr = ($) => {
  let count = 0;
  const pattern = /\d+$/;
  $(selector["availableCopy"]).each((i, ele) => {
    count += parseInt($(ele).text().match(pattern)[0]);
  });
  return count;
};

// ------------ collect urls ------------
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
      gameRecords[$(ele).text()] = $(ele).attr("href");
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

const makeRestPageReqs = (totalPage) => {
  // TODO: what is ...?
  const restPageNrs = [...Array(totalPage).keys()]
    .map((e) => e + 1)
    .filter((e) => e >= 2);

  // get an array of axios get promise
  return restPageNrs.map((e) => {
    return axios.get(`${baseURL}${pageURL}`, {
      params: {
        suchbegriff: CONSOLE,
        "seite-m37": e,
      },
    });
  });
};
