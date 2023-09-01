import express from "express";
import {
    admin_login,
    update_password,
    admin_forgot_password,
    update_admin,
    add_admin,
    admin_search, admin,
    delivery_admin_login,
    delivery_update_password,
    delivery_admin_forgot_password,
    delivery_update_admin,
    delivery_add_admin,
    delivery_admin_search, delivery_admin
} from "../controllers/admin_controller.js";
import { auth_user, fetch_user, fetch_admin_driver } from '../../middleware/auth.js'
const adminRouter = express.Router();
//nursery_admin-----------
adminRouter.post("/admin_login", admin_login)
adminRouter.put("/update_password", fetch_user, update_password)
adminRouter.put("/admin_forget_password", admin_forgot_password)
adminRouter.put("/update_admin", fetch_user, update_admin)
adminRouter.post("/add_admin", fetch_user, add_admin)
adminRouter.post("/admin_search", fetch_user, admin_search)
adminRouter.get("/admin", fetch_user, admin)

//delivery_admin--------------
adminRouter.post("/delivery_admin_login", delivery_admin_login)
adminRouter.put("/delivery_update_password", fetch_admin_driver, delivery_update_password)
adminRouter.put("/delivery_admin_forget_password", delivery_admin_forgot_password)
adminRouter.put("/delivery_update_admin", fetch_admin_driver, delivery_update_admin)
adminRouter.post("/delivery_add_admin", fetch_admin_driver, delivery_add_admin)
adminRouter.post("/delivery_admin_search", fetch_admin_driver, delivery_admin_search)
adminRouter.get("/delivery_admin", fetch_admin_driver, delivery_admin)
export default adminRouter;


