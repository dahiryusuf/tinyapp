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


module.exports =  checkUser