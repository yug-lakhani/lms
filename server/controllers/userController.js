import User from '../models/User.js';

// Get User Data

export const getUserData = async (req, res) => {
    try {
        if (!req.auth || !req.auth.userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const userId = req.auth.userId; 
        const user = await User.findById(userId); 
        if (!user) {
            return res.status(404).json({success:false, message: "User not found" });
        }
        res.json({success:true, user });
    } catch (error) {
        return res.status(500).json({ success:false, message: error.message });
    }
};

// Users Enrolled Courses with Lecture Links
export const userEnrolledCourses = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const userData = await User.findById(userId).populate('enrolledCourses');

        res.json({success:true, enrolledCourses: userData.enrolledCourses });
    } catch (error) {
        return res.json({ success:false, message: error.message });
    }
};