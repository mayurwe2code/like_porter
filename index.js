import connection from "./Db.js";
import express from "express";
import "dotenv/config";
import cors from "cors";
import jwt from 'jsonwebtoken'
import bodyParser from "body-parser";
import notificationRouter from "./src/routers/notificationRouter.js";
import userRouter from "./src/routers/userRouter.js";
import delivery_router from "./src/routers/delivery_router.js";
import adminRouter from "./src/routers/admin_router.js";
import mongoose from 'mongoose';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport'
import session from 'express-session';
import connectMongo from 'connect-mongo';
const MongoStore = connectMongo(session);
import { ensureAuth, ensureGuest } from './middleware/auth.js'
// import { pin_data } from './test_.js'


const app = express();
// connection
app.use(cors());

// app.use(express.json({ limit: '90mb' }));
// app.use(bodyParser.json());
// to support JSON-encoded bodies
// app.use(
//   bodyParser.urlencoded({
//     // to support URL-encoded bodies
//     extended: true,
//   })
// );



app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true, parameterLimit: 70000 }));

// app.use(bodyParser.urlencoded({ limit: "90mb", extended: true, parameterLimit: 50000 }));

app.use(express.static("public"));

// 
connection.query("SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))", (err, rows) => {
  if (err) {
    console.log("error-------------------SET GLOBAL sql_mode===========" + err)
  } else {
    console.log("--ok-----------------SET GLOBAL sql_mode======ok=====")
    console.log(rows)
  }
});

// console.log(pin_data)
// pin_data.forEach(element => {
//   connection.query('INSERT INTO `vendor_service_area`(`pin`, `city`, `area_name`) VALUES ("' + element["pin"] + '","indore","' + element["name"] + '")', (err, rows) => {
//     if (err) {
//       console.log("error--------=======" + err)
//     } else {
//       console.log("--ok---------------====ok=====")
//     }
//   });
// });


app.use(userRouter, delivery_router, adminRouter, notificationRouter);

app.get("/version", (req, res) => {
  let dat = new Date()
  // connection.end()
  // connection
  res.send({
    "latest_update": dat, "latest_commit": "check  -  like_porter server good 04/09 10:20"
  })

})

try {
  mongoose.connect("mongodb+srv://Raahul_verma:vw48MlF9mMcMJL7y@cluster0.hxtq31y.mongodb.net/CrudNew?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 600000,
  })
} catch (e) {
  console.log(e)
}


import passportConfig from "./passport.js";

passportConfig(passport);


// require('./passport')(passport)

app.set('view engine', 'ejs');
try {
  app.use(
    session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({ mongooseConnection: mongoose.connection }),
    })
  )
} catch (e) {
  console.log(e)
}

app.use(passport.initialize())
app.use(passport.session())


app.get("/check", (req, res) => { res.send("___________check_result_ok_______________") })

app.get("/auth_with_google", ensureGuest, (req, res) => {
  console.log("/abc")
  res.render('login')
})

app.get("/log", ensureAuth, async (req, res) => {
  // res.send(req.user)
  var { firstName, lastName, email } = req.user
  connection.query("INSERT INTO `user`( `first_name`, `last_name`, `email`) VALUES ('" + firstName + "','" + lastName + "','" + email + "')", async (err, rows, fields) => {
    if (err) {
      //console.log("error"+err)

      if (err.code == "ER_DUP_ENTRY") {
        res.status(200).send({ "status": "200", "response": "email already exist" })
      } else {
        res.status(200).send(err)
      }
    } else {
      if (rows != '') {
        var uid = rows.insertId
        jwt.sign({ id: rows.insertId }, process.env.USER_JWT_SECRET_KEY, function (err, token) {
          //console.log(token);
          if (err) {
            //console.log(err)
          }

          // connection.query('UPDATE `users` SET `token`="'+token+'" WHERE `user_id`='+uid+'',async (err, rows, fields) => {
          //   if(err){
          //     //console.log("error"+err)
          //   }else{
          //     //console.log(["update token", rows])
          //   }
          // })

          connection.query('INSERT INTO `notification`(`actor_id`, `actor_type`, `message`, `status`) VALUES ("' + rows.insertId + '","user","welcome to nursery live please compleate your profile","unread"),("001","admin","create new user (user_id ' + rows.insertId + ')","unread")', (err, rows) => {
            if (err) {
              //console.log({ "notification": err })
            } else {
              console.log("_______notification-send__94________")
            }
          })
          res.send({ "response": "successfully created", "user_id": rows, "user_email": rows.insertId, "token": token, "redirect_url": "http://localhost:3000/" })
        });
      }
    }
  })
  // res.redirect("http://localhost:3000/")

  // res.render('index',{userinfo:req.user})
})



app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/log')
  }
)

app.get('/auth/logout', (req, res) => {
  // req.logout()
  // res.redirect('/')
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/auth_with_google');
  });
})


function startServer() {
  connection
  app.listen(7777, () => {
    console.log(`server is running at ${process.env.SERVERPORT}`);
  });
}


function checkServerStatus() {
  return new Promise((resolve, reject) => {
    connection.query('SELECT 1', (error) => {
      if (error) {
        console.error('Error executing database query:', error);
        reject(false); // Server status is false in case of database error
      } else {
        resolve(true); // Server status is true if the database query is successful
      }
    });
  });
}
function monitorServer() {
  const interval = setInterval(() => {
    const serverStatus = checkServerStatus(); // Function to check the server's status
    // console.log("checkServerStatus--if--get--false--means--server--is--good-----result = " + !serverStatus)
    // console.log()
    if (!serverStatus) {
      console.log('Server crashed or encountered an error. Restarting...');
      clearInterval(interval);
      startServer();
      monitorServer(); // Restart the monitoring process
    }
  }, 1000); // Adjust the interval as per your requirements
}
startServer();
monitorServer()



