const express = require("express");
const path = require("path");

const app = express();


const hostname = "0.0.0.0";
const port = 9001;

app.get("/api", function (req, res) {
  res.set("Content-Type", "application/json");
  res.json({ data: [] });
});

app.listen(port, () => {
  console.log(`API Server listening at http://${hostname}:${port}`);
});
