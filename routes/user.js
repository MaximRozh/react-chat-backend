import express from "express";
import UserModel from "../models/User.js";
import bcrypt from "bcrypt";

const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {
  try {
    const { password, ...userInfo } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const doc = UserModel({
      ...userInfo,
      passwordHash: hash,
    });
    const user = await doc.save();

    const { passwordHash, ...userData } = user._doc;
    res.json({
      ...userData,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const { password: userPassword, email } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user)
      return res
        .status(404)
        .json({ message: "Login or password is incorrect" });

    const isValidPassword = await bcrypt.compare(
      userPassword,
      user._doc.passwordHash
    );
    if (!isValidPassword)
      return res
        .status(404)
        .json({ message: "Login or password is incorrect111" });

    // user.status = "online";
    // await user.save();
    // const { password } = user;
    const { passwordHash, ...userData } = user._doc;
    res.json(userData);
  } catch (e) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default userRouter;
