const jwt = require("jsonwebtoken");
const { doHash, doHashValidation, hmacProcess } = require("../utils/hashing");
const {
    registerSchema,
    loginSchema,
    sendCOdeSchema,
    verifyPassCodeSchema,
    changePasswordSchema,
} = require("../Midddleware/ValidatorsAuth");
const transport = require("../Midddleware/sendMail");
const prisma = require("../utils/prismaClient");

exports.register = async (req, res) => {
    const { rollNo, password, email, roles } = req.body;

    try {
        const { error } = registerSchema.validate({
            rollNo,
            password,
            email,
            roles,
        });
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: { rollNo: Number(rollNo) }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const hashedPassword = await doHash(password, 12);

        const savedUser = await prisma.user.create({
            data: {
                rollNo: Number(rollNo),
                password: hashedPassword,
                email,
                roles,
            }
        });

        const userWithoutPassword = { ...savedUser };
        delete userWithoutPassword.password;

        res.status(201).json({
            success: true,
            message: "User saved successfully",
            user: userWithoutPassword,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

exports.login = async (req, res) => {
    const { rollNo, password, roles } = req.body;
    try {
        const { error } = loginSchema.validate({
            rollNo,
            password,
            roles,
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                rollNo: Number(rollNo),
                roles: roles
            }
        });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const isPasswordValid = await doHashValidation(
            password,
            existingUser.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid password",
            });
        }

        const token = jwt.sign(
            {
                userId: existingUser.id,
                rollNo: existingUser.rollNo,
                roles: existingUser.roles,
            },
            process.env.SECRET_KEY,
            { expiresIn: "5h" }
        );

        res.cookie("Authorization", `Bearer ${token}`, {
            httpOnly: true,
            expires: new Date(Date.now() + 3600000),
            secure: process.env.NODE_ENV === "production",
        });

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            token: token,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

exports.signOut = async (req, res) => {
    res.clearCookie("Authorization");
    res.status(200).json({
        success: true,
        message: "User signed out successfully",
    });
};

exports.changePassword = async (req, res) => {
    const { error } = changePasswordSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }

    const { rollNo } = req.user;
    const { oldPassword, newPassword } = req.body;
    try {
        const existingUser = await prisma.user.findUnique({
            where: { rollNo: Number(rollNo) }
        });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const result = await doHashValidation(oldPassword, existingUser.password);

        if (!result) {
            return res.status(400).json({
                success: false,
                message: "Invalid old password",
            });
        }

        const hashedPassword = await doHash(newPassword, 12);

        await prisma.user.update({
            where: { id: existingUser.id },
            data: { password: hashedPassword }
        });

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

exports.sendForgotPasswordCode = async (req, res) => {
    const { error } = sendCOdeSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }

    const { email } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const codeValue = Math.floor(Math.random() * 1000000).toString();
        let info = await transport.sendMail({
            from: "naveenpandian68@gmail.com",
            to: existingUser.email,
            subject: "Password Reset Code",
            html: "<h1>" + codeValue + "<h1>",
        });

        if (info.accepted[0] === existingUser.email) {
            const hashedCodeValue = hmacProcess(codeValue, "123456");

            await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    forgotPasswordCode: hashedCodeValue,
                    forgotPasswordCodeValidation: new Date()
                }
            });

            res.status(200).json({
                success: true,
                message: "Code sent successfully",
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

exports.verifyForgotPasswordCode = async (req, res) => {
    const { error } = verifyPassCodeSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }

    const { email, providedCode, newPassword } = req.body;

    try {
        const code = providedCode.toString();

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (
            !existingUser.forgotPasswordCode ||
            !existingUser.forgotPasswordCodeValidation
        ) {
            return res.status(400).json({
                success: false,
                message: "Code not sent",
            });
        }

        const validationTime = existingUser.forgotPasswordCodeValidation.getTime();

        if (Date.now() - validationTime > 10 * 60 * 1000) {
            return res.status(400).json({
                success: false,
                message: "Code expired",
            });
        }

        const hashedValue = hmacProcess(code, "123456");

        if (hashedValue === existingUser.forgotPasswordCode) {
            const hashedPassword = await doHash(newPassword, 12);

            await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    password: hashedPassword,
                    forgotPasswordCode: null,
                    forgotPasswordCodeValidation: null
                }
            });

            return res.status(200).json({
                success: true,
                message: "Password changed successfully",
            });
        }
        return res.status(400).json({
            success: false,
            message: "Invalid code",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};