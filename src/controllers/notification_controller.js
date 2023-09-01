import connection from "../../Db.js";
import { StatusCodes } from "http-status-codes";
import nodemailer  from "nodemailer"

export function notification(req,res){
console.log("______________notificationRouter")
connection.query('SELECT * FROM `notification` WHERE actor_id = "'+req.user_id+'" AND actor_type = "user" ORDER BY id DESC', (err, rows, fields) => {
    if (err) {
      //console.log("/notification" + err)
      res.status(200).send(err)
    } else {
     // res.status(200).send(rows)
      if(rows!=''){
        res.status(200).send(rows)
      connection.query('UPDATE `notification` SET `status`="read" WHERE actor_id = "'+req.user_id+'" AND actor_type = "user"', (err, rows, fields) => {
        if (err) {
          //console.log("/notification" + err)
          res.status(200).send(err)
        } else {
          console.log("update notification data update read ")
        }
      }) 
      }else{
        res.status(200).send({"response":"empty"})
      }
    }
  })
}


export function admin_notification(req,res){
    console.log("______________notificationRouter")
    var {actor_id,actor_type}=req.body

    var str_notification = 'SELECT * FROM `notification` WHERE  '
    if(actor_id!=""){
        str_notification += "actor_id = '"+actor_id+"' AND  "
    }if(actor_type!=""){
        str_notification += "actor_type = '"+actor_type+"' AND  "
    }else{
        
    }

    str_notification= str_notification.substring(0, str_notification.length-6);
console.log(str_notification+' ORDER BY id DESC')
    connection.query(str_notification+' ORDER BY id DESC', (err, rows, fields) => {
        if (err) {
          //console.log("/notification" + err)
          res.status(200).send(err)
        } else {
         // res.status(200).send(rows)
          if(rows!=''){
            res.status(200).send(rows)
        
          }else{
            res.status(200).send({"response":"empty"})
          }
        }
      })
    }
 export function add_notification(req,res){
var {actor_id, actor_type, message}=req.body
if(actor_id!=""  && actor_type!="" && message!=""){
    connection.query('INSERT INTO `notification`(`actor_id`, `actor_type`, `message`, `status`) VALUES ("'+actor_id+'","'+actor_type+'","'+message+'","unread")', (err, rows) => {
        if (err) {
            res.status(200).send({"response":"not send"})
        } else {
            res.status(200).send({"response":"notification send successfully",insert_id:rows.insert_id})
        }
      })
}else{
    res.status(200).send({"response":"please fill all fields"})
}
}

export function delete_notification(req,res){
    var {notification_id}=req.body
    if(notification_id!=""){
        connection.query('DELETE FROM `notification` WHERE id = "'+notification_id+'"', (err, rows) => {
            if (err) {
                res.status(200).send({"response":"delete opration failed"})
            } else {
                console.log(rows)
                if(rows.affectedRows=='1'){
                    res.status(200).send({"response":" delete notification successfully"})
                }else{
                    res.status(200).send({"response":"delete opration failed"})
                }
                
            }
          })
    }else{
        res.status(200).send({"response":"please fill notification id"})
    }
}