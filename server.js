const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

const connectDatabase = require("./Helpers/database/connectDatabase");
const customErrorHandler = require("./Middlewares/Errors/customErrorHandler");

dotenv.config({
  path: "./config.env",
});

connectDatabase();

const app = express();
app.use(express.json());
app.use(cors());
app.use(customErrorHandler);

// Routes
app.use("/auth", require("./Routers/auth"));
app.use("/story", require("./Routers/story"));
app.use("/user", require("./Routers/user"));
app.use("/comment", require("./Routers/comment"));
app.use("/api", require("./Routers/upload"));

// Set static folder
//app.use(express.static("Frontend/build"));
app.use(express.static("https://haimazu-htb.onrender.com/build"));

app.get("*", (req, res) => {
  res.send("https://haimazu-htb.onrender.com/build/index.html");
});

//app.get("*", (req, res) => {
//  res.sendFile(path.resolve(__dirname, "Frontend", "build", "index.html"));
//});

// Route
//app.get("*", (req, res) => {
//  res.send("Home Page");
//});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} : ${process.env.NODE_ENV}`);
});
