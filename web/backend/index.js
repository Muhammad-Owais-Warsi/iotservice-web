const express = require("express");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const prisma = require("./utils/prismaClient");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(
    "/api",
    authRoutes,
);

prisma.$connect()
    .then(() => {
        console.log("database connected via Prisma");
    })
    .catch((error) => {
        console.log("database connection error:", error);
    });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});