import connection from "../../Db.js";
import { StatusCodes } from "http-status-codes";
import nodemailer from "nodemailer"
import jwt from 'jsonwebtoken'

export async function add_user(req, res) {
  var {
    first_name,
    last_name,
    email,
    password,
    phone_no,
    pincode,
    city,
    address,
    alternate_address,
    is_deleted,
  } = req.body;

  connection.query(
    "insert into user  ( `first_name`, `last_name`, `email`,`password`,`phone_no`,`pincode`,`city`,`address`,`alternate_address`,`is_deleted`) VALUES('" +
    first_name +
    "', '" +
    last_name +
    "', '" +
    email +
    "','" +
    password +
    "', '" +
    phone_no +
    "', '" +
    pincode +
    "', '" +
    city +
    "', '" +
    address +
    "','" +
    alternate_address +
    "', '" +
    is_deleted +
    "') ",
    (err, rows) => {
      if (err) {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "something went wrong" });
      } else {
        res.status(StatusCodes.OK).json({ message: "user added successfully", "status": true });
      }
    }
  );
}

export async function getalluser(req, res) {
  connection.query("select * from user", (err, rows) => {
    if (err) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "something went wrong", "status": false });
    } else {
      res.status(StatusCodes.OK).json(rows);
    }
  });
}

export async function user_details(req, res) {
  connection.query("select * from user where id= '" + req.user_id + "'", (err, rows) => {
    if (err) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "something went wrong", "status": false });
    } else {
      res.status(StatusCodes.OK).json(rows);
    }
  });
}

export async function update_user(req, res) {
  var {
    first_name,
    last_name,
    phone_no,
    pincode,
    city,
    address,
    alternate_address,
  } = req.body;
  let srt_user = ""
  console.log(req.file)
  if (req.file == undefined || req.file == '') {
    var image = "no image"
    srt_user = "update user  set `first_name`= '" +
      first_name +
      "' , `last_name`='" +
      last_name +
      "', `phone_no` ='" +
      phone_no +
      "', `pincode` ='" +
      pincode +
      "', `city`='" +
      city +
      "', `address`='" +
      address +
      "', `alternate_address`='" +
      alternate_address +
      "'  where id ='" + req.user_id + "'"
  } else {
    var image = req.protocol + "://" + req.headers.host + "/user_profile/" + req.file.filename;
    //console.log(image)
    srt_user = "update user  set `first_name`= '" +
      first_name +
      "' , `last_name`='" +
      last_name +
      "', `phone_no` ='" +
      phone_no +
      "', `pincode` ='" +
      pincode +
      "', `city`='" +
      city +
      "', `address`='" +
      address +
      "', `alternate_address`='" +
      alternate_address +
      "' , `image` = '" + image + "' where id ='" + req.user_id + "'"
  }
  console.log(req.user_id)
  connection.query(srt_user, (err, rows) => {


    if (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "status": false });
    } else {
      res.status(StatusCodes.OK).json({ message: "updated user successfully", "status": true });
    }
  }
  );
}

export async function delete_restore_user(req, res) {
  var { user_id, is_delete } = req.body

  if (user_id != "" && is_delete != "") {
    connection.query("update user  set `is_deleted`='" + is_delete + "' where id ='" + user_id + "'",
      (err, rows) => {
        if (err) {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "status": false });
        } else {
          res.status(StatusCodes.OK).json({ message: "updated user successfully", "status": true });
        }
      }
    );
  } else {
    res.status(StatusCodes.OK).json({ message: "fill all inputs", "status": false });
  }

}

export async function user_search(req, res) {
  var { search, id } = req.body;
  if (search == "" && id == "") {

    connection.query("select * from user where 1", (err, rows) => {
      if (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ "response": "find error", "status": false });
      } else {
        res.status(StatusCodes.OK).json(rows);
      }
    });
  } else {
    var search_string = "";
    if (search != "") {
      search_string += ' (`first_name` LIKE  "%' + search + '%" OR `email` LIKE "%' + search + '%") AND '
    }
    if (id != "") {
      search_string += ' id = "' + id + '" AND  '
    }

    search_string = search_string.substring(0, search_string.length - 5)
    console.log(search_string)
    connection.query(
      "select * from user where" + search_string + "",
      (err, rows) => {
        if (err) {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ "response": "find error", "status": false });
        } else {
          res.status(StatusCodes.OK).json(rows);
        }
      }
    );

  }
}

export function user_signup(req, res) {
  console.log("user_signup")
  if (req.body.email != "" && req.body.password != "") {
    let u_email = req.body.email.trim()
    let u_password = req.body.password.trim()
    let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z]{2,4})+$/;
    console.log("__" + u_email + "__")
    if (regex.test(u_email)) {

      connection.query("DELETE FROM user_auth_by_otp WHERE email = '" + u_email + "'",
        (err, rows) => {

          connection.query("SELECT * FROM user WHERE email = '" + u_email + "'",
            (err, rows) => {
              if (err) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
              } else {
                console.log(rows)
                if (rows != "") {
                  res.status(200).send({ "res_code": "002", "status": "ok", "response": "email already exists, please use logIn way", "status": false })
                } else {
                  console.log("false")
                  const OTP = Math.floor(100000 + Math.random() * 900000);

                  connection.query('INSERT INTO `user_auth_by_otp` (`email`, `otp`, `user_password`) VALUES ("' + u_email + '","' + OTP + '","' + u_password + '")', (err, rows, fields) => {
                    if (err) {
                      if (err.code == "ER_DUP_ENTRY") {
                        res.status(200).send({ "res_code": "002", "status": "ok", "response": "email already exist, check your mail or try after sometime", "status": false })
                      } else {
                        res.status(200).send({ "res_code": "003", "status": "error", "response": "error", "status": false })
                      }
                    } else {
                      if (rows != '') {
                        const mail_configs = {
                          from: 'rahul.verma.we2code@gmail.com',
                          to: u_email,
                          subject: 'Nursery_live one time password',
                          text: "use otp within 60 sec.",
                          html: "<h1>your one time password " + OTP + " <h1/>"
                        }
                        nodemailer.createTransport({
                          service: 'gmail',
                          auth: {
                            user: "rahul.verma.we2code@gmail.com",
                            pass: "sfbmekwihdamgxia",
                          }
                        })
                          .sendMail(mail_configs, (err) => {
                            if (err) {
                              console.log(err)
                              res.status(200).send({ "response": "not send email service error", "status": false })
                              return //console.log({ "email_error": err });
                            } else {
                              res.status(200).send({ "res_code": "001", "status": "ok", "response": "send otp on your mail", "otp": OTP, "expire_time": 180 })
                              return { "send_mail_status": "send successfully", "status": true, "expire_time": 180 };
                            }
                          })
                        setTimeout(function () {
                          connection.query('DELETE FROM `user_auth_by_otp` WHERE `id` = "' + rows.insertId + '"', (err, rows, fields) => {
                            if (err) {
                              console.log("err____________________232")
                              console.log({ "response": "find error", "status": false })
                            } else {
                              console.log("delete__________________234")
                              console.log(rows)
                            }
                          })
                        }, 60000 * 3)
                      } else {
                        console.log("Not insert in otp in database")
                      }

                    }
                  })
                }
              }
            }
          );
        })
    } else {
      res.status(200).send({ "response": "email formate is not valid", "status": false })
    }

  } else {
    console.log("please fill mail brfore submit")
    res.status(200).send({ "response": " brfore submit, please fill mail address", "status": false })
  }

}



export function user_otp_verify(req, res) {
  console.log("user_login")
  let user_email = req.body.email.trim()
  let user_otp = req.body.otp.trim()
  if (req.body.email != "" && req.body.otp != "") {
    console.log('SELECT * FROM `user_auth_by_otp` WHERE  email = "' + user_email + '"')
    connection.query('SELECT * FROM `user_auth_by_otp` WHERE email = "' + user_email + '"', (err, rows, fields) => {
      if (err) {
        console.log("err____________________267")
        console.log(err)
        res.status(200).send({ "response": "find error", "status": false })
      } else {
        console.log("_rows_________________271")
        console.log(rows)
        if (rows != "") {
          if (user_otp == rows[0].otp) {

            connection.query("insert into user  ( `email`,`password`) VALUES('" + user_email + "','" + rows[0].user_password + "') ",
              (err, rows) => {
                if (err) {
                  console.log(err)

                  if (err.code == "ER_DUP_ENTRY") {
                    connection.query("SELECT * FROM user WHERE email = '" + user_email + "' ",
                      (err, rows) => {
                        if (err) {
                          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ "response": "something went wrong", "status": false });
                        } else {
                          if (rows != "") {
                            console.log("___________________________________________________284_chkkkkkkkkkkkkkkk=============")
                            console.log(rows)
                            jwt.sign({ id: rows[0].id }, process.env.USER_JWT_SECRET_KEY, function (err, token) {
                              connection.query("DELETE FROM user_auth_by_otp WHERE  email = '" + user_email + "'",
                                (err, rows) => { })
                              res.status(200).json({ "success": true, "token": token, "user_details": rows });
                            })

                          } else {
                            res.status(200).json({ "success": false, "token": "" });
                          }
                        }
                      })
                  } else {
                    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ "response": "something went wrong", "status": false });
                  }

                } else {
                  let uid = rows.insertId
                  jwt.sign({ id: rows.insertId }, process.env.USER_JWT_SECRET_KEY, function (err, token) {
                    //console.log(token);
                    if (err) {
                      //console.log(err)
                    }
                    connection.query("DELETE FROM user_auth_by_otp WHERE email = '" + user_email + "'",
                      (err, rows) => { })
                    connection.query('INSERT INTO `notification`(`actor_id`, `actor_type`, `message`, `status`) VALUES ("' + rows.insertId + '","user","welcome to nursery live please compleate your profile","unread"),("001","admin","create new user (user_id ' + rows.insertId + ')","unread")', (err, rows) => {
                      if (err) {
                        //console.log({ "notification": err })
                      } else {
                        console.log("_______notification-send__94________")
                      }
                    })
                    res.send({ "status": true, "response": "successfully created your account", "user_id": rows.insertId, "token": token, "redirect_url": "http://localhost:3000/" })
                  })



                  // res.status(StatusCodes.OK).json({ message: "user added successfully" });
                }
              }
            );


          } else {
            res.status(200).send({ "response": "Enter valid OTP", "status": false })
          }
        } else {
          res.status(200).send({ "response": "Enter valid Email Id", "status": false })
        }
      }
    })
  } else {
    res.status(200).send({ "response": "please fill all inputs", "status": false })
  }
}


export function user_login(req, res) {

  let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z]{2,4})+$/;
  let user_email = req.body.email
  let password = req.body.password

  console.log("user_login__________________________333")
  console.log(req.body)
  console.log(user_email)
  console.log(regex.test(user_email))
  if (req.body.email != "" && req.body.password != "") {
    if (regex.test(user_email)) {
      console.log("true")
      connection.query('SELECT * FROM user WHERE email ="' + user_email + '"', (err, rows) => {
        if (err) {
          console.log(err)
          res.status(200).send({ "response": "login error", "status": false })
        } else {
          console.log(rows)
          if (rows != "") {
            if (rows[0].password === password) {

              if (rows[0].is_deleted == '0') {
                console.log("rows[0].user_id_______________324___")
                console.log(rows[0].id)
                console.log(process.env.USER_JWT_SECRET_KEY)

                jwt.sign({ id: rows[0].id }, process.env.USER_JWT_SECRET_KEY, function (err, token) {
                  //console.log(token);
                  if (err) {
                    //console.log(err)
                  }
                  let { id, first_name, last_name, email, phone_no, pincode, status, city, address, alternate_address, user_type, image } = rows[0]
                  if (rows[0].first_name != "" && rows[0].last_name != "" && rows[0].email != "" && rows[0].password != "" && rows[0].phone_no != "" && rows[0].pincode != "" && rows[0].city != "" && rows[0].address != "" && rows[0].alternate_address != "") {
                    res.send({ "status": true, "res_code": "001", "response": "successfully login", "token": token, "redirect_url": "http://localhost:3000/", "complete_profile": true, "user_detaile": { id, first_name, last_name, email, phone_no, pincode, city, address, alternate_address, status, user_type, image } })
                  } else {
                    res.send({ "status": true, "res_code": "001", "response": "successfully login", "token": token, "redirect_url": "http://localhost:3000/", "complete_profile": false, "user_detaile": { id, first_name, last_name, email, phone_no, pincode, city, address, alternate_address, status, user_type, image } })
                  }
                })

              } else {
                res.status(200).json({ "message": "your account is blocked", "status": false })
              }
            } else {
              res.status(200).json({ "message": "Password is incorrect", "status": false })
            }


          } else {
            res.status(200).send({ "status": false, "res_code": "003", "response": "email not exists" })
          }
        }
      })
    } else {
      res.status(200).send({ "status": false, "res_code": "003", "response": "email formate no match" })

    }
  } else {
    console.log("please fill all inputs")
    res.status(200).send({ "status": false, "res_code": "003", "response": "please fill all inputs" })
  }
}

export function change_user_password(req, res) {
  console.log("change_user_password")
  var { old_password, new_password, email } = req.body
  let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z]{2,4})+$/;
  if (regex.test(email.trim())) {
    if (old_password != "" && new_password != "" && email != "") {
      connection.query("update user  set `password`='" + new_password.trim() + "' where  email ='" + email.trim() + "' AND BINARY password = '" + old_password.trim() + "'",
        (err, rows) => {
          if (err) {
            console.log(err)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ response: "something went wrong", "success": false });
          } else {
            if (rows.affectedRows == '1') {
              res.status(StatusCodes.OK).json({ response: "password updated ", "success": true });
            } else {
              res.status(StatusCodes.OK).json({ response: "password not update", "success": false });
            }
          }
        }
      );
    } else {
      res.status(StatusCodes.OK).json({ message: "fill all inputs", "status": false });
    }
  } else {
    res.status(StatusCodes.OK).json({ message: "email formate not valid", "status": false });
  }
}


export function user_forgate_password(req, res) {
  let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z]{2,4})+$/;


  if (regex.test(req.body.email.trim()) && req.body.email != "") {
    const OTP = Math.floor(100000 + Math.random() * 900000);

    connection.query("select * from user where email = '" + req.body.email.trim() + "'", (err, rows) => {
      if (err) {
        console.log(err)
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ "response": "something went wrong", "status": false });
      } else {
        if (rows != "") {

          connection.query('INSERT INTO `user_auth_by_otp` (`email`, `otp`) VALUES ("' + req.body.email.trim() + '","' + OTP + '")', (err, rows, fields) => {
            if (err) {
              if (err.code == "ER_DUP_ENTRY") {
                res.status(200).send({ "status": "200", "response": "email already exist, check your mail or try after sometime", "status": false })
              } else {
                res.status(200).send({ "error": "find error ", "status": false })
              }
            } else {
              if (rows != '') {
                const mail_configs = {
                  from: 'rahul.verma.we2code@gmail.com',
                  to: req.body.email,
                  subject: 'Nursery_live one time password',
                  text: "use otp within 60 sec.",
                  html: "<h1>your one time password " + OTP + " <h1/>"
                }
                nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                    user: "rahul.verma.we2code@gmail.com",
                    pass: "sfbmekwihdamgxia",
                  }
                })
                  .sendMail(mail_configs, (err) => {
                    if (err) {
                      res.status(200).send({ "response": "not send email service error", "status": false })
                      return //console.log({ "email_error": err });
                    } else {
                      res.status(200).send({ "response": "send otp on your mail", "otp": OTP, "status": true, "expire_time": 180 })
                      return { "send_mail_status": "send successfully", "expire_time": 180 };
                    }
                  })
                setTimeout(function () {
                  connection.query('DELETE FROM `user_auth_by_otp` WHERE `id` = "' + rows.insertId + '"', (err, rows, fields) => {
                    if (err) {
                      console.log("err____________________232")
                      console.log(err)
                    } else {
                      console.log("delete__________________234")
                      console.log(rows)
                    }
                  })
                }, 60000 * 3)
              } else {
                console.log("Not insert in otp in database")
              }

            }
          })


        } else {
          res
            .status(200)
            .json({ "response": " eamil not exist", "status": false });
        }
      }
    })


  } else {
    res.status(200).send({ "response": "cheack eamil foramate", "status": false })
  }

}


// export function admin_login(req, res) {
//   let admin_email_ar = ["mayur.we2code@gmail.com", "ashish.we2code@gmail.com", "chetan.barod.we2code@gmail.com", "raj.we2code@gmail.com", "rahul.verma.we2code@gmail.com"]
//   let admin_psw = "we2code1234"
//   let { email, password } = req.body
//   if (email !== "" && password !== "") {
//     if (admin_email_ar.includes(email) && password === admin_psw) {
//       res.status(200).send({ "response": "login successfull", "admin_token": "admin_master_token=we2code_123456", "status": true, "user_type": "admin", "admin_id": "001" })
//     } else {
//       console.log("credintial invalid")
//       res.status(200).send({ "response": "credentials invalid", "status": false })

//     }
//   } else {
//     console.log("fill email and password")
//     res.status(200).send({ "response": "fill email and password", "status": false })

//   }
// }

export function user_forgate_password_update(req, res) {
  console.log("__________________user_forgate_password_update")
  let psw = req.body.password.trim()
  console.log(psw)
  connection.query(
    "update user  set `password`= '" + psw + "' where id ='" + req.user_id + "'",
    (err, rows) => {
      if (err) {
        console.log(err)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ "response": "something went wrong", "success": false });
      } else {
        console.log(rows.affectedRows)
        if (rows.affectedRows == '1') { res.status(StatusCodes.OK).json({ "response": "update your password successfully", "success": true, "user_detaile": rows }); } else { res.status(StatusCodes.OK).json({ "response": "update opration feild ", "success": false }); }

      }
    }
  );
}

export function set_notification_token(req, res) {
  console.log("__________________not_token__update")
  let not_token = req.body.token.trim()
  console.log(not_token)
  connection.query(
    "update user  set `token_for_notification`= '" + not_token + "' where id ='" + req.user_id + "'",
    (err, rows) => {
      if (err) {
        console.log(err)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ "response": "something went wrong", "success": false });
      } else {
        console.log(rows.affectedRows)
        if (rows.affectedRows == '1') { res.status(StatusCodes.OK).json({ "response": "update your token successfully", "success": true }); } else { res.status(StatusCodes.OK).json({ "response": "update opration feild ", "success": false }); }

      }
    }
  );
}

export async function update_user_address(req, res) {
  let { alternate_address } = req.body
  if (alternate_address) {
    let srt_user = "update user  set  `alternate_address`='" + alternate_address + "' WHERE user_id = '" + req.user_id + "'"
    connection.query(srt_user, (err, rows) => {
      if (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "status": false });
      } else {
        res.status(StatusCodes.OK).json({ message: "updated user successfully", "status": true });
      }
    }
    );
  } else {
    res.status(StatusCodes.OK).json({ message: "please feel input", "status": false });
  }


}

// export function select_address (req,res){
//   console.log("select_address-------------------------")
//   connection.query('SELECT * FROM user WHERE email ="' + user_email + '" AND password ="' + password + '"', (err, rows) => {
//     if (err) {
//       console.log(err)
//       res.status(200).send({ "response": "login error", "status": false })
//     } else {
// }

export function social_login(req, res) {
  console.log("singal_signup----------")
  var email = req.body.email;
  if (email) {
    console.log("INSERT INTO `user`(`email`) VALUES ('" + email + "')")
    connection.query("INSERT INTO `user`(`email`) VALUES ('" + email + "')", (err, rows) => {
      if (err) {
        console.log(err)
        if (err.code == "ER_DUP_ENTRY") {
          // res.status(200).send({ "response": "email already exist", "status": false })
          connection.query('SELECT * FROM user WHERE email ="' + email + '"', (err, rows) => {
            if (err) {
              console.log(err)
              res.status(200).send({ "response": "login error", "status": false })
            } else {
              console.log(rows)
              if (rows != "") {

                console.log("rows[0].user_id_______________324___")
                console.log(rows[0].id)
                console.log(process.env.USER_JWT_SECRET_KEY)

                jwt.sign({ id: rows[0].id }, process.env.USER_JWT_SECRET_KEY, function (err, token) {
                  //console.log(token);
                  if (err) {
                    //console.log(err)
                  }
                  let { id, first_name, last_name, email, phone_no, pincode, status, city, address, alternate_address, user_type, image } = rows[0]
                  if (rows[0].first_name != "" && rows[0].last_name != "" && rows[0].email != "" && rows[0].password != "" && rows[0].phone_no != "" && rows[0].pincode != "" && rows[0].city != "" && rows[0].address != "" && rows[0].alternate_address != "") {
                    res.send({ "status": true, "res_code": "001", "response": "successfully login", "token": token, "redirect_url": "http://localhost:3000/", "complete_profile": true, "user_detaile": { id, first_name, last_name, email, phone_no, pincode, city, address, alternate_address, status, user_type, image } })
                  } else {
                    res.send({ "status": true, "res_code": "001", "response": "successfully login", "token": token, "redirect_url": "http://localhost:3000/", "complete_profile": false, "user_detaile": { id, first_name, last_name, email, phone_no, pincode, city, address, alternate_address, status, user_type, image } })
                  }
                })
              } else {
                res.status(200).send({ "status": false, "res_code": "003", "response": "creadintial not match" })
              }
            }
          })

        } else {
          res.status(200).send({ "response": "error", "status": false })
        }
      } else {
        let uid = rows.insertId
        jwt.sign({ id: rows.insertId }, process.env.USER_JWT_SECRET_KEY, function (err, token) {
          //console.log(token);
          if (err) {
            //console.log(err)
          }
          connection.query('INSERT INTO `notification`(`actor_id`, `actor_type`, `message`, `status`) VALUES ("' + rows.insertId + '","user","welcome to nursery live please compleate your profile","unread"),("001","admin","create new user (user_id ' + rows.insertId + ')","unread")', (err, rows) => {
            if (err) {
              //console.log({ "notification": err })
            } else {
              console.log("_______notification-send__94________")
            }
          })
          res.send({ "status": true, "response": "successfully created your account", "user_id": rows.insertId, "token": token, "redirect_url": "http://localhost:3000/" })
        })
        // res.status(StatusCodes.OK).json({ message: "user added successfully", "status": true });
      }
    })
  } else {
    res.status(StatusCodes.OK).json({ message: "please fill all inputs", "status": false });
  }


}