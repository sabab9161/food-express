import mongoose from "mongoose";

const helpDeskMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    response: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const HelpDeskMessage = mongoose.model("HelpDeskMessage", helpDeskMessageSchema, "helpdeskmessages");

export default HelpDeskMessage;
