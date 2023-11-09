import express from "express";
import { edit, logout, see, startGithubLogin, finishGithubLogin, startNaverLogin, finishNaverLogin, thirdNaverLogin, getEdit, postEdit, getChangePassword, postChangePassword } from "../controllers/userController";
import { avatarUpload, protectorMiddleware, publicOnlyMiddleware } from "../middlewares";

/**
 * User Router
 * PATH: [ /users/+@ ]
 */
const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
userRouter
    .route("/edit")
    .all(protectorMiddleware)
    .get(getEdit)
    .post(avatarUpload.single("avatar"), postEdit);
userRouter
    .route("/change-password")
    .all(protectorMiddleware)
    .get(getChangePassword)
    .post(postChangePassword);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter.get("/naver/first", publicOnlyMiddleware, startNaverLogin);
userRouter.get("/naver/second", publicOnlyMiddleware, finishNaverLogin);
userRouter.get("/:id", see);

export default userRouter;