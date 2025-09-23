import { clerkClient } from "@clerk/express";
import { requireAuth } from "@clerk/express";

//Middleware (protect Educator Routes)

export const protectEducator = async (req,res,next) => {
    try{
        const userId = req.auth.userId;
        const response = await clerkClient.users.getUser(userId);
        if(response.publicMetadata.role !== "educator"){
            return res.json({success:false,message:'Unauthorized'})
        }
        next();
    }catch(error){
        return res.json({success:false,message:error.message})
    }
}

// Middleware for API routes to ensure auth and return JSON 401 on failure
export const requireApiAuth = (options = {}) => {
    const handler = requireAuth(options);
    return (req, res, next) => {
        handler(req, res, (err) => {
            if (err || !req.auth || !req.auth.userId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            next();
        });
    };
};