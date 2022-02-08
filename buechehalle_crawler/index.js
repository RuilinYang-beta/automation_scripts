/* 
steps: 
1. from startURL get two kinds of things: 
    * [done] total number of pages and url pattern of each page 
    * [done] urls of each game title
2. from each pageURL, get a list of gameURL
3. from each gameURL, get whether the game is available somewhere, 
write result
4. (optional) for each location that has an available game, 
query google map api to find the ones that are nearest to me
*/

const axios = require("axios");
const cheerio = require("cheerio");
const selector = require("./selector");

const baseURL = "https://www.buecherhallen.de/";
const pageURL = "katalog-suchergebnisse.html";
const gameURLs = [];
let totalPage;

axios
  .get(`${baseURL}${pageURL}`, {
    params: {
      suchbegriff: "[Nintendo Switch]",
    },
  })
  .then((response) => {
    // const startPage = response["data"];
    // const $ = cheerio.load(startPage, null, false);
    const $ = getParsedPage(response);
    _recordGameURLOnPage($);
    totalPage = _getTotalPages($);
  })
  .then(() => {
    recordRestGameURL();
  })
  .catch((error) => {
    console.error(error);
  });

const getParsedPage = (axiosRes) => {
  console.log(Object.keys(axiosRes));
  const rawPage = axiosRes["data"];
  return cheerio.load(rawPage, null, false);
};

const recordRestGameURL = () => {
  // construct many axios.get Promise and fire them
  // extract the result and record them somewhere

  // TODO: what is ...?
  const restPageNr = [...Array(totalPage).keys()]
    .map((e) => e + 1)
    .filter((e) => e >= 2);
  //   console.log(restPageNr);

  // ----- test on 1 page -----
  //   const e = restPageNr[0];
  //   axios
  //     .get(`${baseURL}${pageURL}`, {
  //       params: {
  //         suchbegriff: "[Nintendo Switch]",
  //         "seite-m37": e,
  //       },
  //     })
  //     .then((response) => {
  //       const $ = getParsedPage(response);
  //       _recordGameURLOnPage($);
  //     });

  const restAxiosReqs = restPageNr.map((e) => {
    axios.get(`${baseURL}${pageURL}`, {
      params: {
        suchbegriff: "[Nintendo Switch]",
        "seite-m37": e,
      },
    });
  });

  //   axios.all(restAxiosReqs).then((responses) => {
  //     console.log(responses.length);
  //     responses.forEach((resp) => {
  //       _recordGameURLOnPage(getParsedPage(resp));
  //     });
  //   });
};

const _recordGameURLOnPage = ($) => {
  $(selector["gameTitle"]).each((i, ele) => {
    if ($(ele).text().includes("[Nintendo Switch]")) {
      console.log($(ele).attr("href"));
      gameURLs.push($(ele).attr("href"));
    }
  });
};

const _getTotalPages = ($) => {
  const totalPageInfo = $(selector["totalPageInfo"]).text();
  const pattern = /\d+$/;
  return parseInt(totalPageInfo.match(pattern)[0]);
};
