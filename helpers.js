const bcrypt = require('bcryptjs');
const checkUser = (email,password,user) => {
  for(let i in user){
   if(email === user[i].email){
     if(bcrypt.compareSync(password, user[i].hashedPassword)) {
      const info = user[i].id;
      return { error: null, data: info };
     }
      return { error: "err1", data: false };
  }
}
  return { error: "err2", data: null };
}

const generateRandomString = () => {
  let ranId = (Math.random() + 1).toString(36).substring(7);
  return ranId;
}

const urlsForUser = (id, urlDatabase) => {
  const key = Object.keys(urlDatabase);
  let obj = {};
  for (let val of key) {
    if (urlDatabase[val].userID === id) {
      obj [val] = urlDatabase[val].longURL;
    }
  }
  return obj;
}

module.exports =  checkUser, generateRandomString, urlsForUser