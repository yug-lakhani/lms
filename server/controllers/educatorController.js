import { clerkClient } from "@clerk/express";
import Course from "../models/Course.js";
import {v2 as cloudinary} from "cloudinary";

// Update user role to educator 
export const updateRoleToEducator = async (req,res) => {
    try{
        const userId = req.auth.userId;

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: { role: "educator", }
        })

        res.json({success:true,message:'You can publish a course now.'})
    }
    catch(error){
        res.json({success:false,message:error.message})
    }
}

//Add new Course
export const addCourse = async (req, res) => {
  try {
    const educatorId = req.auth().userId;
    const imageFile = req.file;

    // Support both multipart (with courseData JSON string) and pure JSON bodies
    const parsedCourseData = req.body.courseData
      ? JSON.parse(req.body.courseData)
      : req.body;

    // Always set educator from auth, ignoring any client-provided value
    parsedCourseData.educator = educatorId;

    // Prefer existing courseThumbnail URL if provided; otherwise upload file if present
    if (parsedCourseData.courseThumbnail && typeof parsedCourseData.courseThumbnail === 'string') {
      // Use provided URL, skip upload
    } else if (imageFile && typeof imageFile.path === 'string' && imageFile.path.length > 0) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path);
      parsedCourseData.courseThumbnail = imageUpload.secure_url;
    } else {
      return res.json({ success: false, message: "Course thumbnail is required" });
    }

    const newCourse = await Course.create(parsedCourseData);
    res.json({ success: true, message: "Course Added", course: newCourse });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


//Get Educator Courses
export const getEducatorCourses = async (req,res) => {
    try{
        const educator = req.auth.userId;
        const courses = await Course.find({ educator });
        res.json({ success: true, courses });
    }catch(error){
        res.json({success:false,message:error.message});
    }
}

// Get Educator Dashboard Data( total earnings, total students, total courses)

export const educatorDashboardData = async (req,res) => {
    try{
        const educator = req.auth.userId;
        const courses = await Course.find({ educator });

        const totalCourses = courses.length;

        const courseIds = courses.map(course => course._id);

        //calculate total earnings
        const purchases = await Purchase.find({
            course: { $in: courseIds },
            status: "completed"
        })

        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
        
        //collect unique students IDs with course title
        const enrolledStudentsData = [];
        for(const course of courses){
             const students = await User.find({
                 _id: { $in: course.enrolledStudents } }
                 , 'name imageUrl');
            
            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                })
            });
            
        }

        res.json({ success: true,dashboardData:{ totalEarnings, enrolledStudentsData, totalCourses } });

    }catch(error){
        res.json({success:false,message:error.message});
    }
}

// Get Enrolled Students with purchased course
export const getEnrolledStudentsData = async (req,res) => {
    try{
        const educator = req.auth.userId;
        const courses = await Course.find({ educator });
        const courseIds = courses.map(course => course._id);

        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: "completed"
        }).populate('userId','name imageUrl').populate('courseId','courseTitle');

        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt,
        }));

        res.json({ success: true, enrolledStudents });

    }catch(error){
        res.json({success:false,message:error.message});
    }
}
