import mongoose from 'mongoose';

// This schema will store one document for each day.
// For example: { _id: 'user_sequence_140825', sequence_value: 15 }
const counterSchema = new mongoose.Schema({
  _id: { 
    type: String, 
    required: true 
  }, // The ID will be the unique key for each day's counter
  sequence_value: { 
    type: Number, 
    default: 0 
  }
});

const Counter = mongoose.model('Counter', counterSchema);

export default Counter;