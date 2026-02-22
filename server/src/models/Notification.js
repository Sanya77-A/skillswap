import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["NEW_REQUEST", "REQUEST_ACCEPTED", "REQUEST_REJECTED", "NEW_MESSAGE", "REQUEST_COMPLETED", "SESSION_CONFIRMED"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, default: "" },
    body: { type: String, default: "" },
    link: { type: String, default: "" },
    read: { type: Boolean, default: false },
    readAt: { type: Date },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
