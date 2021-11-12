const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

app.set("view engine", "ejs");

function generateRandomString() {
  let ranId = (Math.random() + 1).toString(36).substring(7);
  return ranId;
}
function urlsForUser(id){
  const key = Object.keys(urlDatabase);
  let obj = {};
  for(let val of key){
    if(urlDatabase[val].userID === id){
      obj [val] = urlDatabase[val].longURL
    }
  }
  return obj;
}
function checkUser(email,password) {
  for(let i in users){
   if(email === users[i].email){
     if(bcrypt.compareSync(password, users[i].hashedPassword)) {
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
        userID: "1234"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "12345555"
    }
};

const users = { 
  "1234": {
    id: "1234", 
    email: "user@example.com", 
    hashedPassword: "12345"
  },
}

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const { data, error } = checkUser(email, password);
  console.log(users, data, error)
  if (error === "err1") {
		return res.status(403).send('password doesn\'t match email given')
	}
  if (error === "err2") {
		return res.status(403).send('user doesn"t exist')
	} 
 
    res.cookie("user_id",data)
    res.redirect(`/urls`)
});

app.post("/register", (req, res) => {
  
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const { data, error } = checkUser(email, password);
  if(!email || !password){
    return res.status(400).send('Email or password cannot be empty');
  }
  if(!data){
    return res.status(400).send('Email already exists');
  }
  const id = generateRandomString();
  users[id] = { id, email, hashedPassword };
  res.cookie("user_id",id);
  res.redirect(`/urls`)
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect(`/urls`)
});

app.get("/u/:shortURL", (req, res) => {
  if(urlDatabase[req.params.shortURL] === undefined){
    return res.send("This Url doesn't exist")
  }
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
  if(req.cookies["user_id"]){
    return res.send("Please login")
  }
  shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: users[req.cookies["user_id"]].id} 
  res.redirect(`/urls/${shortURL}`)
});

app.get("/urls", (req, res) => {
  const urls = urlsForUser(req.cookies["user_id"])
  const templateVars = { username: users[req.cookies["user_id"]], urls };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if(urlDatabase[req.params.shortURL] === undefined){
    return res.send("This Url doesn't exist")
  }
  if(req.cookies["user_id"]){
    return res.send("Please login")
  }
  if(urlDatabase[req.params.shortURL].userID !== req.cookies["user_id"]){
    return res.send("You don't have access to this url")
  }
  const templateVars = {  username: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  if(req.cookies["user_id"]){
  res.redirect(`/urls`)
}
res.redirect(`/login`)
});

app.post("/urls/:shortURL/", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL; 
  res.redirect(`/urls`)
});

app.get("/urls/:shortURL/delete", (req, res) => {
  if(urlDatabase[req.params.shortURL].userID !== req.cookies["user_id"]){
    return res.send("You don't have permission to delete this url")
  }
  delete urlDatabase[req.params.shortURL]
  res.redirect(`/urls`)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if(urlDatabase[req.params.shortURL].userID !== req.cookies["user_id"]){
    return res.send("You don't have permission to delete this url")
  }
  delete urlDatabase[req.params.shortURL].longURL
  res.redirect(`/urls`)
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});