
import express from "express";
import { driver_auth, admin_auth, fetch_user, fetch_admin_driver } from "../../middleware/auth.js"
import {
    sign_by_driver, driver_otp_verify, driver_login, driver_forgate_password, driver_forgate_password_update, set_driver_notification_token, driver_details, delete_restore_driver, update_driver, add_working_area, chouse_driver_for_delivery, register_your_vehicle, order_asign, get_delivery_detaile_list, delivery_area_list, active_deactive_area, change_order_detaile_status, delivery_verify_code_match, driver_add_by_admin, vehicle_asign_by_admin, driver_list, order_details_for_driver, vehicle_list, only_driver_list, update_your_vehicle, change_vehicle_feild, order_asign_by_delivery_admin
} from "../controllers/delivery_controller.js";
import multer from "multer"

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "public/driver_profile/");
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split("/")[1];
//         cb(null, `${file.fieldname}${Date.now()}.${ext}`);
//     },
// });

// const upload = multer({
//     storage: multerStorage,
//     // fileFilter: multerFilter,
// });

//---------------------------------------------------------------------------------------------------------------------------------

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'public/driver_profile/');
    },
    filename: function (req, file, callback) {
        console.log(file);
        callback(null, file.fieldname + '-' + Date.now() + file.originalname);
    }
});

const upload = multer({ storage: storage });

const delivery_router = express.Router();
delivery_router.post("/sign_by_driver", sign_by_driver);
delivery_router.post("/driver_otp_verify", driver_otp_verify);
delivery_router.post("/driver_login", driver_login);
delivery_router.post("/driver_forgate_password", driver_forgate_password);
delivery_router.post("/driver_forgate_password_update", driver_auth, driver_forgate_password_update);
delivery_router.put("/set_driver_notification_token", driver_auth, set_driver_notification_token);
delivery_router.get("/driver_details", fetch_admin_driver, driver_details);
delivery_router.put("/delete_restore_driver", fetch_admin_driver, delete_restore_driver);
delivery_router.put("/update_driver", fetch_admin_driver, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'licence', maxCount: 1 }, { name: 'aadhar_card', maxCount: 1 }]), update_driver);
delivery_router.post("/driver_add_by_admin", upload.fields([{ name: 'image', maxCount: 1 }, { name: 'licence', maxCount: 1 }, { name: 'aadhar_card', maxCount: 1 }]), driver_add_by_admin);
delivery_router.get("/order_details_for_driver", fetch_admin_driver, order_details_for_driver);
delivery_router.post("/vehicle_list", fetch_admin_driver, vehicle_list);
delivery_router.post("/driver_list", driver_list);
delivery_router.post("/only_driver_list", only_driver_list);
delivery_router.post("/add_working_area", fetch_admin_driver, add_working_area);
delivery_router.post("/chouse_driver_for_delivery", fetch_admin_driver, chouse_driver_for_delivery);
delivery_router.post("/register_your_vehicle", fetch_admin_driver, upload.fields([{ name: 'puc_certificate', maxCount: 1 }, { name: 'insurance', maxCount: 1 }, { name: 'registration', maxCount: 1 }]), register_your_vehicle);
delivery_router.post("/update_your_vehicle", fetch_admin_driver, upload.fields([{ name: 'puc_certificate', maxCount: 1 }, { name: 'insurance', maxCount: 1 }, { name: 'registration', maxCount: 1 }]), update_your_vehicle);
delivery_router.post("/order_asign", admin_auth, order_asign);
delivery_router.post("/get_delivery_detaile_list", fetch_admin_driver, get_delivery_detaile_list);
delivery_router.post("/get_delivery_detaile_list_for_nursery_admin", admin_auth, get_delivery_detaile_list);
delivery_router.get("/delivery_area_list", fetch_admin_driver, delivery_area_list);
delivery_router.put("/active_deactive_area", fetch_admin_driver, active_deactive_area);
delivery_router.put("/change_order_detaile_status", fetch_admin_driver, change_order_detaile_status);
delivery_router.post("/delivery_verify_code_match", driver_auth, delivery_verify_code_match);
delivery_router.put("/change_vehicle_feild", fetch_admin_driver, change_vehicle_feild);
//deliver--------admin-----------
delivery_router.post("/order_asign_by_delivery_admin", fetch_admin_driver, order_asign_by_delivery_admin);

export default delivery_router;





// router.post('/save/audio',upload.fields([{
//   name: 'audio', maxCount: 1
// }, {
//   name: 'graphic', maxCount: 1
// }]) ,(req, res) => {

//   const audioFile = req.files.audio[0];
//   const audioGraphic = req.files.graphic[0];
//   const fileName = req.body.title;


//   saveAudio(fileName,audioFile.filename,audioGraphic.filename,req.body.artist,function (error,success) {
//     req.flash('success','File Uploaded Successfully')

//     res.redirect('/')
//   });

// })