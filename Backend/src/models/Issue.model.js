import mongoose from "mongoose";

const issueSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  image: String,
  category: String,
  points: { type: Number, default: 10 },
  createdAt: { type: Date, default: Date.now },
});

const Issue = mongoose.model('Issue', issueSchema);

export default Issue;