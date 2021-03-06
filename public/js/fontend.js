import {
  getSong,
  getNextSong,
  getRandomSong,
  getPrevSong,
  getRandomNNumbersExcludeM,
  toMMSS,
} from "./utils.js";

const config = {
  aip:
    "https://zingmp3.vn/api/v2/playlist/getDetail?id=ZF9ACU6A&ctime=1616476358&version=1.1.4&sig=559da472b451be406ed1c23f3ec905d5ebee04040d2b1daa4a5e7b542b8fa5f0d87347833d36a6457157c4e1429f7e4f51b04054b2ab9abd3fd50dffaeddc5aa9&apiKey=kI44ARvPwaqL7v0KuDSM0rGORtdY1nnw",
  zing: "https://zingmp3.vn",
  localAPI: "http://0.0.0.0:9001/api",
};
const defaultImgSong = "./images/default_song.jpg";

const tooltipBar = document.getElementById("tooltip");
const player = document.querySelector("audio");
const header = document.querySelector(".header");
const listTitle = document.querySelector(".list-title ");
const controllPlayer = document.querySelector(".controller");
const singerImg = document.getElementById("singer-img");
const listContainer = document.querySelector(".list-container");

window.addEventListener("resize", function () {
  document.querySelector(".list-container").style.height = `calc(100vh - ${
    controllPlayer.clientHeight + header.clientHeight + listTitle.clientHeight
  }px - 4.5rem)`;
});

const controller = {
  sources: [],
  data: [],
  selectedSong: "", // selected song
  paused: true,
  random: false,
  loading: false,
  replay: 0, // 0: none, 1: replay a song, 2: replay all songs
  duration: 0,
  handleLoadedData: function (e) {
    this.duration = player.duration;
    this.loading = false;
    renderListSongs();
    renderPlayButton();
  },
  handleInit: async function () {
    this.reload(getSong());
  },
  handlePlay: function () {
    console.log("play");
  },
  handleEnded: function () {
    if (!this.replay) {
      try {
        player.pause();
        this.paused = true;
        renderListSongs();
        renderPlayButton();
        // pause animation rotate disc
        const song = getSong(this.selectedSong);
        renderPlayedSong(song);
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
  handleLoadStartEvent: function () {
    this.loading = true;
    renderListSongs();
    renderPlayButton();
  },
  handlePlayButton: async function () {
    const song = getSong(this.selectedSong);

    if (this.paused) {
      try {
        await player.play();
        this.paused = player.paused;
        renderPlayedSong(song);
        renderListSongs();
        renderPlayButton();
      } catch (e) {
        console.log(e);
      } finally {
        return;
      }
    }
    try {
      await player.pause();
      this.paused = player.paused;
      renderPlayedSong(song);
      renderListSongs();
      renderPlayButton();
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
    document
      .getElementById("progress-bar")
      .setAttribute("style", `width: ${(curTime * 100) / player.duration}%`);
  },
  handleReplay: function () {
    this.replay = this.replay > 1 ? 0 : (this.replay += 1);
    const replay = document.getElementById("replay");
    if (!this.replay) {
      replay.classList.remove("btn-danger", "replay-all");
      replay.classList.add("replay-one");
      document.getElementById("replay").classList.remove("btn-outline-danger");
      document.getElementById("replay").classList.add("btn-outline-secondary");
      return;
    }
    document.getElementById("replay").classList.add("btn-outline-danger");
    document.getElementById("replay").classList.remove("btn-outline-secondary");
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
    if (this.random) {
      document.getElementById("random").classList.add("btn-outline-danger");
      document
        .getElementById("random")
        .classList.remove("btn-outline-secondary");
      document.getElementById("random").classList.add("btn-danger");
      return;
    }
    document.getElementById("random").classList.remove("btn-outline-danger");
    document.getElementById("random").classList.add("btn-outline-secondary");
    document.getElementById("random").classList.remove("btn-danger");
  },
  handleTimeupdate: function () {
    const progressed = document.getElementById("progress-bar");
    progressed.setAttribute("aria-valuenow", player.currentTime);
    document.getElementById("remain-time").innerText = toMMSS(
      (controller.duration - player.currentTime) * 1000
    );
    progressed.setAttribute(
      "style",
      `width: ${(player.currentTime * 100) / player.duration}%`
    );
  },
};
// login
const loginModal = new bootstrap.Modal(document.getElementById("loginModal"), {
  keyboard: false,
  backdrop: "static",
});

// avatar
const avatar = document.getElementById("avatar");

// calculate controller's height when init load
document.addEventListener("DOMContentLoaded", function (event) {
  document.querySelector(".list-container").style.height = `calc(100vh - ${
    controllPlayer.clientHeight + header.clientHeight + listTitle.clientHeight
  }px - 4.5rem)`;
  const user = JSON.parse(localStorage.getItem("user")) || {};
  if (user.id) {
    user.imgURL && avatar.setAttribute("src", user.imgURL);
    return;
  }
  loginModal.show();
});

fetch("./data.json")
  .then((response) => response.json())
  .then(({ data }) => {
    controller.sources = data.items.map((i) => ({
      id: i.encodeId,
      title: i.title,
      slugifyKeywork: slugify(i.title + " " + i.artistsNames, {
        lower: true,
        locale: "vi",
      }),
      srcImg: i.thumbnailM,
      src: `http://api.mp3.zing.vn/api/streaming/audio/${i.encodeId}/180`,
      singer: i.artistsNames,
    }));
    controller.data = controller.sources;
    controller.handleInit();

    renderPlayedSong(getSong());
    renderListSongs();
  });

let lastScroll = 0;

listContainer.addEventListener(
  "scroll",
  debounce((e) => {
    const changedHeight =
      e.srcElement.scrollTop < 200 ? 200 - e.srcElement.scrollTop : 0;

    singerImg.style.height = `${changedHeight}px`;

    // TODO: transition to hide or unhide singer image
    // singerImg.style.transition = "opacity, height 0.3s ease";

    listContainer.style.height = `calc(100vh - ${
      controllPlayer.clientHeight + header.clientHeight + listTitle.clientHeight
    }px - 4.5rem)`;
    singerImg.style.opacity =
      e.srcElement.scrollTop < 170 ? (200 - e.srcElement.scrollTop) / 200 : 0;
    lastScroll = e.srcElement.scrollTop;
  }, 0)
);

function debounce(f, timeout = 300) {
  let id = null;
  return function (e) {
    id && clearTimeout(id);
    id = setTimeout(function () {
      f(e);
    }, timeout);
  };
}

player.addEventListener("play", controller.handlePlay.bind(controller));
player.addEventListener(
  "loadstart",
  controller.handleLoadStartEvent.bind(controller)
);
player.addEventListener("ended", controller.handleEnded.bind(controller));

player.addEventListener(
  "loadeddata",
  controller.handleLoadedData.bind(controller)
);

// progressed
player.addEventListener("timeupdate", controller.handleTimeupdate);

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

const clearInputButton = document.getElementById("clear");
const searchInput = document.getElementById("search");
searchInput.addEventListener(
  "input",
  debounce(function (e) {
    if (e.target.value) {
      clearInputButton.style.width = "15px";
    } else {
      clearInputButton.style.width = 0;
    }
    controller.sources = controller.data.filter((s) =>
      s.slugifyKeywork.includes(
        slugify(e.target.value, { lower: true, locale: "vi" })
      )
    );
    renderListSongs();
  }, 300)
);
clearInputButton.addEventListener("click", function () {
  clearInputButton.style.width = 0;
  searchInput.value = "";
  controller.sources = controller.data;
  renderListSongs();
});
document
  .getElementById("play-btn")
  .addEventListener("click", controller.handlePlayButton.bind(controller));

document
  .getElementById("next")
  .addEventListener("click", controller.handleNextButton.bind(controller));

document
  .getElementById("previous")
  .addEventListener("click", controller.handlePreviousButton.bind(controller));

// render Play Button
function renderPlayButton() {
  document
    .querySelector("#play-btn")
    .classList.remove("loading-btn", "play-btn", "pause-btn");
  if (controller.loading) {
    document.querySelector("#play-btn").classList.add("loading-btn");
    return;
  }
  controller.paused
    ? document.querySelector("#play-btn").classList.add("play-btn")
    : document.querySelector("#play-btn").classList.add("pause-btn");
}
// render List song
function renderListSongs(
  songs = controller.sources,
  playedSongId = controller.selectedSong
) {
  const playingOpacity = (c) => `<div id="opacity-${
    c.id
  }" class="opacity"></div>
  ${
    controller.loading
      ? `<img id="loading-${c.id}" class="loading loading-img" src="./images/spinner.gif" />`
      : !controller.paused
      ? `<img id="playing-${c.id}" class="playing" src="./images/icon-playing.gif" />`
      : `<img id="play-${c.id}" class="play" src="./images/play-circle-regular.svg" />`
  }`;

  document.getElementById("list-song").innerHTML = songs.reduce(
    (s, c, i, a) => {
      return (s += `<div class="d-flex align-items-center py-2 song-item ${
        i === a.length - 1 ? "border-bottom-0" : ""
      }">
    <div id=${`song-item-${c.id}`} class="img-container">
      <figure class="song-img">
        <img src=${c.srcImg || defaultImgSong} alt="" />
      </figure>
      ${c.id === controller.selectedSong ? playingOpacity(c) : ""}
    </div>
    <div class="meta ms-3">
      <h5  class="title mb-0">${c.title}</h5 >
      <span>${c.singer}</span>
    </div>
  </div>`);
    },
    ""
  );
  songs.map((s) => {
    const element = document.getElementById(`song-item-${s.id}`);
    element.addEventListener("click", () => {
      if (playedSongId !== s.id) return controller.reload(s);
      controller.handlePlayButton();
      renderListSongs();
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

export { controller, loginModal };
