import mongoose from "mongoose";
const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false 
  },
  email: {
    type: String,
    required: false, 
    unique: true 
  },
  phoneNumber: {
    type: String,
    required: false 
  },
  message: {
    type: String,
    required: true 
  },
  createdOn: {
    type: String,
    required: false 
  },
  status: {
    type: String,
    enum: ['New', 'RegisterationDone', 'CallCut', 'CallNotPickUp', 'NotInterested', 'InvalidNumber'],
    default: 'New',
    required: false 
  },
  reason: {
    type: String,
    required: false 
  }
});

const Contact = mongoose.model('Contact', ContactSchema);

export default Contact;