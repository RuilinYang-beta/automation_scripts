const getNumVideo = () => {
  return parseInt(
    $(
      "span.index-message.style-scope.ytd-playlist-panel-renderer[hidden]"
    ).innerText.split("/")[1]
  );
};

const getTimeStrings = (numVideo, start, end) => {
  // if not specified, compute on all videos of a playlist
  if (start === undefined) {
    start = 0;
    end = numVideo;
  }

  return [...$$("span.style-scope.ytd-thumbnail-overlay-time-status-renderer")]
    .slice(start, end)
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

// range is of format [start, end]
let start = (range) => {
  let start = undefined;
  let end = undefined;
  if (range !== undefined) {
    [start, end] = range;
    // transform num starting at 1, to idx starting at 0
    start--;
    end--;
  }

  let numVideo = getNumVideo();
  let timeStrings = getTimeStrings(numVideo, start, end);
  let timeInts = getTimeInts(timeStrings);
  let totalSeconds = timeInts.reduce(getTotalSeconds, 0);
  let totalTime = getTotalTime(totalSeconds);

  let report =
    range === undefined
      ? `Total duration of ${numVideo} videos: ${totalTime}`
      : `Video ${start++} to ${end++} amount to :${totalTime}`;

  console.log(report);
};

start();
