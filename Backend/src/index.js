const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.once('open', () => console.log('MongoDB Connected'));
db.on('error', (err) => console.error(err));

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: { type: String, default: 'user' },
  points: { type: Number, default: 0 },
});
const User = mongoose.model('User', userSchema);

// Issue Schema
const issueSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  image: { type: String, default: '' },
  category: String,
  status: { type: String, default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});
const Issue = mongoose.model('Issue', issueSchema);

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Setup for Image Uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error });
  }
});

// Create Issue
app.post('/api/issues', upload.single('image'), async (req, res) => {
  try {
    const { title, description, location, createdBy } = req.body;
    let imageUrl = '';
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }).end(req.file.buffer);
      });
      imageUrl = result.secure_url;
    }
    
    const newIssue = new Issue({ title, description, location, image: imageUrl, createdBy });
    await newIssue.save();
    io.emit('new_issue', newIssue);
    res.status(201).json(newIssue);
  } catch (error) {
    res.status(500).json({ message: 'Error creating issue', error });
  }
});

// Get Issues
app.get('/api/issues', async (req, res) => {
  try {
    const issues = await Issue.find().populate('createdBy', 'username');
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching issues', error });
  }
});

// Update Issue Status (Admin Only)
app.put('/api/issues/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedIssue = await Issue.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(updatedIssue);
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error });
  }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Dependencies to Install:
// npm install express mongoose cors body-parser dotenv axios bcryptjs jsonwebtoken multer cloudinary socket.io http