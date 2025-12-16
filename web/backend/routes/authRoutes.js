const express = require("express");
const {
    register,
    login,
    signOut,
    changePassword,
    sendForgotPasswordCode,
    verifyForgotPasswordCode,
} = require("../Controllers/AuthController");
const { identifer } = require("../Midddleware/identifer");

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