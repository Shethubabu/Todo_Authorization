import { Request, Response } from "express";
import User from "../models/User";
import Todo from "../models/Todo";
import AuthModel from "../models/Auth";

export const getUsers = async (req: Request, res: Response) => {
  const users = await User.find();
  res.json(users);
};

export const deleteUser = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

 
  await Todo.deleteMany({ userId: user._id });
  await AuthModel.deleteMany({ userId: user._id });

 
  await user.deleteOne();

  res.json({ message: "User and related data deleted" });
};