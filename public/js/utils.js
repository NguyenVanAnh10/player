import { controller } from "./fontend.js";

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
export {
  getSong,
  getNextSong,
  getRandomSong,
  getPrevSong,
  getRandomNNumbersExcludeM,
  toMMSS,
};
