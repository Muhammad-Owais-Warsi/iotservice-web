const jwt = require("jsonwebtoken");
const { doHash, doHashValidation, hmacProcess } = require("../utils/hasing");
const {
    registerSchema,
    loginSchema,
    sendCOdeSchema,
    verifyPassCodeSchema,
    changePasswordSchema,
} = require("../Midddleware/ValidatorsAuth");
const transport = require("../Midddleware/sendMail");

const userModel = require("../models/userModel");

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

        const existingUser = await userModel.findOne({ rollNo });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const hashedPassword = await doHash(password, 12);

        const newUser = new userModel({
            rollNo,

            password: hashedPassword,
            email,
            roles,
        });

        const savedUser = await newUser.save();
        const userWithoutPassword = savedUser.toObject();
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

        const existingUser = await userModel
            .findOne({ rollNo, roles })
            .select("+password");

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
                userId: existingUser._id,
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
            // optionally return token to client if needed
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
// exports.sendVerificationCode = async(req,res) =>{
//     const {email} = req.body;
//     try {
//         const existingUser = await userModel.findOne({email})
//         if(!existingUser){
//             return res.status(404).json({
//                 success : false,
//                 message : "User not found"
//             })
//         }

//         if(existingUser.verified){
//             return res.status(400).json({
//                 success : false,
//                 message : "User already verified"
//             })
//         }

//          const codeValue = Math.floor(Math.random() * 1000000).toString();
//           let info = await transport.sendMail({
//             from : process.env.EMAIL,
//             to : existingUser.email,
//             subject : "Verification Code",
//             html : '<h1>'  + codeValue +'</h1>'

//           });

//           if(info.accepted[0] === existingUser.email){
//                const hashedCodeValue = hmacProcess(
//                 codeValue,
//                 process.env.HMAC_KEY
//                );
//                 existingUser.verificationCode = hashedCodeValue;
//                 existingUser.verificationCodeValidation = Date.now();
//                 await existingUser.save();
//                 return res.status(200).json({
//                     success : true,
//                     message : "Verification code sent successfully"
//                 })
//           }

//     } catch (error) {
//          console.log(error);
//     }
// };

// exports.verifyVerificationCode = async(req,res) =>{
//     const { email, provideCode} = req.body;
//     try {

//         const codeValue = providecode.toString();
//         const existingUser = await userModel.findOne({email}).select(
//             " +verificationCode +verificationCodeValidation"
//         );
//         if(!existingUser){
//             return res.status(404).json({
//                 success : false,
//                 message : "User not found"
//             })
//             }

//         if(existingUser.verified){
//             return res.status(400).json({
//                 success : false,
//                 message : "User already verified"
//             })
//         }
//          if(! existingUser.verificationCode || ! existingUser.verificationCodeValidation){
//             return res.status(400).json({
//                 success : false,
//                 message : "Verification code not sent"
//             })
//          }

//          if(Date.now() - existingUser.verificationCodeValidation > 5* 60 * 10000){
//              return res.status(400).json({
//                 success : false,
//                 message : "Verification code expired"
//             })
//          }
//           const hashedCodeValue = hmacProcess(
//             codeValue,
//             process.env.HMAC_KEY

//           )

//           if(hashedCodeValue  === existingUser.verificationCode){
//             existingUser.verified = true;
//             existingUser.verificationCode = undefined;
//             existingUser.verificationCodeValidation = undefined;
//             await existingUser.save();
//             return res.status(200).json({
//                 success : true,
//                 message : "User verified successfully"
//             })
//           }

//     } catch (error) {
//          console.error(error);
//          return res.status(500).json({
//             success : false,
//             message : "Internal server error"
//             })

//     }
// }

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
        // if(!verified){
        //     return res.status(400).json({
        //         success : false,
        //         message : "User not verified"
        //     })
        // }

        const existingUser = await userModel
            .findOne({ rollNo })
            .select("+password");
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

        const hashedpassword = await doHash(newPassword, 12);

        existingUser.password = hashedpassword;

        await existingUser.save();
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
        const exisitingUser = await userModel.findOne({ email });

        if (!exisitingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const codeValue = Math.floor(Math.random() * 1000000).toString();
        let info = await transport.sendMail({
            from: "naveenpandian68@gmail.com",
            to: exisitingUser.email,
            subject: "Password Reset Code",
            html: "<h1>" + codeValue + "<h1>",
        });

        if (info.accepted[0] === exisitingUser.email) {
            const hashedCodeValue = hmacProcess(codeValue, "123456");

            exisitingUser.forgotPasswordCode = hashedCodeValue;

            exisitingUser.forgotPasswordCodeValidation = Date.now();

            await exisitingUser.save();

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

        const existingUser = await userModel
            .findOne({ email })
            .select("+forgotPasswordCode +forgotPasswordCodeValidation");
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

        if (
            Date.now() - existingUser.forgotPasswordCodeValidation >
            10 * 60 * 1000
        ) {
            return res.status(400).json({
                success: false,
                message: "Code expired",
            });
        }

        const hashedValue = hmacProcess(code, "123456");

        if (hashedValue === existingUser.forgotPasswordCode) {
            const hashedPassword = await doHash(newPassword, 12);

            existingUser.password = hashedPassword;

            existingUser.forgotPasswordCode = undefined;

            existingUser.forgotPasswordCodeValidation = undefined;

            await existingUser.save();

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