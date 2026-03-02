import { Response } from "express";
import Todo, { ITodo } from "../models/Todo";
import { AuthRequest } from "../middleware/authMiddleware";


export const getTodos = async (req: AuthRequest, res: Response) => {
  try {
    const todos = req.user?.role === "admin"
      ? await Todo.find()
      : await Todo.find({ userId: req.user!.userId });

    res.json(todos);
  } catch (error: any) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ message: "Failed to fetch todos" });
  }
};


export const createTodo = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const todo = new Todo({
      title,
      description: description || "",
      userId: req.user!.userId, 
    } as unknown as ITodo);

    await todo.save();
    res.status(201).json(todo);

  } catch (error: any) {
    console.error("Error creating todo:", error);
    res.status(500).json({ message: "Failed to create todo" });
  }
};


export const deleteTodo = async (req: AuthRequest, res: Response) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    if (req.user?.role !== "admin" && todo.userId.toString() !== req.user!.userId)
      return res.status(403).json({ message: "Forbidden" });

    await todo.deleteOne();
    res.json({ message: "Todo deleted" });

  } catch (error: any) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ message: "Failed to delete todo" });
  }
};


export const updateTodo = async (req: AuthRequest, res: Response) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    if (req.user?.role !== "admin" && todo.userId.toString() !== req.user!.userId)
      return res.status(403).json({ message: "Forbidden" });

    const { title, description, status } = req.body;
    if (title) todo.title = title;
    if (description) todo.description = description;
    if (status) todo.status = status;

    await todo.save();
    res.json(todo);

  } catch (error: any) {
    console.error("Error updating todo:", error);
    res.status(500).json({ message: "Failed to update todo" });
  }
};