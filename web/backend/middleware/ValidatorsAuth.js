const Joi = require("joi");

exports.registerSchema = Joi.object({
    email: Joi.string().min(6).max(60).required().email({
        tlds: { allow: ["com", "net", "org", "in"] },
    }),
    password: Joi.string()
        .required()
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$")),
    role: Joi.string().valid("ADMIN", "MASTER", "EMPLOYEE").required(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    companyId: Joi.string().required()
});

exports.loginSchema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required()
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
