import { Router } from "express";
import { getTodos, createTodo, deleteTodo, updateTodo } from "../controllers/todoController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticate);

router.get("/", getTodos);
router.post("/", createTodo);
router.delete("/:id", deleteTodo);
router.patch("/:id", updateTodo);

export default router;