import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true }, // Clerk userId (e.g. user_xxx)
        name: { type: String, required: true },
        email: { type: String, required: true },
        imageUrl: { type: String, default: null }, // FIXED (was default: true ❌)

        enrolledCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course", // Populate with full course info later
            }
        ],
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
