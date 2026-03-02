import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import todoRoutes from "./routes/todoRoutes";
import userRoutes from "./routes/userRoutes";
import { errorHandler } from "./middleware/errorMiddleware";
import cors from "cors";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.get("/",(req, res)=>{
    res.status(200).json(
        {
            success:true,
            message:"Todo  is Running",
            endpoints:{
                login:"/auth/login",
                register:"/auth/register",
                refresh:"/auth/refresh",
                logout:"/auth/logout",
                getAll:"GET /todos",
            }
        }
    )
})

app.use("/auth", authRoutes);
app.use("/todos", todoRoutes);
app.use("/users", userRoutes);


app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));