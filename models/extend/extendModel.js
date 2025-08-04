import mongoose from "mongoose";
const extendSchema = new mongoose.Schema({
  createdOn: {
    type: String,
    required: false 
  },
  updatedOn: {
    type: String,
    required: false 
  },
  userId: {
    type: String,
    required: false
  },
//   amount: { 
//     type: Number,
//     required: false
//   },
  status: {
    type: String,
    required: false
  },
  reason: {
    type: String,
    required: false
  }
});

const Extend = mongoose.model('Extend', extendSchema);

export default Extend;