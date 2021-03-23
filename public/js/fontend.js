const config = {
  aip:
    "https://zingmp3.vn/api/v2/playlist/getDetail?id=ZF9ACU6A&ctime=1616476358&version=1.1.4&sig=559da472b451be406ed1c23f3ec905d5ebee04040d2b1daa4a5e7b542b8fa5f0d87347833d36a6457157c4e1429f7e4f51b04054b2ab9abd3fd50dffaeddc5aa9&apiKey=kI44ARvPwaqL7v0KuDSM0rGORtdY1nnw",
  zing: "https://zingmp3.vn",
  localAPI: "http://0.0.0.0:9001/api",
};
const defaultImgSong = "./images/default_song.jpg";

const tooltipBar = document.getElementById("tooltip");
const player = document.querySelector("audio");

const controller = {
  sources: [],
  selectedSong: "", // selected song
  paused: true,
  random: false,
  replay: 0, // 0: none, 1: replay a song, 2: replay all songs
  duration: player.duration || 0,
  handleInit: async function () {
    this.reload(getSong());
  },
  handleEnded: function () {
    if (!this.replay) {
      try {
        player.pause();
        document.getElementById("play-btn").classList.remove("playing");
      } catch (error) {
        console.log(error);
      } finally {
        return;
      }
    }
    if (this.replay === 1) {
      this.reload(getSong(this.selectedSong));
      return;
    }
    this.handleNextButton();
  },
  handlePlayButton: async function () {
    const song = getSong(this.selectedSong);
    if (this.paused) {
      try {
        await player.play();
        document.getElementById("play-btn").classList.add("playing");
        this.paused = player.paused;
        renderPlayedSong(song);
        renderListSongs();
      } catch (e) {
        console.log(e);
      } finally {
        return;
      }
    }
    try {
      await player.pause();
      this.paused = player.paused;
      document.getElementById("play-btn").classList.remove("playing");
      renderPlayedSong(song);
      renderListSongs();
    } catch (e) {
      console.log(e);
    }
  },
  handleNextButton: function () {
    const song = !this.random
      ? getNextSong(this.selectedSong)
      : getRandomSong(this.selectedSong);
    this.reload(song);
  },
  handlePreviousButton: function () {
    const song = !this.random
      ? getPrevSong(this.selectedSong)
      : getRandomSong(this.selectedSong);
    this.reload(song);
  },
  reload: async function (song) {
    player.src = song.src;
    this.selectedSong = song.id;
    renderPlayedSong(song);
    renderListSongs();
    player.load();
    if (!this.paused) {
      try {
        await player.play();
        document.getElementById("play-btn").classList.add("playing");
      } catch (e) {
        console.log(e);
      } finally {
        this.paused = player.paused;
        return;
      }
    }
    try {
      await player.pause();
      this.paused = player.paused;
      document.getElementById("play-btn").classList.remove("playing");
    } catch (e) {
      console.log(e);
    }
  },
  handleSeeking: function (e) {
    const curTime = (e.clientX / e.view.innerWidth) * this.duration;
    player.currentTime = curTime;
    progressed.setAttribute(
      "style",
      `width: ${(curTime * 100) / player.duration}%`
    );
  },
  handleReplay: function () {
    this.replay = this.replay > 1 ? 0 : (this.replay += 1);
    const replay = document.getElementById("replay");
    if (!this.replay) {
      replay.classList.remove("btn-danger", "replay-all");
      replay.classList.add("replay-one");
      return;
    }
    if (this.replay === 1) {
      replay.classList.add("replay-one", "btn-danger");
      replay.classList.remove("replay-all");
      return;
    }
    replay.classList.remove("replay-one");
    replay.classList.add("replay-all", "btn-danger");
  },
  handleRandom: function () {
    this.random = !this.random;
    this.random
      ? document.getElementById("random").classList.add("btn-danger")
      : document.getElementById("random").classList.remove("btn-danger");
  },
};
fetch(config.localAPI)
  .then((r) => r.json())
  .then((r) => console.log("test api", r));

fetch(config.aip)
  .then((r) => r.json())
  .then((r) => console.log("test api", r));

fetch("./data.json")
  .then((response) => response.json())
  .then(({ data }) => {
    controller.sources = data.items.map((i) => ({
      id: i.encodeId,
      title: i.title,
      srcImg: i.thumbnailM,
      src: `http://api.mp3.zing.vn/api/streaming/audio/${i.encodeId}/180`,
      singer: i.artistsNames,
    }));
    controller.handleInit();

    renderPlayedSong(getSong());
    renderListSongs();
  });

player.addEventListener("ended", controller.handleEnded.bind(controller));

player.addEventListener("loadeddata", (e) => {
  controller.duration = player.duration;
});
// progressed
const progressed = document.getElementById("progress-bar");
const remainTime = document.getElementById("remain-time");
player.addEventListener("timeupdate", (e) => {
  progressed.setAttribute("aria-valuenow", player.currentTime);
  remainTime.innerText = toMMSS(
    (controller.duration - player.currentTime) * 1000
  );
  progressed.setAttribute(
    "style",
    `width: ${(player.currentTime * 100) / player.duration}%`
  );
});

const progressBar = document.getElementById("progress");
progressBar.addEventListener(
  "click",
  controller.handleSeeking.bind(controller)
);
// tooltip
const tooltip = new bootstrap.Tooltip(progressBar, {
  title: "00:00",
  offset: [0, 0],
});

progressBar.addEventListener("mousemove", (e) => {
  progressBar.setAttribute(
    "data-bs-original-title",
    toMMSS((e.clientX / e.view.innerWidth) * controller.duration * 1000)
  );
  tooltip.config.offset = [e.clientX - e.view.innerWidth / 2, 0];
  tooltip.update();
  tooltip.show();
});

const undoButton = document.getElementById("replay");
undoButton.addEventListener("click", controller.handleReplay.bind(controller));

const randomButton = document.getElementById("random");
randomButton.addEventListener(
  "click",
  controller.handleRandom.bind(controller)
);

const playButton = document.getElementById("play-btn");
playButton.addEventListener(
  "click",
  controller.handlePlayButton.bind(controller)
);

const nextButton = document.getElementById("next");
nextButton.addEventListener(
  "click",
  controller.handleNextButton.bind(controller)
);
const previousButton = document.getElementById("previous");
previousButton.addEventListener(
  "click",
  controller.handlePreviousButton.bind(controller)
);

// render List song
function renderListSongs(songs = controller.sources) {
  const playingOpacity = (
    c
  ) => `<div id="opacity-${c.id}" class="opacity"></div>
  <img id="playing-${c.id}" class="playing" src="./images/icon-playing.gif" />
  <img id="play-${c.id}" class="play" src="./images/play-circle-regular.svg" />`;

  document.getElementById("list-song").innerHTML = songs.reduce((s, c) => {
    return (s += `<div class="d-flex align-items-center py-2 song-item">
    <div id=${`song-item-${c.id}`} class="img-container">
      <figure class="song-img">
        <img src=${c.srcImg || defaultImgSong} alt="" />
      </figure>
      ${
        c.id === controller.selectedSong && !controller.paused
          ? playingOpacity(c)
          : ""
      }
    </div>
    <div class="meta ms-3">
      <h5  class="title mb-0">${c.title}</h5 >
      <span>${c.singer}</span>
    </div>
  </div>`);
  }, "");
  songs.map((s) => {
    const element = document.getElementById(`song-item-${s.id}`);
    element.addEventListener("click", () => {
      controller.reload(s);
    });
  });
}

function renderPlayedSong(song) {
  // render played song on controller bar
  const playedSongContainer = document.querySelector("#played-song");
  playedSongContainer
    .querySelector("img")
    .setAttribute("src", song.srcImg || defaultImgSong);
  !controller.paused
    ? playedSongContainer.querySelector("img").classList.add("rotate-running")
    : playedSongContainer
        .querySelector("img")
        .classList.remove("rotate-running");

  playedSongContainer.querySelector(".title").textContent = song.title || "N/A";
  playedSongContainer.querySelector(".singer").textContent =
    song.singer || "N/A";

  // render avatar song
  !controller.paused
    ? document.getElementById("singer-img").classList.add("rotate-running")
    : document.getElementById("singer-img").classList.remove("rotate-running");

  document
    .getElementById("singer-img")
    .setAttribute("src", song.srcImg || defaultImgSong);
}

function getSong(idSong, list = controller.sources) {
  return list.filter((l) => l.id === idSong)[0] || list[0];
}

function getRandomSong(currentSongId, list = controller.sources) {
  const index = list.findIndex((l) => l.id === currentSongId);
  if (index < 0) return list[getRandomNNumbersExcludeM(list.length - 1, 0)];
  return list[getRandomNNumbersExcludeM(list.length - 1, index)];
}

function getNextSong(idSong, list = controller.sources) {
  const index = list.findIndex((l) => l.id === idSong);
  if (index < 0 || index === list.length - 1) return list[0] || {};
  return list[index + 1];
}

function getPrevSong(idSong, list = controller.sources) {
  const index = list.findIndex((l) => l.id === idSong);
  if (index < 0) return list[0] || {};
  if (index === 0) return list[list.length - 1] || {};
  return list[index - 1];
}

function toMMSS(time) {
  let minutes = Math.floor(time / (1000 * 60));
  let seconds = Math.floor((time - minutes * (1000 * 60)) / 1000);
  if (minutes < 10) minutes = "0" + minutes;
  if (seconds < 10) seconds = "0" + seconds;
  return `${minutes} : ${seconds}`;
}
function getRandomNNumbersExcludeM(n, m) {
  const x = Math.floor(Math.random() * n);
  if (x !== m || n < 2) return x;
  return getRandomNNumbersExcludeM(n, m);
}
