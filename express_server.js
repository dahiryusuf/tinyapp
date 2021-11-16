const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
const checkUser = require("./helpers");
const cookieSession = require('cookie-session');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.set("view engine", "ejs");

const generateRandomString = () => {
  let ranId = (Math.random() + 1).toString(36).substring(7);
  return ranId;
};

const urlsForUser = (id) => {
  const key = Object.keys(urlDatabase);
  let obj = {};
  for (let val of key) {
    if (urlDatabase[val].userID === id) {
      obj [val] = urlDatabase[val].longURL;
    }
  }
  return obj;
};


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "1234"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "12345555"
  }
};

const users = {

};

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const { data, error } = checkUser(email, password, users);
  if (error === "err1") {
    return res.status(403).send('password doesn\'t match email given');
  }
  if (error === "err2") {
    return res.status(403).send('user doesn\'t exist');
}
 
  req.session["user_id"] = data;
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const { data, error } = checkUser(email, password, users);
  if (!email || !password) {
    return res.status(400).send('Email or password cannot be empty');
  }
  if (error === "err1" || data) {
    return res.status(400).send('Email already exists');
  }
  const id = generateRandomString();
  users[id] = { id, email, hashedPassword };
  req.session["user_id"] = id;
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { 
    longURL: req.body.longURL, 
    userID: users[req.session["user_id"]].id
   };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/", (req, res) => {
  if (!req.session["user_id"]) {
    return res.send("Please login");
  }
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    return res.send("This Url doesn't exist");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session["user_id"]) {
    return res.send("Please login");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.get("/login", (req, res) => {
  if (req.session["user_id"]) {
   return res.redirect(`/urls`);
  }
  const templateVars = { username: req.session["user_id"]};
  res.render("urls_login", templateVars);
});

app.get("/register", (req, res) => {
  if (req.session["user_id"]) {
    return res.redirect(`/urls`);
  }
  const templateVars = { username: req.session["user_id"]};
  res.render("urls_reg", templateVars);
});

app.get("/urls", (req, res) => {
  if (!req.session["user_id"]) {
    return res.send("Please Login to view urls")
  }
  const urls = urlsForUser(req.session["user_id"]);
  const templateVars = { username: users[req.session["user_id"]], urls };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session["user_id"]) {
    return res.redirect(`/login`);
  }
  const templateVars = { username: users[req.session["user_id"]]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    return res.send("This Url doesn't exist");
  }
  if (!req.session["user_id"]) {
    return res.send("Please login");
  }
  if (urlDatabase[req.params.shortURL].userID !== req.session["user_id"]) {
    return res.send("You don't have access to this url");
  }
  const templateVars = {  
  username: users[req.session["user_id"]], 
  shortURL: req.params.shortURL, 
  longURL: urlDatabase[req.params.shortURL].longURL
};
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  if (req.session["user_id"]) {
    return res.redirect(`/urls`);
  }
  res.redirect(`/login`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});