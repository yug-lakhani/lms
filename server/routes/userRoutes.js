import express from 'express';
import { requireApiAuth } from '../middlewares/authMiddleware.js';
import { getUserData,userEnrolledCourses } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/data', requireApiAuth(), getUserData);
userRouter.get('/enrolled-courses', userEnrolledCourses);

export default userRouter;
