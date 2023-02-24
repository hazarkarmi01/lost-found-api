const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());

const userRouter = require("./routes/user.routes");
const categoryRouter = require("./routes/category.routes");
app.use("/users", userRouter);
app.use("/category", categoryRouter);

const port = process.env.PORT || 3500;
mongoose.connect("mongodb://localhost:27017/lostfound").then(() => {
  console.log("db is running");
});
app.listen(port, () => {
  console.log(`App is runnning on port ${port}`);
});
