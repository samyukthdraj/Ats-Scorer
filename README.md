# 1. Prerequisites: Install Node.js, Python 3, pip, and Git

# 2. Clone the repository:
git clone <repository_url>
cd ats-scorer

# 3. Set up the Backend (server/):
cd server
npm install

# Create .env file in server/ directory with MONGODB_URI and PORT (optional)
.env has this
MONGODB_URI=mongodb://mongodb:27017/ats-tracker
PORT=5000
NODE_ENV=production

# Set up Python environment and install dependencies:
cd server
cd python_scripts
python -m venv venv          # Create virtual environment
<!-- source venv/bin/activate   # Activate (Linux/macOS) - OR  -->
- venv\Scripts\activate  (Windows)
pip install -r requirements.txt
cd ..

# Start the backend server:
cd server
npm run dev                  # Or npm start

# 4. Set up the Frontend (client/) - IN A NEW TERMINAL:
cd client
npm install
npm start                   # This should open http://localhost:3000 in your browser

# 5. Access the Application:
#   Open your web browser and go to http://localhost:3000


How to Run the Application (DOCKER)

Install Docker and Docker Compose on your system
Navigate to the root directory of your project
Run the following command:
Copydocker-compose up -d

Access your application at http://localhost


- make accurate score.


keyword-analysis-table make it bigger, inaccurate score. 

Ensure job_suggestion.py is returning valid data.
Ensure resumeAnalyzer.js is correctly passing the job_suggestions field to the frontend.
Ensure ScoreDisplay.jsx is rendering the job_suggestions data.


real job suggestions, get the api or something form indeed.

are these good enough for job postings across the entire world, what i want is whenever i give any location, it should get the available jobs from that location and the jobs we are suited for depending on the job description we give and the job role we are looking for

pip install careerjet-api-client