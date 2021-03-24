const express = require("express");
const path = require("path");

const app = express();

const hostname = "0.0.0.0";
const port = 5000;
// const config = {
//   zing: "https://zingmp3.vn",
//   origin: "http://0.0.0.0:9001",
// };

app.use(express.static("public"));
// app.use(
//   "/api/v2/playlist/getDetail",
//   createProxyMiddleware({ target: config.zing, changeOrigin: true })
// );
if (process.env.NODE_ENV === "production") {
  console.log("xxx");
}

app.get("/", function (req, res) {
  // res.set("Content-Type", "text/html");
  res.sendFile(path.join(__dirname + "/frontend.html"));
});

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening at http://${hostname}:${port}`);
});
