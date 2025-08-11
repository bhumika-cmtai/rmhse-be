import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false 
  },
  email: {
    type: String,
    required: false, 
    unique: true 
  },
  password: {
    type: String,
    required: false 
  },
  phoneNumber: {
    type: String,
    required: false 
  },
  emergencyNumber: {
    type: String,
    required: false 
  },
  permanentAddress: {
    type: String,
    required: false
  },
  currentAddress: {
    type: String,
    required: false
  },

  gender: {
    type: String,
    required: false
  },
  roleId: {
    type: [String],
    required: false
  },
  withdrawRequest: {
    type: [String],
    required: false
  },
  extendRequest: {
    type: [String],
    required: false
  },
  limit: {
    type: Number,
    default: 25
  },
  role: {
    type: String,
    required: false,
    // default: "user"
  },
  profileImage: {
    type:String,
    required: false
  },
  adharFront: {
    type: String,
    required: false
  },
  adharBack:{
    type:String,
    required: false
  },
  pancard: {
    type:String,
    required: false
  },
  refferedBy: {
    type:String,
    required: false
  },
  status: {
    type: String,
    required: false,
    default: "active"
  },
  createdOn: {
    type: String,
    required: false 
  },
  updatedOn: {
    type: String,
    required: false 
  },
  income: {
    type: Number,
    required:false,
    default: 0
  },
  commision: {
    type: [{
      userId: { // The ID of the user who generated the commission (the new member)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      // We add _id: false to prevent Mongoose from creating a unique _id for each commission sub-document
      _id: false 
    }],
    required: false,
    default: []
  },

  memberId: {
    type: String,
    required: false
  },
  dob: {
    type: String,
    required: false
  },

  account_number: {
    type: String,
    required: false
  },
  Ifsc: {
    type: String,
    required: false
  },
  upi_id: {
    type:String,
    required: false
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  razorpay_order_id: { type: String },
  razorpay_payment_id: { type: String },
  razorpay_signature: { type: String },

});

const User = mongoose.model('User', userSchema);

export default User;