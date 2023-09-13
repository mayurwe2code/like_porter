import connection from "../../Db.js";
import { StatusCodes } from "http-status-codes";
import nodemailer from "nodemailer"
import jwt from 'jsonwebtoken'


export function sign_by_driver(req, res) {

    console.log("user_signup")
    if (req.body.email != "" && req.body.password != "") {
        let u_email = req.body.email.trim()
        let u_password = req.body.password.trim()
        let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z]{2,4})+$/;
        console.log("__" + u_email + "__")
        if (regex.test(u_email)) {
            connection.query("SELECT * FROM delivery_man WHERE email = '" + u_email + "'",
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
        } else {
            res.status(200).send({ "response": "email formate is not valid", "status": false })
        }
    } else {
        console.log("please fill mail brfore submit")
        res.status(200).send({ "response": " brfore submit, please fill mail address", "status": false })
    }
}
export function driver_otp_verify(req, res) {
    console.log("driver_otp_verify")
    let user_email = req.body.email.trim()
    let user_otp = req.body.otp.trim()
    if (req.body.email != "" && req.body.otp != "") {
        console.log('SELECT * FROM `user_auth_by_otp` WHERE email = "' + user_email + '" AND otp = "' + user_otp + '"')
        connection.query('SELECT * FROM `user_auth_by_otp` WHERE email = "' + user_email + '" AND otp = "' + user_otp + '"', (err, rows, fields) => {
            if (err) {
                console.log("err____________________267")
                console.log(err)
                res.status(200).send({ "response": "find error", "status": false })
            } else {
                console.log("_rows_________________271")
                console.log(rows)
                if (rows != "") {
                    if (user_email == rows[0].email && user_otp == rows[0].otp) {

                        connection.query("insert into delivery_man ( `email`,`password`) VALUES('" + user_email + "','" + rows[0].user_password + "') ",
                            (err, rows) => {
                                if (err) {
                                    console.log(err)

                                    if (err.code == "ER_DUP_ENTRY") {
                                        connection.query("SELECT * FROM delivery_man WHERE email = '" + user_email + "' ",
                                            (err, rows) => {
                                                if (err) {
                                                    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ "response": "something went wrong", "status": false });
                                                } else {
                                                    if (rows != "") {
                                                        console.log("___________________________________________________284_chkkkkkkkkkkkkkkk=============")
                                                        console.log(rows)
                                                        jwt.sign({ id: rows[0].driver_id }, process.env.DRIVER_JWT_SECRET_KEY, function (err, token) {
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
                                    jwt.sign({ id: rows.insertId }, process.env.DRIVER_JWT_SECRET_KEY, function (err, token) {
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
                                    // res.status(StatusCodes.OK).json({ message: "user added successfully" });
                                }
                            }
                        );


                    } else {
                        console.log("not match ________-278")
                    }
                } else {
                    res.status(200).send({ "response": "not matched, credential issue", "status": false })
                }
            }
        })
    } else {
        res.status(200).send({ "response": "please fill all inputs", "status": false })
    }
}

export function driver_login(req, res) {

    let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z]{2,4})+$/;
    let user_email = req.body.email
    let password = req.body.password

    console.log("driver_login__________________________333")
    console.log(req.body)
    console.log(user_email)
    console.log(regex.test(user_email))
    if (req.body.email != "" && req.body.password != "") {
        if (regex.test(user_email)) {
            console.log("true")
            connection.query('SELECT * FROM delivery_man WHERE is_active = 1 AND email ="' + user_email + '"', (err, rows) => {
                if (err) {
                    console.log(err)
                    res.status(200).send({ "response": "login error", "status": false })
                } else {
                    console.log(rows)
                    if (rows != "") {
                        let password_ = rows[0]["password"]
                        let approove_by_admin = rows[0]["approove_by_admin"]

                        if (password === password_) {

                            console.log("rows[0].user_id_______________324___")
                            console.log(process.env.DRIVER_JWT_SECRET_KEY)
                            if (approove_by_admin == '0') {
                                res.status(200).send({ "status": false, "res_code": "005", "response": "Please wait for an admin to verify" })
                            } else {
                                jwt.sign({ id: rows[0].driver_id }, process.env.DRIVER_JWT_SECRET_KEY, function (err, token) {
                                    //console.log(token);
                                    if (err) {
                                        //console.log(err)
                                    }
                                    let check_if = []
                                    let { driver_id, driver_name, driver_last_name, date_of_birth, current_address, gender, age, contect_no, email, password, status, contect_no_is_verified, aadhar_no, licence_no, licence_issue_date, licence_validity_date, is_active, created_on, updated_on, current_latitude, current_longitude, fcm_token } = rows[0]
                                    console.log("---------------------chk-after-if------------------------")

                                    check_if.push(driver_name, driver_last_name, date_of_birth, current_address, gender, age, contect_no, email, password, aadhar_no, licence_no, licence_issue_date, licence_validity_date)

                                    if (!check_if.includes(null) && !check_if.includes("")) {
                                        console.log("---------------true-not-blank----------")
                                        res.send({ "status": true, "res_code": "001", "response": "successfully login", "token": token, "redirect_url": "http://localhost:3000/", "complete_profile": true, "user_detaile": { driver_id, driver_last_name, date_of_birth, current_address, gender, age, contect_no, email, password, status, contect_no_is_verified, aadhar_no, licence_no, licence_issue_date, licence_validity_date, is_active, created_on, updated_on, current_latitude, current_longitude, fcm_token } })
                                    } else {
                                        console.log("---------------else-blank----------")
                                        res.send({ "status": true, "res_code": "001", "response": "successfully login", "token": token, "redirect_url": "http://localhost:3000/", "complete_profile": false, "user_detaile": { driver_id, driver_last_name, date_of_birth, current_address, gender, age, contect_no, email, password, status, contect_no_is_verified, aadhar_no, licence_no, licence_issue_date, licence_validity_date, is_active, created_on, updated_on, current_latitude, current_longitude, fcm_token } })
                                    }
                                })
                            }
                        } else {
                            res.status(200).send({ "status": false, "res_code": "004", "response": "password not match" })
                        }

                    } else {
                        res.status(200).send({ "status": false, "res_code": "003", "response": "email not match" })
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

export function driver_forgate_password(req, res) {
    let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z]{2,4})+$/;

    if (regex.test(req.body.email.trim()) && req.body.email != "") {
        const OTP = Math.floor(100000 + Math.random() * 900000);

        connection.query("select * from delivery_man where BINARY email = '" + req.body.email.trim() + "'", (err, rows) => {
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

export function driver_forgate_password_update(req, res) {
    console.log("________________delivery_man_forgate_password_update--------------------" + req.driver_token)
    let psw = req.body.password.trim()
    console.log(psw)
    console.log("update delivery_man  set `password`= '" + psw + "' where driver_id ='" + req.driver_id + "'",)

    connection.query(
        "update delivery_man  set `password`= '" + psw + "' where driver_id ='" + req.driver_id + "'",
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

export function set_driver_notification_token(req, res) {
    console.log("__________________not_token__update")
    let not_token = req.body.token.trim()
    console.log(not_token)
    connection.query(
        "update delivery_man  set `fcm_token`= '" + not_token + "' where driver_id ='" + req.driver_id + "'",
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


export async function driver_details(req, res) {
    console.log("========================friver id test")
    console.log(req.driver_id)
    // return false
    connection.query("SELECT * FROM delivery_man LEFT JOIN vehicle_detaile ON delivery_man.driver_id = vehicle_detaile.driver_id where delivery_man.driver_id= '" + req.driver_id + "'", (err, rows) => {
        if (err) {
            console.log(err)
            res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ message: "something went wrong", "status": false });
        } else {
            res.status(StatusCodes.OK).json(rows);
        }
    });
}
// export async function only_driver_list(req, res) {
//     let query_ = "select * from delivery_man where"
//     for (let k in req.body) {
//         if (req.body[k] != "") {
//             query_ += ` ${k} = '${req.body[k]}' AND  `
//         }
//     }
//     query_ = query_.substring(0, query_.length - 5)
//     console.log(query_)
//     connection.query(query_, (err, rows) => {
//         if (err) {
//             res
//                 .status(StatusCodes.INTERNAL_SERVER_ERROR)
//                 .json({ message: "something went wrong", "status": false });
//         } else {
//             res.status(StatusCodes.OK).json(rows);
//         }
//     });
// }
export async function only_driver_list(req, res) {
    let query_ = "select delivery_man.*, vehicle_id,vehicle_add_by,company_name,model,color,registration_no_of_vehicle,chassis_number,vehicle_owner_name,make_of_vehicle,vehicle_registerd_by,puc_expiration_date,insurance_expiration_date,registration_expiration_date,registration,puc_certificate,insurance, vehicle_detaile.is_active AS vehicle_is_active from delivery_man LEFT JOIN vehicle_detaile ON vehicle_detaile.driver_id = delivery_man.driver_id where vehicle_detaile.is_active = '1' AND  "

    if (req.body.search) {
        query_ += ` driver_name LIKE '%${req.body.search}%' OR driver_last_name LIKE '%${req.body.search}%' AND  `
    }
    for (let k in req.body) {
        if (req.body[k] != "" && k != "search") {
            query_ += ` \`delivery_man\`.${k} = '${req.body[k]}' AND  `
        }
    }


    query_ = query_.substring(0, query_.length - 5)
    console.log("ck------||" + query_)
    connection.query(query_, (err, rows) => {
        if (err) {
            console.log(err)
            res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ message: "something went wrong", "status": false });
        } else {
            res.status(StatusCodes.OK).json(rows);
        }
    });
}
export async function delete_restore_driver(req, res) {
    var { driver_id, is_active, status } = req.body
    let query_ = "update delivery_man  set "
    if (driver_id != "" && is_active != "" && status != "") {
        query_ += " `is_active`='" + is_active + "' ,`status`='" + status + "' where driver_id ='" + driver_id + "'"
    } else {
        // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "please send driver id", "status": false });
        if (is_active != "") {
            query_ += " `is_active`='" + is_active + "' where driver_id ='" + driver_id + "'"
        }
        if (status != "") {
            query_ += "`status`='" + status + "' where driver_id ='" + driver_id + "'"
        }
    }
    console.log(query_)
    connection.query(query_,
        (err, rows) => {
            if (err) {
                console.log(err)
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "status": false });
            } else {
                res.status(StatusCodes.OK).json({ message: "updated user successfully", "status": true });
            }
        }
    );

}



export async function update_driver(req, res) {
    var { driver_id } = req.body;
    let srt_user = "update delivery_man  set "
    let key_chk = ["driver_name", "driver_last_name", "date_of_birth", "current_address", "gender", "age", "contect_no", "aadhar_no", "licence_no", "licence_issue_date", "licence_validity_date", "is_active", "current_latitude", "current_longitude", "fcm_token"]

    let rb_length = Object.keys(req.body).length;
    let count_ = 1;
    for (let j in req.body) {
        if (key_chk.includes(j)) {
            srt_user += ` ${j} = '${req.body[j]}', `
            if (rb_length == count_) {
                srt_user = srt_user.substring(0, srt_user.length - 2)
            }
            count_++
        }
    }
    console.log("req.files--------------------------")
    console.log(req.files)
    for (let k in req.files) {
        srt_user += ` ,${k} = '${req.protocol + "://" + req.headers.host}/driver_profile/${req.files[k][0]["filename"]}'`
    }

    if (req.headers.admin_token != "" && req.headers.admin_token != undefined) {
        srt_user += " where driver_id ='" + driver_id + "'"
    } else if (req.headers.driver_token != "" && req.headers.driver_token != undefined) {
        srt_user += " where driver_id ='" + req.driver_id + "' AND is_active = '1'"
    } else {
        srt_user = ""
    }

    console.log("----srt_user--------" + srt_user)
    connection.query(srt_user, (err, rows) => {
        if (err) {
            console.log(err)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "status": false });
        } else {
            console.log(rows)
            res.status(StatusCodes.OK).json({ message: "updated user successfully", "status": true });
        }
    }
    );
}

export function add_working_area(req, res) {
    let { city, area_name, pin_code, driver_log, driver_lat, driver_id } = req.body
    let query_ = ""
    if (req.headers.admin_token != "" && req.headers.admin_token != undefined) {
        if (!driver_lat && !driver_log) { driver_lat = 0; driver_log = 0 }
        query_ += "INSERT INTO `driver_working_area`(`driver_id`,`city`, `area_name`, `pin_code`, `driver_log`, `driver_lat`) VALUES (" + driver_id + ",'" + city + "','" + area_name + "'," + pin_code + "," + driver_log + "," + driver_lat + ")"
    }
    if (req.headers.driver_token != "" && req.headers.driver_token != undefined) {
        if (!driver_lat && !driver_log) { driver_lat = 0; driver_log = 0 }
        query_ += "INSERT INTO `driver_working_area`( `driver_id`,`city`, `area_name`, `pin_code`, `driver_log`, `driver_lat`) VALUES ('" + req.driver_id + "','" + city + "','" + area_name + "','" + pin_code + "','" + driver_log + "','" + driver_lat + "')"
    }
    console.log(query_)
    connection.query(query_, (err, rows) => {
        if (err) {
            console.log(err)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "status": false });
        } else {
            res.status(StatusCodes.OK).json({ message: "added yuor working area successfully", "status": true });
        }
    }
    );
}

export function chouse_driver_for_delivery(req, res) {
    let { order_id, delivery_lat, delivery_log, nearest_of_delivery_pin } = req.body
    let query_ = ""
    if (nearest_of_delivery_pin != "" && nearest_of_delivery_pin != undefined && nearest_of_delivery_pin != null) {
        query_ += "SELECT *, ( 3959 * acos( cos( radians(" + delivery_lat + ") ) * cos( radians( driver_lat ) ) * cos( radians( driver_log ) - radians(" + delivery_log + ") ) + sin( radians(" + delivery_lat + ") ) * sin( radians( driver_lat ) ) ) ) AS distance FROM driver_working_area  LEFT JOIN delivery_man ON driver_working_area.driver_id = delivery_man.driver_id  HAVING distance < " + nearest_of_delivery_pin + " "
    } else {
        //if you want only show this driver , when selected working area
        // query_ += "SELECT * FROM driver_working_area  LEFT JOIN delivery_man ON driver_working_area.driver_id = delivery_man.driver_id "
        query_ += "SELECT delivery_man.*,vehicle_detaile.model FROM delivery_man,vehicle_detaile where delivery_man.driver_id = vehicle_detaile.driver_id GROUP BY delivery_man.driver_id "
    }
    console.log(query_)
    connection.query(query_, (err, rows) => {
        if (err) {
            console.log(err)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "status": false });
        } else {
            res.status(StatusCodes.OK).json(rows);
        }
    }
    );
}

export function register_your_vehicle(req, res) {
    let { company_name, model, color, registration_no_of_vehicle, chassis_number, vehicle_owner_name, puc_expiration_date, insurance_expiration_date, registration_expiration_date, vehicle_type } = req.body

    // let puc_certificate = insurance = registration = null;
    let str_fields = "";
    let srt_values = "";
    for (let k in req.files) {
        str_fields += ` ,${k}`
        srt_values += ` ,"${req.protocol + "://" + req.headers.host}/driver_profile/${req.files[k][0]["filename"]}"`
    }
    let srt_user = ""
    if (req.headers.admin_token != "" && req.headers.admin_token != undefined) {
        srt_user = "INSERT INTO `vehicle_detaile`(`vehicle_add_by`,`company_name`, `model`, `color`, `registration_no_of_vehicle`, `chassis_number`, `vehicle_owner_name`, `puc_expiration_date`, `insurance_expiration_date`, `registration_expiration_date`,`vehicle_type`" + str_fields + ") VALUES('admin','" + company_name + "', '" + model + "', '" + color + "', '" + registration_no_of_vehicle + "', '" + chassis_number + "', '" + vehicle_owner_name + "','" + puc_expiration_date + "','" + insurance_expiration_date + "','" + registration_expiration_date + "','" + vehicle_type + "'" + srt_values + ")"

    } else if (req.headers.driver_token != "" && req.headers.driver_token != undefined) {
        connection.query("UPDATE `vehicle_detaile` SET `is_active` = '0' WHERE `vehicle_detaile`.`vehicle_id` = '" + req.driver_id + "'", (err, rows) => { });

        srt_user = "INSERT INTO `vehicle_detaile`(`vehicle_add_by`,`driver_id`, `company_name`, `model`, `color`, `registration_no_of_vehicle`, `chassis_number`, `vehicle_owner_name`, `puc_expiration_date`, `insurance_expiration_date`, `registration_expiration_date`,`vehicle_type`" + str_fields + ") VALUES( 'driver','" + req.driver_id + "', '" + company_name + "', '" + model + "', '" + color + "', '" + registration_no_of_vehicle + "', '" + chassis_number + "', '" + vehicle_owner_name + "','" + puc_expiration_date + "','" + insurance_expiration_date + "','" + registration_expiration_date + "','" + vehicle_type + "'" + srt_values + ")"

    } else {
        srt_user = ""
    }
    console.log("srt_user====================================================srt_user")
    console.log(srt_user)
    // return false
    connection.query(srt_user, (err, rows) => {
        if (err) {
            console.log(err)
            if (err["errno"] == '1062') {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err["sqlMessage"], "status": false });
            } else {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "status": false });
            }
        } else {
            res.status(StatusCodes.OK).json({ message: "vehicle registration successfull", "status": true });
        }
    }
    );
}


export function add_order_by_user(req, res) {
    let { order_id, order_delivery_confirm_code, pickup_location_address, pickup_city, pickup_area_pin, pickup_location_contect, pickup_area_lat, pickup_area_long, given_pickup_time_by_user, drop_location_address, drop_city, drop_area_pin, drop_location_contect, drop_lat, drop_long, pickup_order_confirm_code } = req.body

    order_id = Math.floor(100000 + Math.random() * 900000);
    pickup_order_confirm_code = Math.floor(100000 + Math.random() * 900000);
    order_delivery_confirm_code = Math.floor(100000 + Math.random() * 900000);

    connection.query("INSERT INTO `order_delivery_details`(`order_id`,`last_modification_by`, `last_modification_by_id`, `order_delivery_confirm_code`,`pickup_location_address`, `pickup_city`, `pickup_area_pin`, `pickup_location_contect`, `pickup_area_lat`, `pickup_area_long`, `given_pickup_time_by_user`, `drop_location_address`, `drop_city`, `drop_area_pin`, `drop_location_contect`, `drop_lat`, `drop_long`,`pickup_order_confirm_code`) VALUES ('" + order_id + "','user','" + req.user_id + "','" + order_delivery_confirm_code + "','" + pickup_location_address + "','" + pickup_city + "','" + pickup_area_pin + "','" + pickup_location_contect + "','" + pickup_area_lat + "','" + pickup_area_long + "','" + given_pickup_time_by_user + "','" + drop_location_address + "','" + drop_city + "','" + drop_area_pin + "','" + drop_location_contect + "','" + drop_lat + "','" + drop_long + "','" + pickup_order_confirm_code + "')", (err, rows) => {
        if (err) {
            console.log(err)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "status": false });
        } else {
            connection.query("SELECT *, 6371 * ACOS( COS(RADIANS(" + pickup_area_lat + ")) * COS(RADIANS(current_latitude)) * COS(RADIANS(current_longitude ) - RADIANS(" + pickup_area_long + ")) + SIN(RADIANS(" + pickup_area_lat + ")) * SIN(RADIANS(current_latitude)) ) AS distance FROM driver_and_vehicle_view WHERE vehicle_is_active = '1' ORDER BY distance LIMIT 1", (err, rows) => {
                if (err) {
                    console.log(err)
                    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "driver not available find some error", "status": false });
                } else {
                    if (rows.length) {
                        let { driver_id, vehicle_id } = rows[0]
                        console.log(driver_id)
                        connection.query("UPDATE `order_delivery_details` SET `driver_id`='" + driver_id + "',`vehicle_id`='" + vehicle_id + "' WHERE 1", (err, rows) => {
                            if (err) {
                                console.log(err)
                                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "status": false });
                            } else {

                                connection.query("INSERT INTO `order_status_given_by_driver`(`order_id`, `driver_id`) VALUES (" + order_id + "," + driver_id + ")", (err, rows) => { })

                                res.status(200).json({ message: "Your order has been placed please wait for the driver to accept", "status": true, order_id });
                            }
                        }
                        );
                    } else {
                        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "driver not available", "status": false })
                    }
                }
            })

        }
    });

}

export function order_asign_by_delivery_admin(req, res) {
    let { order_id, driver_id } = req.body
    console.log({ order_id, driver_id })
    connection.query("SELECT * FROM `vehicle_detaile` WHERE driver_id = " + driver_id + " AND is_active='1'", (err, rows) => {
        if (err) {
            console.log("error vehicle_detaile=========" + err)
        } else {

            if (rows != "") {
                console.log("--ok--------------vehicle_detaile====ok=====")
                console.log(rows[0]["vehicle_id"])
                connection.query("UPDATE `order_delivery_details` SET `driver_id`='" + driver_id + "', `vehicle_id`='" + rows[0]["vehicle_id"] + "',`order_asign_by`='" + req.created_by_id + "',`last_modification_by`='delivery_admin',`last_modification_by_id`='" + req.created_by_id + "' WHERE order_id = " + order_id + "", (err, rows) => {
                    if (err) {
                        console.log(err)
                        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "status": false });
                    } else {
                        res.status(StatusCodes.OK).json(rows);
                    }
                }
                );
            } else {
                res.status(StatusCodes.OK).json({ message: "driver has no vehicle", "status": false });
            }
        }
    });
}

export function get_delivery_detaile_list(req, res) {
    let filter = "SELECT orders_details_id,order_id,order_delivery_details.driver_id,order_delivery_details.vehicle_id,order_asign_by,payment,order_status,last_modification_by,last_modification_by_id,status_comment,payment_method,order_delivery_confirm_code,created_on,updated_on,order_ready_to_asign_for_delivery_by,delivery_date,delivered_date,pickup_location_address,pickup_city,pickup_area_pin,pickup_location_contect,pickup_area_lat,pickup_area_long,given_pickup_time_by_user,given_pickup_time_by_driver,drop_location_address,drop_city,drop_area_pin,drop_location_contect,drop_lat,drop_long,given_drop_time_by_user,given_drop_time_by_driver,driver_name,driver_last_name,date_of_birth,current_address,gender,age,contect_no,email,password,status,contect_no_is_verified,aadhar_no,licence_no,licence_issue_date,licence_validity_date,delivery_man_is_active,driver_created_on,driver_updated_on,current_latitude,current_longitude,fcm_token,image,licence,aadhar_card,vehicle_add_by,company_name,model,color,registration_no_of_vehicle,chassis_number,vehicle_owner_name,make_of_vehicle,vehicle_created_on,vehicle_updated_on,vehicle_registerd_by,puc_expiration_date,insurance_expiration_date,registration_expiration_date,puc_certificate,insurance,registration,vehicle_is_active,vehicle_type FROM `order_delivery_details`,`driver_and_vehicle_view` WHERE order_delivery_details.driver_id = driver_and_vehicle_view.driver_id AND  "
    let req_obj = req.body


    if (req.body.date_from != "" && req.body.date_from != undefined && req.body.date_to != "" && req.body.date_to != undefined) {
        filter += " order_delivery_details.created_on between '" + req.body.date_from + " 00:00:00' AND '" + req.body.date_to + " 23:59:59' AND  "
    }

    for (let k in req_obj) {
        if (req_obj[k] != "" && k != "date_from" && k != "date_to") {
            filter += ` order_delivery_details.${k} = '${req_obj[k]}' AND  `
        }
    }

    if (req.headers.driver_token != "" && req.headers.driver_token != undefined) {
        filter += ` order_delivery_details.driver_id = '${req.driver_id}' AND  `
    }

    filter = filter.substring(0, filter.length - 5);
    console.log(filter);
    console.log(filter + "GROUP BY order_delivery_details.order_id");
    console.log("filter==============================================");

    console.log(filter + "GROUP BY order_delivery_details.order_id")
    connection.query(filter + "GROUP BY order_delivery_details.order_id", (err, rows) => {
        if (err) {
            console.log(err)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "status": false });
        } else {
            res.status(StatusCodes.OK).json({ "status": true, rows });
        }
    }
    );
}

export function delivery_area_list(req, res) {
    //old_code
    let qyery_ = "SELECT *,(SELECT driver_name FROM `delivery_man` WHERE delivery_man.driver_id = driver_working_area.driver_id ) AS driver_name FROM `driver_working_area` WHERE"

    // let qyery_ = "SELECT driver_working_area.*, driver_name FROM `driver_working_area`,`delivery_man` WHERE driver_working_area.driver_id = delivery_man.driver_id GROUP BY driver_working_area.driver_id"
    console.log(req.query)
    for (let k in req.query) {
        if (req.query[k] != "") { qyery_ += ` ${k} = '${req.query[k]}' AND  ` }
    }
    if (req.headers.driver_token != "" && req.headers.driver_token != undefined) {
        qyery_ += ` driver_id = '${req.driver_id}' AND  `
    }
    qyery_ = qyery_.substring(0, qyery_.length - 5);
    console.log(qyery_)
    connection.query(qyery_, (err, rows) => {
        if (err) {
            console.log(err)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "status": false });
        } else {
            res.status(StatusCodes.OK).json(rows);
        }
    }
    );
}

export function active_deactive_area(req, res) {
    console.log(req.body)
    let query_ = "UPDATE `driver_working_area` SET "

    let { id, user_active_this_area, is_active, driver_id } = req.body
    if (user_active_this_area != undefined) {
        query_ += `user_active_this_area = '${user_active_this_area}'`
    } else if (is_active != undefined) {
        query_ += `is_active = '${is_active}'`
    } else if (driver_id != undefined) {
        query_ += `driver_id = '${driver_id}'`
    } else {
        query_ = ""
    }

    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
    console.log(query_ + " WHERE id=" + id + "")
    connection.query(query_ + " WHERE id=" + id + "", (err, rows) => {
        if (err) {
            console.log(err)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "status": false });
        } else {
            if (rows.affectedRows >= 1) {
                res.status(StatusCodes.OK).json({ message: "successfull changed working area status  ", "status": true });
            } else {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "status": false });
            }
        }
    });
}
export function change_order_detaile_status(req, res) {
    let { order_id, order_status, status_comment } = req.body

    let query_ = ""
    if (req.headers.admin_token != "" && req.headers.admin_token != undefined && req.headers.admin_token != null) {
        query_ = "UPDATE `order_delivery_details` SET `order_status`='" + order_status + "', `last_modification_by`='admin', `last_modification_by_id`='" + req.admin_id + "' WHERE order_id = '" + order_id + "'"
    }
    if (req.headers.driver_token != "" && req.headers.driver_token != undefined && req.headers.driver_token != null) {
        query_ = "UPDATE `order_delivery_details` SET `order_status`='" + order_status + "', `last_modification_by`='delivery_man', `last_modification_by_id`='" + req.driver_id + "',`status_comment`='" + req.body.status_comment + "' WHERE (order_id = '" + order_id + "' AND driver_id = '" + req.driver_id + "') AND (order_status = 'pickuped' OR order_status = 'failed_delivery_attempt' OR order_status = 'in_transit' OR order_status = 'rejected_by_driver')"
    }
    console.log(order_status)
    console.log(query_)
    connection.query(query_, (err, rows) => {
        if (err) {
            console.log(err)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "status": false });
        } else {
            if (rows.affectedRows >= 1) {
                res.status(StatusCodes.OK).json({ message: "status changed successfull", "status": true });
            } else {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "status": false });
            }
        }
    });
}

export function delivery_verify_code_match(req, res) {
    const jsDate = new Date();
    const formattedDate = jsDate.toISOString().slice(0, 19).replace('T', ' ')
    let { order_id, order_delivery_confirm_code } = req.body
    connection.query("SELECT * FROM `order_delivery_details` WHERE driver_id='" + req.driver_id + "' AND order_id='" + order_id + "' AND order_delivery_confirm_code ='" + order_delivery_confirm_code + "' ", (err, rows) => {
        if (err) {
            console.log(err)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "status": false });
        } else {
            if (rows != "") {
                connection.query("UPDATE `order_delivery_details` SET `order_status`='delivered',`delivered_date` = NOW() WHERE driver_id='" + req.driver_id + "' AND order_id='" + order_id + "' AND order_delivery_confirm_code ='" + order_delivery_confirm_code + "'", (err, rows) => {
                    console.log(err)
                })
                res.status(StatusCodes.OK).json({ message: "Confirmation  successfull", "status": true });
            } else {
                res.status(200).json({ message: "not match credintials", "status": false });
            }

            connection.query("UPDATE `order` SET `status_order`='delivered'", (err, rows) => { console.log("---" + err) })
        }
    });
}

export function driver_add_by_admin(req, res) {
    let { driver_name, driver_last_name, date_of_birth, current_address, gender, age, contect_no, email, password, aadhar_no, licence_no, licence_issue_date, licence_validity_date } = req.body

    let str_fields = "";
    let srt_values = "";
    for (let k in req.files) {
        str_fields += ` ,${k}`
        srt_values += ` ,"${req.protocol + "://" + req.headers.host}/driver_profile/${req.files[k][0]["filename"]}"`
    }

    console.log("INSERT INTO `delivery_man`(`driver_name`, `driver_last_name`, `date_of_birth`, `current_address`, `gender`, `age`, `contect_no`, `email`, `password`,`aadhar_no`, `licence_no`, `licence_issue_date`, `licence_validity_date`" + str_fields + ") VALUES ( '" + driver_name + "', '" + driver_last_name + "', '" + date_of_birth + "', '" + current_address + "', '" + gender + "', '" + age + "', '" + contect_no + "', '" + email + "', '" + password + "', '" + aadhar_no + "', '" + licence_no + "', '" + licence_issue_date + "', '" + licence_validity_date + "' " + str_fields + ")")
    connection.query("INSERT INTO `delivery_man`(`driver_name`, `driver_last_name`, `date_of_birth`, `current_address`, `gender`, `age`, `contect_no`, `email`, `password`,`aadhar_no`, `licence_no`, `licence_issue_date`, `licence_validity_date`" + str_fields + ") VALUES ( '" + driver_name + "', '" + driver_last_name + "', '" + date_of_birth + "', '" + current_address + "', '" + gender + "', '" + age + "', '" + contect_no + "', '" + email + "', '" + password + "', '" + aadhar_no + "', '" + licence_no + "', '" + licence_issue_date + "', '" + licence_validity_date + "' " + srt_values + ")", (err, rows) => {
        if (err) {
            console.log(err)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "status": false });
        } else {
            res.status(StatusCodes.OK).json(rows);
        }
    })
}

export async function order_details_for_driver(req, res) {
    const id = req.query.id;
    let resp_obj = {}
    // select order_id,user_id,vendor_id,total_order_product_quantity,total_amount  ,total_gst,total_cgst,total_sgst,total_discount,shipping_charges,payment_mode,payment_ref_id,order_date,delivery_date,discount_coupon ,discount_coupon_value from `order` where order_id ="398080" AND user_id ="35" GROUP BY order_id
    var qry_ = "";
    if (req.headers.driver_token) {
        qry_ = 'select * from `order` ,`order_delivery_details` where order_delivery_details.order_id = `order`.order_id AND order_delivery_details.order_id =  "' + id + '" AND order_delivery_details.driver_id = "' + req.driver_id + '" '
    }
    if (req.headers.delivery_admin_token) {
        qry_ = 'select * from `order` ,`order_delivery_details` where order_delivery_details.order_id = `order`.order_id AND order_delivery_details.order_id =  "' + id + '" '
    }

    connection.query(qry_,
        (err, rows) => {
            if (err) {
                console.log(err)
                res.status(StatusCodes.INSUFFICIENT_STORAGE).json(err);
            } else {
                if (rows != "") {
                    resp_obj["success"] = true
                    resp_obj["order_detaile"] = rows

                    connection.query('select * FROM order_detaile1 where order_id =' + id + '',
                        (err, rows) => {
                            if (err) {
                                res.status(StatusCodes.INSUFFICIENT_STORAGE).json(err);
                            } else {
                                resp_obj["success"] = true
                                resp_obj["order_product_detaile"] = rows;
                                res.status(StatusCodes.OK).json(resp_obj);
                            }
                        }
                    );
                } else {
                    res.status(200).json({ "success": false, "response": "not found" });
                }
            }
        }
    )
}





export function vehicle_asign_by_admin(req, res) {
    console.log(req.body)
}

export function driver_list(req, res) {
    let query_ = "SELECT * FROM `user_and_vehicle_view_1` WHERE"
    for (let k in req.body) {
        query_ += ` ${k} = '${req.body[k]}' AND  `
    }
    query_ = query_.substring(0, query_.length - 5)
    connection.query(query_, (err, rows) => {
        if (err) {
            console.log(err)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "status": false });
        } else {
            res.status(StatusCodes.OK).json(rows);
        }
    }
    );
}
export function vehicle_list(req, res) {
    let { search } = req.body
    if (req.headers.driver_token) {
        var query_ = "SELECT *,(SELECT driver_name FROM `delivery_man` WHERE delivery_man.driver_id = vehicle_detaile.driver_id) AS driver_name FROM `vehicle_detaile` WHERE driver_id = '" + req.driver_id + "' AND is_active = '1' AND  "
    }
    if (req.headers.admin_token) {
        var query_ = "SELECT *,(SELECT driver_name FROM `delivery_man` WHERE delivery_man.driver_id = vehicle_detaile.driver_id) AS driver_name FROM `vehicle_detaile` WHERE"
    }
    // let query_ = "SELECT *,(SELECT driver_name FROM `delivery_man` WHERE delivery_man.driver_id = vehicle_detaile.driver_id) AS driver_name FROM `vehicle_detaile` WHERE driver_id = "+req.driver_id+" is_active = '1' AND  "
    if (search) {
        //vehicle_owner_name,chassis_number,registration_no_of_vehicle,model,company_name
        query_ += ` vehicle_owner_name LIKE '%${search}%' OR chassis_number LIKE '%${search}%' OR registration_no_of_vehicle LIKE '%${search}%' OR model LIKE '%${search}%' OR company_name LIKE '%${search}%' AND  `
    }
    for (let k in req.body) {
        if (req.body[k] != "" && k != "search") {
            query_ += ` ${k} = '${req.body[k]}' AND  `
        }
    }
    query_ = query_.substring(0, query_.length - 5)
    console.log(query_)
    connection.query(query_, (err, rows) => {
        if (err) {
            console.log(err)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "status": false });
        } else {
            res.status(StatusCodes.OK).json(rows);
        }
    }
    );
}

export function update_your_vehicle(req, res) {
    let { vehicle_id, company_name, model, color, registration_no_of_vehicle, chassis_number, vehicle_owner_name, puc_expiration_date, insurance_expiration_date, registration_expiration_date } = req.body

    // let puc_certificate = insurance = registration = null;
    let srt_values = "";
    for (let k in req.files) {
        srt_values += `  ,${k}="${req.protocol + "://" + req.headers.host}/driver_profile/${req.files[k][0]["filename"]}"`
    }
    let srt_user = ""
    if (req.headers.admin_token != "" && req.headers.admin_token != undefined) {
        srt_user = "UPDATE `vehicle_detaile` SET `company_name`='" + company_name + "', `model`='" + model + "', `color`='" + color + "', `registration_no_of_vehicle`='" + registration_no_of_vehicle + "', `chassis_number`='" + chassis_number + "', `vehicle_owner_name`='" + vehicle_owner_name + "', `puc_expiration_date`='" + puc_expiration_date + "', `insurance_expiration_date`='" + insurance_expiration_date + "', `registration_expiration_date`='" + registration_expiration_date + "'" + srt_values + " WHERE vehicle_id ='" + vehicle_id + "'"
    } else if (req.headers.driver_token != "" && req.headers.driver_token != undefined) {
        srt_user = "UPDATE `vehicle_detaile` SET `company_name`='" + company_name + "', `model`='" + model + "', `color`='" + color + "', `registration_no_of_vehicle`='" + registration_no_of_vehicle + "', `chassis_number`='" + chassis_number + "', `vehicle_owner_name`='" + vehicle_owner_name + "', `puc_expiration_date`='" + puc_expiration_date + "', `insurance_expiration_date`='" + insurance_expiration_date + "', `registration_expiration_date`='" + registration_expiration_date + "'" + srt_values + " WHERE vehicle_id ='" + vehicle_id + "'"
    } else {
        srt_user = ""
    }
    console.log(srt_user)
    connection.query(srt_user, (err, rows) => {
        if (err) {
            console.log(err)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "status": false });
        } else {
            if (rows.affectedRows == '1') { res.status(StatusCodes.OK).json({ message: "vehicle update successfull", "status": true }) } else {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "status": false });
            }
        }
    }
    );
}

export function change_vehicle_feild(req, res) {
    let srt_user = "UPDATE `vehicle_detaile` SET"
    console.log("UPDATE `vehicle_detaile` SET")
    console.log(req.body)
    if (req.headers.driver_token && req.driver_id) {
        connection.query("UPDATE `vehicle_detaile` SET `driver_id` = '', `is_active` = '0' WHERE `vehicle_detaile`.`driver_id` = '" + req.driver_id + "' AND 	vehicle_add_by = 'admin'", (err, rows) => { });
        connection.query("UPDATE `vehicle_detaile` SET `is_active` = '0' WHERE `vehicle_detaile`.`driver_id` = '" + req.driver_id + "' AND 	vehicle_add_by = 'driver'", (err, rows) => { });
        req.body.driver_id = req.driver_id
    }

    for (let k in req.body) {
        console.log("__" + req.body[k] + "___")
        srt_user += `  ${k}="${req.body[k]}",`
    }


    srt_user = srt_user.substring(0, srt_user.length - 1)
    console.log(srt_user)
    if (req.headers.admin_token && req.body.driver_id) {
        connection.query("UPDATE `vehicle_detaile` SET `driver_id` = '', `is_active` = '0' WHERE `vehicle_detaile`.`driver_id` = '" + req.body.driver_id + "' AND 	vehicle_add_by = 'admin'", (err, rows) => { });
        connection.query("UPDATE `vehicle_detaile` SET `is_active` = '0' WHERE `vehicle_detaile`.`driver_id` = '" + req.body.driver_id + "' AND 	vehicle_add_by = 'driver'", (err, rows) => { });

        srt_user += ` where vehicle_id = '${req.body.vehicle_id}' AND vehicle_add_by = 'admin' `
    }
    if (req.headers.driver_token && req.body.driver_id) {
        srt_user += ` where vehicle_detaile.driver_id = '${req.body.driver_id}' AND vehicle_id = '${req.body.vehicle_id}' AND vehicle_add_by = 'driver' `
    }
    console.log(srt_user)

    connection.query(srt_user, (err, rows) => {
        if (err) {
            console.log(err)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "status": false });
        } else {
            if (rows.affectedRows >= 1) { res.status(StatusCodes.OK).json({ message: "vehicle feild updated successfull", "status": true }); } else {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "status": false });
            }

        }
    }
    );
}

export function reject_not_res_order(req, res) {
    console.log("reject_not_res_order---------------------")
    let { order_id, order_status, status_comment } = req.body
    if ("rejected_by_driver" == req.body.order_status || "driver_not_responsed" == req.body.order_status) {

        connection.query("SELECT * FROM `order_delivery_details` WHERE driver_id = '" + req.driver + "' AND order_id = " + order_id + "", (err, rows) => {
            if (rows.length) {
                let { pickup_area_lat, pickup_area_long } = rows[0]
                connection.query("UPDATE `order_status_given_by_driver` SET `order_id`='" + order_id + "',`driver_id`='" + req.driver_id + "',`status`='" + req.body.order_status + "' WHERE 1", (err, rows) => {
                    console.log(err)
                    connection.query("SELECT *, 6371 * ACOS( COS(RADIANS(" + pickup_area_lat + ")) * COS(RADIANS(current_latitude)) * COS(RADIANS(current_longitude ) - RADIANS(" + pickup_area_long + ")) + SIN(RADIANS(" + pickup_area_lat + ")) * SIN(RADIANS(current_latitude)) ) AS distance FROM driver_and_vehicle_view WHERE vehicle_is_active = '1' AND driver_id != (SELECT driver_id FROM order_status_given_by_driver WHERE order_id = " + order_id + " AND status = 'rejected_by_driver' ) ORDER BY distance LIMIT 1", (err, rows) => {
                        if (err) {
                            console.log(err)
                            // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "driver not available find some error", "status": false });
                        } else {
                            if (rows.length) {
                                let { driver_id, vehicle_id } = rows[0]
                                console.log(driver_id)
                                connection.query("UPDATE `order_delivery_details` SET `driver_id`='" + driver_id + "',`vehicle_id`='" + vehicle_id + "' WHERE 1", (err, rows) => {
                                    if (err) {
                                        console.log(err)
                                        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "status": false });
                                    } else {

                                        connection.query("INSERT INTO `order_status_given_by_driver`(`order_id`, `driver_id`, `status`) VALUES (" + order_id + "," + driver_id + ",'pandding')", (err, rows) => { })

                                        res.status(200).json({ message: "order rejected successfull", "status": true, order_id });
                                    }
                                }
                                );
                            } else {
                                res.status(200).json({ message: "order not rejected because driver not availabel", "status": false, order_id });
                            }
                        }
                    })

                })
            } else {
                res.status(200).send({ "status": false, "message": "order not available" })
            }
        })

    }
}

export function pickup_and_drop_otp_verify(req, res) {
    let { order_id, verify_otp, for_ } = req.body
    connection.query("SELECT * FROM `order_delivery_details`  WHERE order_id = " + order_id + " AND driver_id = '" + req.driver_id + "'", (err, rows) => {
        if (err) {
            console.log(err)
            res.status(200).send({ status: false, message: "find error" })
        } else {
            if (rows.length) {
                let { pickup_order_confirm_code, order_delivery_confirm_code } = rows[0]
                if (for_ == "pickup_order") {
                    if (pickup_order_confirm_code === verify_otp) {
                        connection.query("UPDATE `order_delivery_details` SET `order_status` = 'pickuped' , `last_modification_by`='driver' ,`last_modification_by_id`= '" + req.driver_id + "',`pickup_date` = NOW()  WHERE order_id = " + order_id + " ", (err, rows) => {
                            console.log(err)
                            res.status(200).send({ "status": true, "message": "verify_otp matched" })
                        })
                    } else {
                        res.status(200).send({ "status": false, "message": "verify_otp not match" })
                    }

                } else if (for_ == "drop_order") {
                    if (order_delivery_confirm_code === verify_otp) {
                        connection.query("UPDATE `order_delivery_details` SET `order_status` = 'delivered' , `last_modification_by`='driver' ,`last_modification_by_id`= '" + req.driver_id + "',`delivered_date` = NOW()  WHERE order_id = " + order_id + " ", (err, rows) => {
                            console.log(err)
                            res.status(200).send({ "status": true, "message": "verify_otp matched" })
                        })
                    } else {
                        res.status(200).send({ "status": false, "message": "verify_otp not match" })
                    }
                } else {
                    res.status(200).send({ "status": false, "message": "only use for_ drop_order , pickup_order" })
                }

            } else {
                res.status(200).send({ "status": false, "message": "order not found" })

            }
        }
    })
}