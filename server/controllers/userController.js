import User from '../models/User.js';

// Get User Data
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.auth();   // 👈 call it as a function now
    console.log("USER ID:", userId);

    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Users Enrolled Courses with Lecture Links
export const userEnrolledCourses = async (req, res) => {
  try {
    const { userId } = req.auth();
    const userData = await User.findById(userId).populate("enrolledCourses");

    res.json({ success: true, enrolledCourses: userData.enrolledCourses });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
