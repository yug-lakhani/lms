import { Webhook } from "svix";
import User from "../models/User.js";

export const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // req.body is raw buffer, verify will parse
    const evt =await whook.verify(req.body.toString("utf-8"), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = evt;

    switch (type) {
      case "user.created":
        await User.create({
          _id: data.id, // make sure your schema allows string IDs
          email: data.email_addresses[0].email_address,
          name: `${data.first_name} ${data.last_name}`,
          imageUrl: data.image_url,
        });
        return res.json({ received: true });
        break;

      case "user.updated":
        await User.findByIdAndUpdate(data.id, {
          email: data.email_addresses[0].email_address,
          name: `${data.first_name} ${data.last_name}`,
          imageUrl: data.image_url,
        });
        return res.json({ received: true });
        break;

      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        return res.json({ received: true });
        break;

      default:
        return res.json({ received: true });
        break;
    }
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(400).json({ success: false, error: err.message });
  }
};
