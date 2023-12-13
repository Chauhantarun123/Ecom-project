import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import authRouter from "./route/authRoute.js";
import cors from "cors";
import categoryRouter from "./route/categoryRoutes.js";
import productRouter from "./route/productRoutes.js";

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
app.use("/api/auth", authRouter);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
// app.get("/", (req, res) => {
//   res.json("welcome to ecom project");
// });
app.listen(8081, () => {
  console.log("server is running on 8081");
});

mongoose
  .connect("mongodb://127.0.0.1:27017/Ecom")
  .then(() => {
    console.log("database is connected successfully");
  })
  .catch((err) => {
    console.log(err);
  });
