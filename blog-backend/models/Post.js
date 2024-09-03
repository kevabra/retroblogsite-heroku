const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  user: {
    type: ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  likes: [{ type: ObjectId, ref: 'User', default: [] }] // Array to store user IDs who liked the post
});

module.exports = mongoose.model('Post', PostSchema);
