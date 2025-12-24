const jwt = require("jsonwebtoken");

exports.identifer =
    (roles = []) =>
        async (req, res, next) => {
            let token = req.headers.authorization || req.cookies["Authorization"];
            if (!token) {
                return res.status(403).json({ success: false, message: "Unauthorized" });
            }

            try {
                if (token.startsWith("Bearer ")) {
                    token = token.split(" ")[1];
                }

                if (!token || token === 'null' || token === 'undefined') {
                    console.error("❌ Token is missing or invalid string:", token);
                    return res.status(400).json({ success: false, message: "Invalid token format" });
                }

                const decoded = jwt.verify(token, process.env.SECRET_KEY);
                // ✅ Add this log to debug

                if (roles.length && !roles.includes(decoded.role)) {
                    return res.status(403).json({
                        success: false,
                        message: "You do not have permission to access this resource",
                    });
                }

                req.user = decoded;
                next();
            } catch (error) {
                console.error("❌ JWT Verification Error:", error.message);
                if (!process.env.SECRET_KEY) {
                    console.error("⚠️ SECRET_KEY is not defined in environment variables!");
                }
                return res.status(400).json({ success: false, message: "Invalid token" });
            }
        };