var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var http = require("http");
const webSocketServer = require("websocket").server;

const APIS = require("./scripts/api-call");
const pullPostsAndSendWordcountmap = require("./scripts/blogprocess");
const { FETCH_INTERVAL_SECONDS, STATUS_CODE_SUCCESS } = require("./config");

var port = process.env.PORT || "3001";
var app = express();
var server = http.createServer(app);

// websocket creation
const wsServer = new webSocketServer({
  httpServer: server,
});

var connection; // once websocket connection established, store connection

wsServer.on("request", (request) => {
  connection = request.accept(null, request.origin);

  console.log(new Date() + "connection accepted");

  connection.on("message", (msg) => {
    console.log(msg);
  });

  connection.on("close", (reasonCode, description) => {
    console.log(new Date() + " Peer disconnected");
  });
});

///////////////////////// express setting
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
/////////////////////////

var hosturl = ""; // save global host url
var intervalId = ""; // setInterval id

app.post("/api/hostconnect", async (req, res, next) => {
  if (intervalId != "") clearInterval(intervalId); // if there is new connection, old setInterval is removed

  hosturl = req.body.hosturl;
  const connectionStatus = await APIS.testHostConnection(hosturl);
  console.log(connectionStatus);
  if (connectionStatus === "invalid_url") {
    return res.send({
      message: "Invalid Url",
    });
  } else if (connectionStatus == STATUS_CODE_SUCCESS) {
    // if host connection opened, the system pull posts from host every 3 seconds and send the word count map to frontend via websocket

    intervalId = setInterval(async () => {
      const wcm = await pullPostsAndSendWordcountmap(hosturl);
      connection.send(JSON.stringify(wcm)); // send word count map
    }, FETCH_INTERVAL_SECONDS); // you can change seconds. 3000ms

    return res.send({
      message: "Connection opened. Starting service",
    });
  } else {
    return res.send({
      message: "Connection failed",
    });
  }
});

// get all posts from host
app.get("/api/getposts", async (req, res) => {
  const posts = await APIS.getPosts(hosturl);
  return res.send(posts);
});

/////////////////////////////////
server.listen(port);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
