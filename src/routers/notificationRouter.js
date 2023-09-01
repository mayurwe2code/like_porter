import express from "express";
import {
    notification,admin_notification,add_notification,delete_notification
} from "../controllers/notification_controller.js";
import {auth_user,admin_auth,fetch_user} from '../../middleware/auth.js'

const notificationRouter = express.Router();

notificationRouter.get("/notification",auth_user, notification);
notificationRouter.post("/admin_notification",admin_auth, admin_notification);
notificationRouter.post("/add_notification",admin_auth, add_notification);
notificationRouter.put("/delete_notification",admin_auth, delete_notification);


export default notificationRouter;