import express from "express";
import { edit, remove, logout, see } from "../controllers/userController";

/**
 * User Router
 * PATH: [ /users/+@ ]
 */
const userRouter = express.Router();

userRouter.get("/logout", logout);
userRouter.get("/edit", edit);
userRouter.get("/delete", remove);
userRouter.get(":id", see);

export default userRouter;