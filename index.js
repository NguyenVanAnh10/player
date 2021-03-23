const express = require("express");
const path = require("path");
// const { createProxyMiddleware } = require("http-proxy-middleware");
const fetch = require("node-fetch");

const app = express();

const hostname = "0.0.0.0";
const port = 9000;
// const config = {
//   zing: "https://zingmp3.vn",
//   origin: "http://0.0.0.0:9001",
// };

app.use(express.static("public"));
// app.use(
//   "/api/v2/playlist/getDetail",
//   createProxyMiddleware({ target: config.zing, changeOrigin: true })
// );
app.get("/", function (req, res) {
  // res.set("Content-Type", "text/html");
  res.sendFile(path.join(__dirname + "/frontend.html"));
});

app.listen(port, () => {
  console.log(`Example app listening at http://${hostname}:${port}`);
});
