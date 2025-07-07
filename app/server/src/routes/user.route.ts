import express from "express";
import { getCurrentUserController } from "@/controllers/user.controller";

const userRoutes = express.Router();

userRoutes.get("/me", getCurrentUserController);

export default userRoutes;
