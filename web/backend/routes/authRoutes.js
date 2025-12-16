const express = require("express");
const {
    register,
    login,
    signOut,
    changePassword,
    sendForgotPasswordCode,
    verifyForgotPasswordCode,
} = require("../controllers/AuthController");
const { identifer } = require("../middleware/identifier");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/signout", signOut);

router.patch(
    "/changePassword",
    identifer(["student", "hod", "staff"]),
    changePassword
);

router.post(
    "/sendForgotPassCode",

    sendForgotPasswordCode
);

router.post(
    "/verifyForgotPassCode",

    verifyForgotPasswordCode
);
module.exports = router;