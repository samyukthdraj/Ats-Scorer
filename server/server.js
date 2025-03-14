// server/server.js 

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const resumeAnalyzer = require('./utils/resumeAnalyzer');
const Resume = require('./models/Resume');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Configure file storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only PDF and Word documents are allowed'));
    },
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ats-tracker', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

 // Check if Python is installed and accessible
    try {
        const { execSync } = require('child_process');
        const pythonVersion = execSync('python --version || python3 --version').toString();
        console.log('Python version:', pythonVersion);
    } catch (error) {
        console.error('Python check failed:', error.message);
        return res.status(500).json({ 
            error: 'Python environment issue', 
            details: 'Unable to execute Python. Please ensure Python is installed and accessible.' 
        });
    }

// API Routes
// Update this part in server.js

app.post('/api/analyze-resume', upload.single('resume'), async (req, res) => {
    try {
        console.log('Received request to analyze resume');
        
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('File uploaded:', req.file.originalname);
        
        const fileBuffer = req.file.buffer;
        const originalname = req.file.originalname;
        const jobDescription = req.body.jobDescription || "";
        const location = req.body.location || "";
        const role = req.body.role || "";

        console.log('Job Description:', jobDescription.substring(0, 50) + '...');
        console.log('Location:', location);
        console.log('Role:', role);

        // Analyze the resume
        console.log('Starting resume analysis...');
        const result = await resumeAnalyzer.analyzeResume(fileBuffer, jobDescription, location, role);
        console.log('Analysis complete');

        // Save to database
        const resume = new Resume({
            filename: originalname,
            data: fileBuffer,
            atsScore: result.atsScore,
            analysis: result,
        });

        await resume.save();
        console.log('Resume saved to database');

        res.json(result);
    } catch (error) {
        console.error('Error in /api/analyze-resume endpoint:', error);
        // Simplified error response that doesn't expose stack traces
        res.status(500).json({ 
            error: 'Error analyzing resume', 
            message: 'The server encountered an error while processing your resume.'
        });
    }
});

// Create a simple test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// Serve static assets
app.use(express.static(path.join(__dirname, '../client/public')));

// Handle React routing
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '../client/public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});