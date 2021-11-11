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

function checkUser(email,password) {
  for(let i in users){
   if(email === users[i].email){
     if(password === users[i].password){
      const info = users[i].id;
      return { error: null, data: info };
     }
      return { error: "err1", data: false };
  }
}
  return { error: "err2", data: null };
}

const urlDatabase = {
    b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    }
};

const users = { 
  "1234": {
    id: "1234", 
    email: "user@example.com", 
    password: "12345"
  },
}

app.post("/login", (req, res) => {

  const { email, password } = req.body;
  const { data, error } = checkUser(email, password);
  if (error === "err1") {
		res.status(403).send('password doesn\'t match email given')
    res.redirect(`/register`)
	}
  if (error === "err2") {
		res.status(403).send('user doesn"t exist')
    res.redirect(`/register`)
	}
    res.cookie("user_id",data)
    res.redirect(`/urls`)

});

app.post("/register", (req, res) => {
  
  const { email, password } = req.body;
  const { data, error } = checkUser(email, password);
  if(!email || !password){
    res.status(400).send('Email or password cannot be empty');
    res.redirect(`/register`)
  }
  if(data === false){
    res.status(400).send('Email already exists');
    res.redirect(`/register`)
  }
  const id = generateRandomString();
  users[id] = { id, email, password };
  res.cookie("user_id",id);
  res.redirect(`/urls`)
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect(`/urls`)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  const templateVars = { username: req.cookies["user_id"]};
  res.render("urls_login", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { username: req.cookies["user_id"]};
  res.render("urls_reg", templateVars);
});

app.post("/urls", (req, res) => {
  shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: users[req.cookies["user_id"]].id} 
  res.redirect(`/urls/${shortURL}`)
});

app.get("/urls", (req, res) => {
  const keys = Object.keys(urlDatabase);
  const templateVars = { username: users[req.cookies["user_id"]], urls: urlDatabase, keys };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {  username: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.redirect(`/urls`)
});

app.post("/urls/:shortURL/", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL; 
  res.redirect(`/urls`)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect(`/urls`)
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});