import { Webhook } from "svix";
import User from "../models/User.js";

// Clerk Webhook
export const clerkWebhooks = async (req, res) => {
  try {
    
   const payload = req.body.toString("utf8");

    // headers from Clerk
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    // verify signature
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const evt = await whook.verify(payload, headers);
    const { type, data } = evt;

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        
         await User.create(userData);
         res.json({});
         break;
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        res.json({});
        break;
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        res.json({});
        break;
      }

      default:
        break;
    }
  } catch (error) {
    res.json({success: false, error: error.message});
  }
};


