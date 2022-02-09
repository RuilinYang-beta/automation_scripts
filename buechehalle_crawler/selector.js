/*
 * ----- gamesPage -----
 * gameTitles: get all game titles on a page
 * totalPageInfo: get number of total pages
 * ----- one game page -----
 * nrLibraries: get number of library that ever have this game
 * nrCopies: get number of copies each library ever have
 * availLibraries: get libraries that this game is available
 * availCopies: get number of copies this game is available
 */
const selector = {
  gameTitles: "ul.search-results-list li div.search-results-text h2 a",
  totalPageInfo: "div.pagination.block p.pagination-total",
  nrLibraries:
    "div.accordion-wrapper ul.accordion-availability li.accordion-item",
};

module.exports = selector;
