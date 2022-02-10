/*
 * ----- gamesPage -----
 * gameTitles: get all game titles on a page
 * totalPageInfo: get number of total pages
 * ----- one game page -----
 * totalLibraries: get number of library that ever have this game
 * totalCopies: get number of copies each library ever have
 * availLibraries: get libraries that this game is available
 * availCopies: get number of copies this game is available
 */
const selector = {
  gameTitles: "ul.search-results-list li div.search-results-text h2 a",
  totalPageInfo: "div.pagination.block p.pagination-total",
  totalLibraries:
    "div.accordion-wrapper ul.accordion-availability li.accordion-item",
  availLibraries: "li.record-available",
  title: "h1.medium-detail-title",
  library: "span.medium-availability-item-title-location",
  availableCopy: "span.medium-availability-item-title-count",
};

module.exports = selector;
