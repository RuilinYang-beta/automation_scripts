const getNumVideo = () => {
  return parseInt(
    $(
      "span.index-message.style-scope.ytd-playlist-panel-renderer[hidden]"
    ).innerText.split("/")[1]
  );
};

const getTimeStrings = (numVideo) => {
  return [...$$("span.style-scope.ytd-thumbnail-overlay-time-status-renderer")]
    .slice(0, numVideo)
    .map((ele) => ele.innerText);
};

const getTimeInts = (timeStrings) => {
  return timeStrings.map((ele) => ele.split(":").map((ele) => parseInt(ele)));
};

const getTotalSeconds = (acc, curr) => {
  let seconds = curr.at(-1);
  let secondsMin = curr.at(-2) !== undefined ? curr.at(-2) * 60 : 0;
  let secondsHour = curr.at(-3) !== undefined ? curr.at(-3) * 3600 : 0;
  return acc + seconds + secondsMin + secondsHour;
};

let getTotalTime = (totalSeconds) => {
  let hours = Math.floor(totalSeconds / 3600);
  let minutes = Math.floor((totalSeconds % 3600) / 60);
  let seconds = totalSeconds % 60;
  return `Total time: ${hours}:${minutes}:${seconds}`;
};

let start = () => {
  let numVideo = getNumVideo();
  let timeStrings = getTimeStrings(numVideo);
  let timeInts = getTimeInts(timeStrings);
  let totalSeconds = timeInts.reduce(getTotalSeconds, 0);
  console.log(
    `Total duration of ${numVideo} videos: ${getTotalTime(totalSeconds)}`
  );
};

start();
