import { Router } from "express";
import { getUsers, deleteUser } from "../controllers/userController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticate, authorize(["admin"]));

router.get("/", getUsers);
router.delete("/:id", deleteUser);

export default router;