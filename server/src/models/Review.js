import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    swapRequest: { type: mongoose.Schema.Types.ObjectId, ref: "SwapRequest", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

reviewSchema.index({ author: 1, swapRequest: 1 }, { unique: true });
reviewSchema.index({ recipient: 1 });

export default mongoose.model("Review", reviewSchema);
