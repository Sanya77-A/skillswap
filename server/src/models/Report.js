import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reportedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true },
  },
  { timestamps: true }
);

reportSchema.index({ reportedUserId: 1 });
reportSchema.index({ reportedBy: 1 });

export default mongoose.model("Report", reportSchema);
