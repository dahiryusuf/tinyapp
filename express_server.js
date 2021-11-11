const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

app.set("view engine", "ejs");

function generateRandomString() {
  let ranId = (Math.random() + 1).toString(36).substring(7);
  return ranId;
}

function checkUser(email) {
  for(let i in users){
   if(email === users[i].email){
     return true 
  }
}
  return false;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "1234": {
    id: "1234", 
    email: "user@example.com", 
    password: "12345"
  },
}

app.post("/login", (req, res) => {
  res.cookie("username",req.body.username)
  res.redirect(`/urls`)
});

app.post("/register", (req, res) => {
  
  const { email, password } = req.body;
  if(!email || !password){
    res.status(400).send('Email or password cannot be empty');
  }
  if(checkUser(email)){
    res.status(400).send('Email already exists');
  }
  const id = generateRandomString();
  users[id] = { id, email, password };
  res.cookie("user_id",id)
  res.redirect(`/urls`)
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect(`/urls`)
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
}); 

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  const templateVars = { username: req.cookies["username"]};
  res.render("urls_login", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { username: req.cookies["username"]};
  res.render("urls_reg", templateVars);
});

app.post("/urls", (req, res) => {
  shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;  
  res.redirect(`/urls/${shortURL}`)
});

app.get("/urls", (req, res) => {
  const templateVars = { username: users[req.cookies["user_id"]], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {  username: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.redirect(`/urls`)
});

app.post("/urls/:shortURL/", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL; 
  res.redirect(`/urls`)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect(`/urls`)
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});