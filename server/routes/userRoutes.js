import express from 'express';
import { getUserData,userEnrolledCourses } from '../controllers/userController.js';
import { requireAuth } from '@clerk/express';


const userRouter = express.Router();

userRouter.get('/data', requireAuth(), getUserData);
userRouter.get('/enrolled-courses', requireAuth(), userEnrolledCourses);

export default userRouter;
