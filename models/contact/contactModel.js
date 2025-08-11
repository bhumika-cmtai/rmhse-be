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