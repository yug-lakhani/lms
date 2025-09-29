
import express from 'express';
import { getUserData, userEnrolledCourses, purchaseCourse, updateUserCourseProgress, getUserCourseProgress, addUserRating } from '../controllers/userController.js';
import { requireApiAuth } from '../middlewares/authMiddleware.js';

const userRouter = express.Router();

userRouter.get('/data', requireApiAuth(), getUserData);
userRouter.get('/enrolled-courses', requireApiAuth(), userEnrolledCourses);
userRouter.post('/purchase', requireApiAuth(), purchaseCourse);
userRouter.post('/update-course-progress', requireApiAuth(), updateUserCourseProgress);
userRouter.post('/get-course-progress', requireApiAuth(), getUserCourseProgress);
userRouter.post('/add-rating', requireApiAuth(), addUserRating);

export default userRouter;
