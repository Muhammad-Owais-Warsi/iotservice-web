const Joi = require("joi");

exports.registerSchema = Joi.object({
    rollNo: Joi.number().required(),
    email: Joi.string().min(6).max(60).required().email({
        tlds: { allow: ["com", "net"] },
    }),
    password: Joi.string()
        .required()
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$")),
    roles: Joi.string().valid("student", "staff", "hod").required()
});

exports.loginSchema = Joi.object({
    rollNo: Joi.number().required(),
    password: Joi.string()
        .required()
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$")),
    roles: Joi.string().valid("student", "staff", "hod").required()
});

exports.sendCOdeSchema = Joi.object({
    email: Joi.string().min(6).max(60).required().email({
        tlds: { allow: ["com", "net"] },
    }),
});

exports.verifyPassCodeSchema = Joi.object({
    email: Joi.string().min(6).max(60).required().email({
        tlds: { allow: ["com", "net"] },
    }),
    providedCode: Joi.number().required(),
    newPassword: Joi.string()
        .required()
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$")),
});

exports.changePasswordSchema = Joi.object({
    newPassword: Joi.string()
        .required()
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$")),
    oldPassword: Joi.string()
        .required()
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$")),
});
