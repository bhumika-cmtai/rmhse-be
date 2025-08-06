import mongoose from "mongoose";
const withdrawalSchema = new mongoose.Schema({
  createdOn: {
    type: String,
    required: false 
  },
  updatedOn: {
    type: String,
    required: false 
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assumes your User model is named 'User'
    required: true
  },
  amount: { 
    type: Number,
    required: false
  },
  status: {
    type: String,
    required: false,
    default: "pending"
  },
  reason: {
    type: String,
    required: false
  }
});

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

export default Withdrawal;