import express from 'express';
import { getUserData,userEnrolledCourses } from '../controllers/userController.js';
import { clerkMiddleware } from '@clerk/express';


const userRouter = express.Router();
userRouter.use(clerkMiddleware());

userRouter.get('/data', getUserData);
userRouter.get('/enrolled-courses', userEnrolledCourses);

export default userRouter;
