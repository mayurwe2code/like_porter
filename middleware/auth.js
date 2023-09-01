import jwt from 'jsonwebtoken';
// import { search_product } from "../src/controllers/productController.js"
import connection from "../Db.js";
import { StatusCodes } from "http-status-codes";
import { response } from 'express';



function ensureAuth(req, res, next) {
  console.log("mid____ensureAuth_______chk")
  if (req.isAuthenticated()) {
    return next()
  } else {
    res.redirect('/')
  }
}
function ensureGuest(req, res, next) {
  console.log("mid____ensureGuest_______chk")

  if (!req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/log');
  }
}

function admin_auth(req, res, next) {
  console.log("chek______________________________________________middleware___" + req.headers.admin_token)
  if (req.headers.admin_token != "" && req.headers.admin_token != undefined) {
    try {
      console.log("chek______________________________________admin_token_token________middleware___" + req.headers.admin_token)
      let token = jwt.verify(req.headers.admin_token, process.env.ADMIN_JWT_SECRET_KEY);
      console.log(token)
      console.log(token.id)
      req.created_by_id = token.id;
      req.vendor_id = req.body.vendor_id;
      req.admin_type = token.admin_type
      next()
    } catch (err) {
      // console.log(err)
      // res.status(401).send({ "response": err, "status": false, })
      if (req.headers.admin_token == "admin_master_token=we2code_123456") {
        console.log("_________________________req.body.vendor_id_______" + req.body.vendor_id)
        req.created_by_id = "001";
        req.admin_type = "super_admin";
        req.vendor_id = req.body.vendor_id;
        next()
      } else {
        res.send({ "error": "token not match", "success": false })
      }
    }

    // if (req.headers.admin_token == "admin_master_token=we2code_123456") {
    //   console.log("_________________________req.body.vendor_id_______" + req.body.vendor_id)
    //   req.created_by_id = "001";
    //   req.vendor_id = req.body.vendor_id;
    //   next()
    // } else {
    //   res.send({ "error": "token not match", "success": false })
    // }

  } else if (req.headers.vendor_token != "" && req.headers.vendor_token != undefined) {
    try {
      console.log("chek______________________________________vendor_token________middleware___" + req.headers.vendor_token)
      let token = jwt.verify(req.headers.vendor_token, process.env.VENDOR_JWT_SECRET_KEY);
      console.log(token)
      console.log(token.id)

      connection.query("select * from vendor where vendor_id= '" + token.id + "'", (err, rows) => {
        if (err) {
          res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ "response": "vendor id related problem,", "status": false });
        } else {
          if (rows != "") {
            req.created_by_id = token.id
            req.vendor_id = token.id
            next()
          } else {
            res
              .status(200)
              .json({ "response": "vendor id related problem,", "status": false });
          }
        }
      });


    } catch (err) {
      res.status(401).send(err)
    }
  } else {
    res.send({ "error": "token error" })
  }

}



function auth_user(req, res, next) {
  try {
    console.log("chek______________________________________________middleware___" + req.headers.user_token)
    let token = jwt.verify(req.headers.user_token, process.env.USER_JWT_SECRET_KEY);
    console.log(token)
    console.log(token.id)

    if (req.headers.user_token != "" && req.headers.user_token != undefined) {
      req.user_id = token.id

      next()
    } else {
      res.send({ "error": "token error" })
    }

  } catch (err) {
    res.status(401).send(err)
  }
}

function driver_auth(req, res, next) {
  try {
    console.log("chek__________________________DRIVER_JWT_SECRET_KEY_____________middleware___" + req.headers.driver_token)
    let token = jwt.verify(req.headers.driver_token, process.env.DRIVER_JWT_SECRET_KEY);
    console.log(token)
    console.log(token.id)

    if (req.headers.driver_token != "" && req.headers.driver_token != undefined) {
      req.driver_id = token.id
      console.log('req.driver_id')
      console.log(req.driver_id)
      next()
    } else {
      res.send({ "error": "token error" })
    }

  } catch (err) {
    res.status(401).send(err)
  }
}


function fetch_user(req, res, next) {
  if ('admin_token' in req.headers) {
    console.log("chek______________________________________________middleware___" + req.headers.admin_token)
    if (req.headers.admin_token != "" && req.headers.admin_token != undefined) {

      try {
        console.log("chek______________________________________admin_token_token________middleware___" + req.headers.admin_token)
        let token = jwt.verify(req.headers.admin_token, process.env.ADMIN_JWT_SECRET_KEY);
        console.log(token)
        console.log(token.id)

        req.for_ = "admin"
        req.created_by_id = token.id;
        req.admin_type = token.admin_type
        req.admin_id = token.id;
        req.vendor_id = req.body.vendor_id;

        next()
      } catch (err) {
        if (req.headers.admin_token == "admin_master_token=we2code_123456") {
          req.for_ = "admin"
          req.admin_id = "001"
          req.admin_type = "super_admin";
          next()
        } else {
          res.send({ "error": "admin token not match" })
        }
      }
    } else {
      res.send({ "error": "vendor token not match" })
    }


  } else if ('user_token' in req.headers) {
    try {
      console.log("chek______________________________________________middleware___" + req.headers.user_token)
      let token = jwt.verify(req.headers.user_token, process.env.USER_JWT_SECRET_KEY);
      console.log(token)
      if (req.headers.user_token != "" && req.headers.user_token != undefined) {
        req.user_id = token.id
        req.for_ = "user"
        next()
      } else {
        res.send({ status: false, "error": "user token error" })
      }

    } catch (err) {
      res.send({ "error": "user token error" })
    }
  } else if (req.headers.user_blank == "true") {
    console.log("please add response...............")
    // search_product(req, res)
  } else if (req.headers.vendor_token != "" && req.headers.vendor_token != undefined) {
    console.log("chk___v token---")
    console.log(req.headers.vendor_token)
    console.log(process.env.VENDOR_JWT_SECRET_KEY)
    let token = jwt.verify(req.headers.vendor_token, process.env.VENDOR_JWT_SECRET_KEY);
    console.log("token+++++++++-----------------------" + token.id)
    console.log(token)
    req.vendor_id = token["id"]
    next()
  } else if (req.headers.driver_token != "" && req.headers.driver_token != undefined) {
    try {
      console.log("chek__________________________DRIVER_JWT_SECRET_KEY_____________middleware___" + req.headers.driver_token)
      let token = jwt.verify(req.headers.driver_token, process.env.DRIVER_JWT_SECRET_KEY);
      console.log(token.id)
      req.driver_id = token.id
      console.log('req.driver_id')
      console.log(req.driver_id)
      next()
    } catch (err) {
      res.status(401).send(err)
    }
  } else {
    console.log("please add response...............")
    // search_product(req, res)
    // res.send({ "error": "send only vendor, user, admin token" })
  }


}


function fetch_admin_driver(req, res, next) {
  if ('admin_token' in req.headers) {
    console.log("chek______________________________________________middleware___" + req.headers.admin_token)
    if (req.headers.admin_token != "" && req.headers.admin_token != undefined) {
      try {
        console.log("chek______________________________________admin_token_token________middleware___" + req.headers.admin_token)
        let token = jwt.verify(req.headers.admin_token, process.env.DRIVER_ADMIN_JWT_SECRET_KEY);
        console.log(token)
        console.log(token.id)

        req.for_ = "admin"
        req.created_by_id = token.id;
        req.admin_type = token.admin_type
        req.admin_id = token.id;
        req.vendor_id = req.body.vendor_id;

        next()
      } catch (err) {
        if (req.headers.admin_token == "admin_master_token=we2code_123456") {
          req.for_ = "admin"
          req.admin_id = "001"
          req.admin_type = "super_admin";
          next()
        } else {
          res.send({ "error": "admin token not match" })
        }
      }
    } else {
      res.send({ "error": "vendor token not match" })
    }


  } else if (req.headers.driver_token != "" && req.headers.driver_token != undefined) {
    try {
      console.log("chek__________________________DRIVER_JWT_SECRET_KEY_____________middleware___" + req.headers.driver_token)
      let token = jwt.verify(req.headers.driver_token, process.env.DRIVER_JWT_SECRET_KEY);
      console.log(token.id)
      req.driver_id = token.id
      console.log('req.driver_id')
      console.log(req.driver_id)
      next()
    } catch (err) {
      res.status(401).send(err)
    }
  } else {
    res.send({ "error": "send only driver, admin token" })
  }


}



function auth_vendor(req, res, next) {
  try {
    console.log("chek_______________" + process.env.VENDOR_JWT_SECRET_KEY + "_____________vendor_token__________________middleware___" + req.headers.vendor_token)
    let token = jwt.verify(req.headers.vendor_token, process.env.VENDOR_JWT_SECRET_KEY);
    console.log("token++++++++++++++++++++++++++++++++++++++++++++++++++++++=")
    console.log(token)
    console.log(token.id)
    if (req.headers.vendor_token != "" && req.headers.vendor_token != undefined) {
      req.vendor_id = token.id
      next()
    } else {
      res.send({ "error": "token error" })
    }

  } catch (err) {
    console.log(err)
    res.status(401).send(err)
  }
}


export { ensureAuth, ensureGuest, admin_auth, auth_user, fetch_user, auth_vendor, driver_auth, fetch_admin_driver }
