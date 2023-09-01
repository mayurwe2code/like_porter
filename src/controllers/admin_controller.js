import connection from "../../Db.js";
import bcrypt from "bcrypt"
import nodemailer from "nodemailer"
import jwt from 'jsonwebtoken'

const ADMIN_JWT_SECRET_KEY = process.env.ADMIN_JWT_SECRET_KEY
const DRIVER_ADMIN_JWT_SECRET_KEY = process.env.DRIVER_ADMIN_JWT_SECRET_KEY


async function admin_login(req, res) {

    var { admin_email, admin_password } = req.body
    console.log("==================================admin_login")
    console.log({ admin_email, admin_password })
    // const salt = await bcrypt.genSalt(10);
    // password_salt = await bcrypt.hash(admin_password, salt);
    // //console.log(password_salt)

    // const validPassword = await bcrypt.compare(admin_password,'$2b$10$81UsHRVghsW.47o7dMqiQ.DsJgTfz333wDFKTYZYQOGkJhoSEr1m6');
    // //console.log(validPassword)

    connection.query('SELECT `id`, `admin_email` , `admin_password`,`admin_type` FROM `admin_login_details`  WHERE  `admin_email` ="' + admin_email + '"', async (err, results) => {
        if (err) {
            //console.log(err)
            res.send(err)
        } else {
            if (results != '') {
                //__________bcrypt_____________________________________

                console.log("__admin-l0gin___")
                console.log(results)
                // var psw =  JSON.parse(JSON.stringify(results[0].admin_password))
                // //console.log(typeof psw)
                // const validPassword = await bcrypt.compare(admin_password,psw);
                // //console.log(validPassword)
                // validPassword ?res.send([results,{"true":true}]) : res.send("password not matched")

                //__________no_bcrypt_____________________________________
                var db_psw = results[0].admin_password
                if (db_psw === admin_password) {
                    console.log(results[0]["admin_type"])
                    jwt.sign({ id: results[0]["id"], admin_type: results[0]["admin_type"] }, ADMIN_JWT_SECRET_KEY, function (err, token) {
                        //console.log(token);
                        if (err) {
                            //console.log(err)                             
                        }
                        res.send([results, { "true": true, token }])
                    })
                } else {
                    res.send("password not matched")
                }

            } else {
                res.send("email not found")
            }

        }
    })
}

async function update_password(req, res) {

    //INSERT INTO `admin_login_details`(`admin_email`, `admin_name`, `admin_phone`, `admin_type`, `admin_password`) VALUES ('mayur.we2code@gmail.com','mayur','1234567890','1','superwe2code')
    var { admin_email, admin_password, new_admin_password } = req.body
    if (admin_email != '' && admin_password != '' && new_admin_password != '') {
        //console.log("fill all")
        connection.query('SELECT `admin_email` , `admin_password` FROM `admin_login_details`  WHERE `id` ="' + req.admin_id + '"', async (err, results) => {
            if (err) {
                //console.log(err)
                res.send(err)
            } else {
                if (results != '') {
                    //_______________________bcrypt________________

                    // //console.log("_____")
                    // var psw =  JSON.parse(JSON.stringify(results[0].admin_password))
                    // //console.log(typeof psw)
                    // const validPassword = await bcrypt.compare(admin_password,psw);
                    // //console.log(validPassword)
                    // if(validPassword) { 
                    //     const salt = await bcrypt.genSalt(10);
                    //     password_salt = await bcrypt.hash(new_admin_password, salt);
                    //     //console.log(password_salt)
                    //     connection.query('UPDATE `admin_login_details` SET `admin_password`= "'+password_salt+'" WHERE `admin_email` = "'+admin_email+'"',async (err,results)=>{
                    //         if(err){
                    //         //console.log(err)
                    //         res.send(err)
                    //         }else{
                    //             //console.log("password_updated")
                    //             res.send("password_updated")
                    //         }
                    //     })
                    // }else{
                    //      res.send("password not matched")
                    //     }

                    //_______________________ non bcrypt________________
                    var old_pswd = results[0].admin_password
                    if (old_pswd === admin_password) {
                        connection.query('UPDATE `admin_login_details` SET `admin_password`= "' + new_admin_password + '" WHERE  `admin_email` = "' + admin_email + '" AND `admin_password` = "' + old_pswd + '"', async (err, results) => {
                            if (err) {
                                //console.log(err)
                                res.send(err)
                            } else {
                                //console.log("password_updated")
                                res.send({ "response": "password_updated" })

                            }
                        })
                    } else { res.send({ "response": "password not matched" }) }


                } else {
                    res.send({ "response": "email not matched" })
                }
            }
        })
    } else {
        res.status(200).send({ "response": "please fill all input" })
    }
}

function admin_forgot_password(req, res) {
    //console.log(req.body.admin_email)
    connection.query('SELECT `admin_email`, `admin_password` FROM `admin_login_details` WHERE `admin_email` = "' + req.body.admin_email + '"', async (err, results) => {
        if (err) {
            //console.log(err)
            res.send(err)
        } else {
            if (results != '') {
                var edata = results[0].admin_email
                var old_fr_psw = JSON.parse(JSON.stringify(results[0].admin_password))
                // const salt = await bcrypt.genSalt(10);
                // deco_salt = await bcrypt.hash(saltpsw, salt);
                //console.log("________________email")
                //console.log(edata)
                const mail_configs = {
                    from: 'rahul.verma.we2code@gmail.com',
                    to: edata,
                    subject: 'nursery_live',
                    text: "your old password " + old_fr_psw
                }

                nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: "rahul.verma.we2code@gmail.com",
                        pass: "sfbmekwihdamgxia",
                    },
                })
                    .sendMail(mail_configs, (err) => {
                        if (err) {
                            return //console.log('errrr',err);
                        } else {
                            //console.log("send_password_on_your_mail")
                            return res.status(200).send({ "message": "Sent your old password on Gmail Succesfully" });
                        }
                    })




            } else {
                //console.log("invalid_mail")
                res.send({ "response": "invalid_mail" })
            }
        }
    })

}

function update_admin(req, res) {
    var { id, admin_email, admin_name, admin_phone, admin_type } = req.body
    console.log("req.body")
    if (req.admin_type == "super_admin") {
        connection.query('UPDATE `admin_login_details` SET `admin_name`="' + admin_name + '",`admin_phone`="' + admin_phone + '",`admin_type`="' + admin_type + '"  WHERE `id`=' + id + '', (err, rows, fields) => {
            if (err) {
                console.log(err)
                res.send(err)
            } else {
                //console.log("successfully_updated")
                rows.affectedRows == '1' ? res.status(201).send(rows) : res.status(200).send({ "message": "invalid input data", "status": true })
            }
        })
    } else {
        res.status(200).send({ "message": "only admin can do change", "status": false })
    }

}

async function add_admin(req, res) {
    console.log(req.admin_id)
    var { admin_email, admin_name, admin_phone, admin_type, admin_password } = req.body
    connection.query("SELECT * FROM admin_login_details WHERE admin_email = '" + admin_email + "'", (err, rows, fields) => {
        if (err) {
            res.status(200).send(err)
        } else {
            if (rows != "") {
                res.status(200).send({ "response": "email already exist" })
            } else {
                connection.query("SELECT * FROM admin_login_details WHERE id = '" + req.admin_id + "'", (err, rows, fields) => {
                    if (err) {
                        res.status(200).send(err)
                    } else {
                        if (rows[0].admin_type == 'superadmin' || rows[0].admin_type == 'super_admin') {

                            // const salt = await bcrypt.genSalt(10);
                            // co_salt = await bcrypt.hash(admin_password, salt);
                            connection.query('INSERT INTO `admin_login_details`(`admin_email`, `admin_name`, `admin_phone`, `admin_type`, `admin_password`) VALUES ("' + admin_email + '", "' + admin_name + '", "' + admin_phone + '", "' + admin_type + '","' + admin_password + '")', (err, rows, fields) => {
                                if (err) {
                                    //console.log(err)
                                    res.send(err)
                                } else {
                                    //console.log("successfully_updated")
                                    res.send(rows)
                                }
                            })
                        } else {
                            res.status(200).send({ "response": "only add by super admin" })
                        }
                    }
                })
            }
        }
    })

}

function admin_search(req, res) {

    var { admin_name, admin_type } = req.body
    if (admin_name == '' && admin_type == '') {
        connection.query('SELECT * FROM `admin_login_details` WHERE  1', (err, rows, fields) => {
            if (err) {
                //console.log("/admin_login_details_error"+err)
                res.send(err)
            } else {
                res.send(rows)
            }
        })
    } else {
        if (admin_name != '' && admin_type == '') {
            connection.query('SELECT * FROM `admin_login_details` WHERE `admin_name` LIKE "%' + admin_name + '%" ', (err, rows, fields) => {
                if (err) {
                    //console.log("/admin_login_details_error"+err)
                    res.send(err)
                } else {
                    res.send(rows)
                }
            })
        }

        if (admin_type != '' && admin_name == '') {
            connection.query('SELECT * FROM `admin_login_details` WHERE `admin_type` = "' + admin_type + '" ', (err, rows, fields) => {
                if (err) {
                    //console.log("/admin_login_details_error"+err)
                    res.send(err)
                } else {
                    res.send(rows)
                }
            })
        }
    }
    if (admin_type != '' && admin_name != '') {
        connection.query('SELECT * FROM `admin_login_details` WHERE  `admin_name` LIKE "%' + admin_name + '%"  AND`admin_type` = "' + admin_type + '"', (err, rows, fields) => {
            if (err) {
                //console.log("/admin_login_details_error"+err)
                res.status(200).send(err)
            } else {
                res.status(200).send(rows)
            }
        })
    }


}

function admin(req, res) {
    if (req.scrt === "a2d3m6i4n6") {
        if (req.query.id == 'all') {
            connection.query('SELECT * FROM admin_login_details ORDER BY id DESC ', (err, rows, fields) => {
                if (err) {
                    res.send(err)
                } else {
                    res.status(200).send(rows)
                }
            })
        } else {
            connection.query('SELECT * FROM admin_login_details WHERE id =' + req.admin_id + ' ', (err, rows, fields) => {
                if (err) {
                    //console.log("/category_error"+err)
                    res.status(200).send(err)
                } else {
                    ////console.log("_____")
                    res.status(200).send(rows)
                }
            })
        }
    } else {
        res.status(200).send({ "response": "token error" })
    }

}


// delivery_admin-------------------
async function delivery_admin_login(req, res) {

    var { admin_email, admin_password } = req.body
    console.log("==================================admin_login")
    console.log({ admin_email, admin_password })
    // const salt = await bcrypt.genSalt(10);
    // password_salt = await bcrypt.hash(admin_password, salt);
    // //console.log(password_salt)

    // const validPassword = await bcrypt.compare(admin_password,'$2b$10$81UsHRVghsW.47o7dMqiQ.DsJgTfz333wDFKTYZYQOGkJhoSEr1m6');
    // //console.log(validPassword)

    connection.query('SELECT `id`, `admin_email` , `admin_password`,`admin_type` FROM `delivery_admin_login_details`  WHERE `admin_email` ="' + admin_email + '"', async (err, results) => {
        if (err) {
            //console.log(err)
            res.send(err)
        } else {
            if (results != '') {
                //__________bcrypt_____________________________________

                console.log("__admin-l0gin___")
                console.log(results)
                // var psw =  JSON.parse(JSON.stringify(results[0].admin_password))
                // //console.log(typeof psw)
                // const validPassword = await bcrypt.compare(admin_password,psw);
                // //console.log(validPassword)
                // validPassword ?res.send([results,{"true":true}]) : res.send("password not matched")

                //__________no_bcrypt_____________________________________
                var db_psw = results[0].admin_password
                if (db_psw === admin_password) {
                    console.log(results[0]["admin_type"])
                    jwt.sign({ id: results[0]["id"], admin_type: results[0]["admin_type"] }, DRIVER_ADMIN_JWT_SECRET_KEY, function (err, token) {
                        //console.log(token);
                        if (err) {
                            //console.log(err)                             
                        }
                        res.send([results, { "true": true, token }])
                    })
                } else {
                    res.send("password not matched")
                }

            } else {
                res.send("email not found")
            }

        }
    })
}

async function delivery_update_password(req, res) {

    //INSERT INTO `delivery_admin_login_details`(`admin_email`, `admin_name`, `admin_phone`, `admin_type`, `admin_password`) VALUES ('mayur.we2code@gmail.com','mayur','1234567890','1','superwe2code')
    var { admin_email, admin_password, new_admin_password } = req.body
    if (admin_email != '' && admin_password != '' && new_admin_password != '') {
        //console.log("fill all")
        connection.query('SELECT `admin_email` , `admin_password` FROM `delivery_admin_login_details`  WHERE `id` ="' + req.admin_id + '"', async (err, results) => {
            if (err) {
                //console.log(err)
                res.send(err)
            } else {
                if (results != '') {
                    //_______________________bcrypt________________

                    // //console.log("_____")
                    // var psw =  JSON.parse(JSON.stringify(results[0].admin_password))
                    // //console.log(typeof psw)
                    // const validPassword = await bcrypt.compare(admin_password,psw);
                    // //console.log(validPassword)
                    // if(validPassword) { 
                    //     const salt = await bcrypt.genSalt(10);
                    //     password_salt = await bcrypt.hash(new_admin_password, salt);
                    //     //console.log(password_salt)
                    //     connection.query('UPDATE `delivery_admin_login_details` SET `admin_password`= "'+password_salt+'" WHERE `admin_email` = "'+admin_email+'"',async (err,results)=>{
                    //         if(err){
                    //         //console.log(err)
                    //         res.send(err)
                    //         }else{
                    //             //console.log("password_updated")
                    //             res.send("password_updated")
                    //         }
                    //     })
                    // }else{
                    //      res.send("password not matched")
                    //     }

                    //_______________________ non bcrypt________________
                    var old_pswd = results[0].admin_password
                    if (old_pswd === admin_password) {
                        connection.query('UPDATE `delivery_admin_login_details` SET `admin_password`= "' + new_admin_password + '" WHERE `admin_email` = "' + admin_email + '" AND `admin_password` = "' + old_pswd + '"', async (err, results) => {
                            if (err) {
                                //console.log(err)
                                res.send(err)
                            } else {
                                //console.log("password_updated")
                                res.send({ "response": "password_updated" })

                            }
                        })
                    } else { res.send({ "response": "password not matched" }) }


                } else {
                    res.send({ "response": "email not matched" })
                }
            }
        })
    } else {
        res.status(200).send({ "response": "please fill all input" })
    }
}

function delivery_admin_forgot_password(req, res) {
    //console.log(req.body.admin_email)
    connection.query('SELECT `admin_email`, `admin_password` FROM `delivery_admin_login_details`  WHERE `admin_email` = "' + req.body.admin_email + '"', async (err, results) => {
        if (err) {
            //console.log(err)
            res.send(err)
        } else {
            if (results != '') {
                var edata = results[0].admin_email
                var old_fr_psw = JSON.parse(JSON.stringify(results[0].admin_password))
                // const salt = await bcrypt.genSalt(10);
                // deco_salt = await bcrypt.hash(saltpsw, salt);
                //console.log("________________email")
                //console.log(edata)
                const mail_configs = {
                    from: 'rahul.verma.we2code@gmail.com',
                    to: edata,
                    subject: 'nursery_live',
                    text: "your old password " + old_fr_psw
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
                            return //console.log('errrr',err);
                        } else {
                            //console.log("send_password_on_your_mail")
                            return res.status(200).send({ "message": "Sent your old password on Gmail Succesfully" });
                        }
                    })




            } else {
                //console.log("invalid_mail")
                res.send({ "response": "invalid_mail" })
            }
        }
    })

}

function delivery_update_admin(req, res) {
    var { id, admin_email, admin_name, admin_phone, admin_type } = req.body
    console.log("req.body")
    if (req.admin_type == "super_admin") {
        connection.query('UPDATE `delivery_admin_login_details` SET `admin_name`="' + admin_name + '",`admin_phone`="' + admin_phone + '",`admin_type`="' + admin_type + '"  WHERE `id`=' + id + '', (err, rows, fields) => {
            if (err) {
                console.log(err)
                res.send(err)
            } else {
                //console.log("successfully_updated")
                rows.affectedRows == '1' ? res.status(201).send(rows) : res.status(200).send({ "message": "invalid input data", "status": true })
            }
        })
    } else {
        res.status(200).send({ "message": "only admin can do change", "status": false })
    }

}

async function delivery_add_admin(req, res) {
    console.log(req.admin_id)
    var { admin_email, admin_name, admin_phone, admin_type, admin_password } = req.body
    connection.query("SELECT * FROM delivery_admin_login_details WHERE admin_email = '" + admin_email + "'", (err, rows, fields) => {
        if (err) {
            res.status(200).send(err)
        } else {
            if (rows != "") {
                res.status(200).send({ "response": "email already exist" })
            } else {
                connection.query("SELECT * FROM delivery_admin_login_details WHERE id = '" + req.admin_id + "'", (err, rows, fields) => {
                    if (err) {
                        res.status(200).send(err)
                    } else {
                        if (rows[0].admin_type == 'superadmin' || rows[0].admin_type == 'super_admin') {

                            // const salt = await bcrypt.genSalt(10);
                            // co_salt = await bcrypt.hash(admin_password, salt);
                            connection.query('INSERT INTO `delivery_admin_login_details`(`admin_email`, `admin_name`, `admin_phone`, `admin_type`, `admin_password`) VALUES ("' + admin_email + '", "' + admin_name + '", "' + admin_phone + '", "' + admin_type + '","' + admin_password + '")', (err, rows, fields) => {
                                if (err) {
                                    //console.log(err)
                                    res.send(err)
                                } else {
                                    //console.log("successfully_updated")
                                    res.send(rows)
                                }
                            })
                        } else {
                            res.status(200).send({ "response": "only add by super admin" })
                        }
                    }
                })
            }
        }
    })

}

function delivery_admin_search(req, res) {

    var { admin_name, admin_type } = req.body
    if (admin_name == '' && admin_type == '') {
        connection.query('SELECT * FROM `delivery_admin_login_details` WHERE  1', (err, rows, fields) => {
            if (err) {
                //console.log("/delivery_admin_login_details_error"+err)
                res.send(err)
            } else {
                res.send(rows)
            }
        })
    } else {
        if (admin_name != '' && admin_type == '') {
            connection.query('SELECT * FROM `delivery_admin_login_details` WHERE `admin_name` LIKE "%' + admin_name + '%" ', (err, rows, fields) => {
                if (err) {
                    //console.log("/delivery_admin_login_details_error"+err)
                    res.send(err)
                } else {
                    res.send(rows)
                }
            })
        }

        if (admin_type != '' && admin_name == '') {
            connection.query('SELECT * FROM `delivery_admin_login_details` WHERE `admin_type` = "' + admin_type + '" ', (err, rows, fields) => {
                if (err) {
                    //console.log("/delivery_admin_login_details_error"+err)
                    res.send(err)
                } else {
                    res.send(rows)
                }
            })
        }
    }
    if (admin_type != '' && admin_name != '') {
        connection.query('SELECT * FROM `delivery_admin_login_details` WHERE  `admin_name` LIKE "%' + admin_name + '%"  AND`admin_type` = "' + admin_type + '"', (err, rows, fields) => {
            if (err) {
                //console.log("/delivery_admin_login_details_error"+err)
                res.status(200).send(err)
            } else {
                res.status(200).send(rows)
            }
        })
    }


}

function delivery_admin(req, res) {
    if (req.scrt === "a2d3m6i4n6") {
        if (req.query.id == 'all') {
            connection.query('SELECT * FROM delivery_admin_login_details ORDER BY id DESC ', (err, rows, fields) => {
                if (err) {
                    res.send(err)
                } else {
                    res.status(200).send(rows)
                }
            })
        } else {
            connection.query('SELECT * FROM delivery_admin_login_details WHERE id =' + req.admin_id + ' ', (err, rows, fields) => {
                if (err) {
                    //console.log("/category_error"+err)
                    res.status(200).send(err)
                } else {
                    ////console.log("_____")
                    res.status(200).send(rows)
                }
            })
        }
    } else {
        res.status(200).send({ "response": "token error" })
    }

}


export {
    admin_login, update_password, admin_forgot_password, update_admin, add_admin, admin_search, admin,
    delivery_admin_login, delivery_update_password, delivery_admin_forgot_password, delivery_update_admin, delivery_add_admin, delivery_admin_search, delivery_admin
};
