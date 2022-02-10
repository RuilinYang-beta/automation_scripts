const fs = require("fs");
const { format } = require("@fast-csv/format");

// prepare file write stream
const fileName = "availableGames.csv";
const csvFile = fs.createWriteStream(fileName);

// prepare csv config
const csvStream = format({ headers: true });
csvStream.pipe(csvFile).on("end", () => process.exit());

csvStream.write({
  title: "sometitle",
  url: "some url",
  library: "somelibrary",
  availableCopy: "3",
  totalCopy: "9",
});
csvStream.write({
  title: "sometitle",
  url: "some url",
  library: "somelibrary",
  availableCopy: "3",
  totalCopy: "9",
});
csvStream.write({
  title: "sometitle",
  url: "some url",
  library: "somelibrary",
  availableCopy: "3",
  totalCopy: "9",
});

csvStream.end();
