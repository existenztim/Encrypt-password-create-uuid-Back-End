var express = require('express');
var router = express.Router();
const { v4: uuidv4 } = require('uuid');
const CryptoJS = require('crypto-js');
const fs = require('fs');

let users;

//Users always has the same data as users.json
fs.readFile('users.json', 'utf8', (err, data) => {
  if (err) {
    console.log(err);
  } else {
    users = JSON.parse(data);
  }
});

/* Just for testing, use this function if a person has forgot their password*/
// router.get('/', function(req, res, next) {

//   let userPassword = "replace this with encrypted password in users.json";
//   console.log(userPassword); 

//   const encryptedPassword = CryptoJS.AES.encrypt(userPassword, "salt key").toString();
//   console.log(encryptedPassword); 

//   const decryptedPassword = CryptoJS.AES.decrypt(encryptedPassword, "salt key").toString(CryptoJS.enc.Utf8);
//   console.log(decryptedPassword); 
//   res.send('respond with a resource');
// });

router.get('/', function(req, res){
  fs.readFile('users.json', function(err, data){
    if(err){
      console.log(err)
    } else {
      users = (JSON.parse(data));
      res.send(users);
    }
  })
});
 
router.get('/:userId', function(req, res, next) {
  userId = req.params.userId;
  console.log(userId);

  let findUser = users.find(user => user.id == userId);

  res.json(findUser);
});

//add user
router.post('/', function(req, res) {
  
  let addUser = req.body;
  users.push(addUser);

  addUser.id = uuidv4().substring(0,5); //substring to make 5 characters instead of standard 32
  
  req.body.userPassword = CryptoJS.AES.encrypt(addUser.userPassword, "salt key").toString();
  fs.readFile('users.json', function(err, data){
    if (err){
      console.log(err)
    } else {
      fs.writeFile('users.json', JSON.stringify(users, null, 2), function(err){
        if(err) {
          console.log(err);
        }
      })
    }
  })
  console.log(req.body);
  res.json(users);
});

//login user
router.post('/login', function(req, res, next) {
  const { userName, userPassword } = req.body;
  const foundUser = users.find(user => user.userName === userName);
  
  //decrypt
  const encryptedPassword  = CryptoJS.AES.decrypt(foundUser.userPassword.toString(), 'salt key');
  const decryptedPassword =  encryptedPassword.toString(CryptoJS.enc.Utf8);

  if (foundUser && userPassword === decryptedPassword) {
    res.status(201).json({userName: foundUser.userName, id: foundUser.id, decryptedUserPassword:decryptedPassword, encryptedUserPassword:foundUser.userPassword})
  } else if (!foundUser) {
    res.status(401).json('Username does not exist')
  } else {
    res.status(401).json("Incorrect password or username")
  }
});
module.exports = router;
