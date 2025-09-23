import { Webhook } from "svix";
import User from "../models/User.js";
import Stripe from "stripe";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js"; 


export const clerkWebhooks = async (req, res) => {
  try {
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // ⚠️ req.body is a Buffer because of express.raw
    const evt = wh.verify(req.body, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = evt;

    if (type === "user.created") {
      await User.create({
        _id: data.id,
        email: data.email_addresses[0]?.email_address || null,
        name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        imageUrl: data.image_url,
      });
    } else if (type === "user.updated") {
      await User.findByIdAndUpdate(data.id, {
        email: data.email_addresses[0]?.email_address || null,
        name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        imageUrl: data.image_url,
      });
    } else if (type === "user.deleted") {
      await User.findByIdAndDelete(data.id);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
};

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (request, response) => {

  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = Stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  }
  catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':{
       const paymentIntent = event.data.object;
    const paymentIntentId = paymentIntent.id;

    // 1. Get the session from Stripe
    const session = await stripeInstance.checkout.sessions.list({
      payment_intent: paymentIntentId,
    });

    const { purchaseId } = session.data[0].metadata;

    // 2. Load purchase, user, and course
    const purchaseData = await Purchase.findById(purchaseId);
    const userData = await User.findById(purchaseData.userId);
    const courseData = await Course.findById(purchaseData.courseId);

    // Debugging
    console.log("purchaseData:", purchaseData);
    console.log("userData:", userData);
    console.log("courseData:", courseData);

    if (!userData || !courseData) {
      console.error("User or Course not found!");
      break;
    }

    // 3. Add user to course
    if (!courseData.enrolledStudents.some(id => id.toString() === userData._id.toString())) {
      courseData.enrolledStudents.push(userData._id); // user._id is string
      await courseData.save();
    }

    // 4. Add course to user
    if (!userData.enrolledCourses.some(id => id.toString() === courseData._id.toString())) {
      userData.enrolledCourses.push(courseData._id); // course._id is ObjectId
      await userData.save();
    }

    // 5. Update purchase status
    purchaseData.status = "completed";
    await purchaseData.save();

    break;
    }
    case 'payment_intent.payment_failed':{

      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });
      const {purchaseId} = session.data[0].metadata;

      const purchaseData = await Purchase.findById(purchaseId);
      purchaseData.status = "failed";
      await purchaseData.save();

      break;
    }
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
  
};