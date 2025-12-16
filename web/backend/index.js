const express = require("express");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");


const cookieParser = require("cookie-parser");
const cors = require("cors");

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

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("database connected");
    })
    .catch((error) => {
        console.log(error);
    });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});