import { clerkClient } from "@clerk/express";

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