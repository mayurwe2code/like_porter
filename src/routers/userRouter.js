import express from "express";
import {
  add_user,
  delete_restore_user,
  getalluser,
  update_user,
  user_search,
  user_signup,
  user_otp_verify,
  user_login,
  user_details,
  change_user_password,
  user_forgate_password,
  user_forgate_password_update,
  set_notification_token,
  update_user_address,
  social_login
} from "../controllers/userController.js";
import { auth_user, fetch_user, admin_auth } from '../../middleware/auth.js'
import multer from "multer"

// const upload = multer({ dest: "/home/we2code/Desktop/nursery_proj/nursery_live/public/product_images/user_profile" });

// const multerFilter = (req, file, cb) => {
//   if (file.mimetype.split("/")[1] === "pdf") {
//     cb(null, true);
//   } else {
//     cb(new Error("Not a PDF File!!"), false);
//   }
// };

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/user_profile/");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${file.fieldname}${Date.now()}.${ext}`);
  },
});

const upload = multer({
  storage: multerStorage,
  // fileFilter: multerFilter,
});


const userRouter = express.Router();

userRouter.post("/add_user", add_user);
userRouter.get("/all_user", getalluser);
userRouter.get("/user_search", user_search);

userRouter.post("/user_signup", user_signup);
userRouter.post("/user_otp_verify", user_otp_verify);
userRouter.post("/user_login", user_login);
// userRouter.post("/user_profile_update", user_profile_update);
userRouter.put("/update_user", auth_user, upload.single("image"), update_user);
userRouter.put("/delete_restore_user", admin_auth, delete_restore_user);
userRouter.post("/user_search", admin_auth, user_search);
userRouter.get("/user_details", auth_user, user_details);
userRouter.post("/change_user_password", change_user_password);
userRouter.post("/user_forgate_password", user_forgate_password);
userRouter.post("/user_forgate_password_update", auth_user, user_forgate_password_update);
userRouter.put("/set_notification_token", auth_user, set_notification_token);
userRouter.put("/update_user_address", auth_user, update_user_address);
userRouter.post("/social_login", social_login);

// userRouter.put("/select_address", auth_user, select_address);
// userRouter.post("/admin_login", admin_login);
export default userRouter;