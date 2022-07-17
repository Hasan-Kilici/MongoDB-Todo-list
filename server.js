const http = require("http");
const fs = require("fs");
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const app = express();
const bodyParser = require("body-parser");
const server = http.createServer(app);
const path = require("path");

const cookieParser = require("cookie-parser");
const axios = require("axios");

app.use(cookieParser());
const port = 8080;

//Socket
const socketio = require("socket.io");
const io = new socketio.Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

//Body Parser
app.use(bodyParser.json()).use(
  bodyParser.urlencoded({
    extended: true,
  })
);
//Statik
app.use(express.static("public"));
app.set("src", "path/to/views");

const dbURL = process.env.db;
mongoose
  .connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    app.listen(port, () => {
      console.log("mongoDB Bağlantı kuruldu");
    });
  })
  .catch((err) => console.log(err));
//Collections
const User = require("./models/users.js");
const List = require("./models/list.js");
//Pages
app.get("/", (req, res) => {
  var userId = req.cookies.id;
  if (userId != null) {
    User.findById(userId)
      .then((UserResult) => {
        res.redirect(`/user/to-do/${UserResult._id}`);
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    let user = new User({
      token: Math.floor(Math.random() * 999999),
    });
    user.save().then((NewUserResult) => {
      res.cookie("id", NewUserResult._id);
      res.redirect(`/user/to-do/${NewUserResult._id}`);
    });
  }
});
//To-do Page
app.get("/user/to-do/:id", (req, res) => {
  var id = req.params.id;
  var userId = req.cookies.id;
  if (id == userId) {
    User.findById(id).then((UserResult) => {
      List.find({ userId: id })
        .sort({ createdAt: -1 })
        .then((ListResult) => {
          List.find({ userId: id })
            .count()
            .then((ListCount) => {
              res.render(`${__dirname}/src/pages/index.ejs`, {
                user: UserResult,
                list: ListResult,
                listCount: ListCount,
                title: `To do App`,
              });
            });
        });
    });
  } else {
    res.redirect("/");
  }
});
//Posts
//New Task
app.post("/new/task/:id", (req, res) => {
  var id = req.params.id;
  User.findById(id).then((UserResult) => {
    let list = new List({
      todo: req.body.todo,
      status: "new",
      userId: UserResult._id,
    });
    list.save().then((ListResult) => {
      res.redirect(`/user/to-do/${UserResult._id}`);
    });
  });
});
//Remove Task
app.post("/remove/task/:id", (req, res) => {
  var id = req.params.id;
  List.findByIdAndDelete(id).then((Result) => {
    res.redirect(`/user/to-do/${Result.userId}`);
  });
});
//Finish Task
app.post("/finish/task/:id", (req, res) => {
  var id = req.params.id;
  List.findByIdAndUpdate(id, {
    status: "Finished",
  }).then((Result) => {
    res.redirect(`/user/to-do/${Result.userId}`);
  });
});
//Unfinish Task
app.post("/unfinish/task/:id", (req, res) => {
  var id = req.params.id;
  List.findByIdAndUpdate(id, {
    status: "new",
  }).then((Result) => {
    res.redirect(`/user/to-do/${Result.userId}`);
  });
});
