const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require('openai');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const db = mongoose.connection;
// db.once('open', () => console.log('MongoDB Connected'));
// db.on('error', (err) => console.error(err));

// Issue Schema
// const issueSchema = new mongoose.Schema({
//   title: String,
//   description: String,
//   location: String,
//   image: String,
//   category: String,
//   points: { type: Number, default: 10 },
//   createdAt: { type: Date, default: Date.now },
// });

// const Issue = mongoose.model('Issue', issueSchema);

// OpenAI API Setup
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY);

// Route: Create Issue
app.post('/api/issues', async (req, res) => {
  try {
    const { title, description, location, image } = req.body;
    
    // AI Categorization
    const aiResponse = await openai.completions.create({
      model: "gpt-4",
      prompt: `Classify the following issue into a category: ${description}`,
      max_tokens: 10,
    });
    
    const category = aiResponse.choices[0].text.trim();
    
    const newIssue = new Issue({
      title,
      description,
      location,
      image,
      category,
    });
    await newIssue.save();
    res.status(201).json(newIssue);
  } catch (error) {
    res.status(500).json({ message: 'Error creating issue', error });
  }
});

// Route: Get Issues
app.get('/api/issues', async (req, res) => {
  try {
    const issues = await Issue.find();
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching issues', error });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Dependencies to Install:
// npm install express mongoose cors body-parser dotenv openai
