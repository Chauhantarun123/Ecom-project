import { comparePassword, hashPassword } from "../helper/authHelper.js";
import UserModel from "../model/userModel.js";
import JWT from "jsonwebtoken";
import OrderModel from "../model/orderModel.js";

const registerController = async (req, res) => {
  try {
    const { name, password, email, phone, address, question } = req.body;
    if (!name) {
      res.send({ message: "name is require" });
    }
    if (!email) {
      res.send({ message: "email is require" });
    }
    if (!address) {
      res.send({ message: "address is require" });
    }
    if (!phone) {
      res.send({ message: "phone is require" });
    }
    if (!password) {
      res.send({ message: "password is require" });
    }
    if (!question) {
      res.send({ message: "question is require" });
    }

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "already registered",
      });
    }
    const hashedPassword = await hashPassword(password);
    const user = await new UserModel({
      name,
      email,
      address,
      phone,
      password: hashedPassword,
      question,
    }).save();
    res.status(200).send({
      success: true,
      message: "user register successfully",
      user: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in register",
      error,
    });
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "please enter login id password",
      });
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "email is not registered",
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "invalid password",
      });
    }

    const token = await JWT.sign({ _id: user._id }, "tarunjaat1234567890", {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "failed to login",
      error,
    });
  }
};

export const frogotPasswordController = async (req, res) => {
  try {
    const { email, question, newpassword } = req.body;
    if (!email) {
      res.status(400).send({ message: "email is required" });
    }
    if (!question) {
      res.status(400).send({ message: "question is required" });
    }
    if (!newpassword) {
      res.status(400).send({ message: "newpassword is required" });
    }
    const user = await UserModel.findOne({ email, question });
    if (!user) {
      res.status(500).send({
        success: false,
        message: "wrong email or password",
      });
    }
    const hashed = await hashPassword(newpassword);
    await UserModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "password successfully update",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "something went wrong",
      error,
    });
  }
};

const testController = (req, res) => {
  res.send("protected route");
};

const updateProfileController = async (req, res) => {
  try {
    const { name, password, address, phone } = req.body;
    const user = await UserModel.findById(req.user._id);
    //password
    if (password && password.length < 6) {
      return res.json({ error: "Passsword is required and 6 character long" });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Update profile",
      error,
    });
  }
};

//orders
const getOrderController = async (req, res) => {
  try {
    const buyers = req.user._id;
    if (!buyers) {
      res.status(500).send({
        success: false,
        message: "not product found",
      });
    }
    const orders = await OrderModel.find({ buyers })
      .populate("products", "-photo")
      .populate("buyers", "name");
    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error While Getting Orders",
      error: error.message,
    });
  }
};

//All orders

const getAllOrderController = async (req, res) => {
  try {
    const orders = await OrderModel.find({})
      .populate("products", "-photo")
      .populate("buyers", "name")
      .sort({ createdAt: "-1" });
    res.status(200).json({
      success: true,
      total: orders.length,
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error While Getting Orders",
      error: error.message,
    });
  }
};

//order status

const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await OrderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Updateing Order",
      error,
    });
  }
};
//get all users

const getAllusersController = async (req, res) => {
  try {
    const users = await UserModel.find({});
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "failed to get all users",
      error,
    });
  }
};

export {
  registerController,
  loginController,
  testController,
  updateProfileController,
  getOrderController,
  getAllOrderController,
  orderStatusController,
  getAllusersController,
};
