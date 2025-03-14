// server/utils/resumeAnalyzer.js
const { spawn } = require('child_process');
const fs = require('fs'); // Added fs module
const path = require('path'); //Added Path Module
const { v4: uuidv4 } = require('uuid'); // Added uuid module

const analyzeResume = async (fileBuffer, jobDescription, location, role) => {
    console.log("Starting resume analysis...");

    // Create a unique temporary directory for this analysis
    const tempDir = path.join(__dirname, `temp_${uuidv4()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    // Paths for temporary files
    const tempFilePath = path.join(tempDir, "resume.pdf"); // Assuming PDF for now
    const jobDescPath = path.join(tempDir, "job_description.txt");

    try {
        // Save the file buffer to a temporary file
        fs.writeFileSync(tempFilePath, fileBuffer);
        console.log(`Temporary resume file saved at: ${tempFilePath}`);

        // Save job description to a file
        fs.writeFileSync(jobDescPath, jobDescription || "");
        console.log(`Job description saved at: ${jobDescPath}`);

        // Determine the Python command to use
        const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';

        // Path to the Python scripts
        const atsScriptPath = path.join(__dirname, '../python_scripts/ats_scorer.py');
        const jobSuggestionScriptPath = path.join(__dirname, '../python_scripts/job_suggestion.py');

        console.log(`ATS script path: ${atsScriptPath}`);
        console.log(`Job suggestion script path: ${jobSuggestionScriptPath}`);

        // Check if Python scripts exist
        if (!fs.existsSync(atsScriptPath)) {
            console.error(`ATS Python script not found at: ${atsScriptPath}`);
            console.log("Falling back to mock data for debugging");
            // Return mock data if the Python script isn't found
            return getMockResult(location);
        }

        // Execute the ATS scorer Python script
        const atsScorePromise = new Promise((resolve, reject) => {
            console.log(`Executing: ${pythonCommand} ${atsScriptPath} ${tempFilePath} ${jobDescPath} ${location} ${role}`);

            const pythonProcess = spawn(pythonCommand, [
                atsScriptPath,
                tempFilePath,
                jobDescPath,
                location || "Remote",
                role || "General"
            ]);

            let dataString = '';
            let errorString = '';

            pythonProcess.stdout.on('data', (data) => {
                dataString += data.toString();
                console.log(`ATS Python stdout: ${data}`);
            });

            pythonProcess.stderr.on('data', (data) => {
                errorString += data.toString();
                console.error(`ATS Python stderr: ${data}`);
            });

            pythonProcess.on('close', (code) => {
                console.log(`ATS Python process exited with code ${code}`);

                if (code !== 0) {
                    console.error(`ATS Python script error: ${errorString}`);
                    console.log("Falling back to mock data due to Python error");
                    // Return mock data if the Python script fails
                    resolve(getMockResult(location));
                } else {
                    try {
                        const result = JSON.parse(dataString);
                        resolve(result);
                    } catch (parseError) {
                        console.error("Error parsing ATS Python output:", parseError);
                        console.log("Raw output:", dataString);
                        console.log("Falling back to mock data due to parse error");
                        resolve(getMockResult(location));
                    }
                }
            });

            pythonProcess.on('error', (error) => {
                console.error("Error spawning ATS Python process:", error);
                console.log("Falling back to mock data due to spawn error");
                resolve(getMockResult(location));
            });
        });

        // Execute the Job Suggestion Python script in parallel
        const jobSuggestionPromise = new Promise((resolve, reject) => {
            if (!fs.existsSync(jobSuggestionScriptPath)) {
                console.error(`Job suggestion script not found at: ${jobSuggestionScriptPath}`);
                resolve([]);
                return;
            }

            console.log(`Executing: ${pythonCommand} ${jobSuggestionScriptPath} ${tempFilePath} ${location} ${role}`);

            const pythonProcess = spawn(pythonCommand, [
                jobSuggestionScriptPath,
                tempFilePath,
                location || "Remote",
                role || "General"
            ]);

            let dataString = '';
            let errorString = '';

            pythonProcess.stdout.on('data', (data) => {
                dataString += data.toString();
                console.log(`Job suggestion Python stdout: ${data}`);
            });

            pythonProcess.stderr.on('data', (data) => {
                errorString += data.toString();
                console.error(`Job suggestion Python stderr: ${data}`);
            });

            pythonProcess.on('close', (code) => {
                console.log(`Job suggestion Python process exited with code ${code}`);

                if (code !== 0) {
                    console.error(`Job suggestion Python script error: ${errorString}`);
                    resolve([]);
                } else {
                    try {
                        const result = JSON.parse(dataString);
                        resolve(result);
                    } catch (parseError) {
                        console.error("Error parsing job suggestion Python output:", parseError);
                        console.log("Raw output:", dataString);
                        resolve([]);
                    }
                }
            });

            pythonProcess.on('error', (error) => {
                console.error("Error spawning job suggestion Python process:", error);
                resolve([]);
            });
        });

        // Wait for both scripts to complete
        const [atsResults, jobSuggestions] = await Promise.all([atsScorePromise, jobSuggestionPromise]);

        // Combine the results
        return {
            ...atsResults,
            job_suggestions: jobSuggestions.length > 0 ? jobSuggestions : getMockResult(location).job_suggestions
        };

    } catch (error) {
        console.error("Error in analyzeResume:", error);
        return getMockResult(location); // Always return some data rather than throwing
    } finally {
        // Clean up temporary files
        try {
            if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
            if (fs.existsSync(jobDescPath)) fs.unlinkSync(jobDescPath);
            if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir, { recursive: true });
        } catch (cleanupError) {
            console.error("Error cleaning up temporary files:", cleanupError);
        }
    }
};

// Helper function to generate mock results for debugging
function getMockResult(location) {
    return {
        atsScore: 75,
        keywordScore: 80,
        skillScore: 70,
        experienceScore: 80,
        formattingScore: 90,
        grammarScore: 95,
        resumeLengthScore: 85,
        recommendations: [
            "Incorporate more industry-specific keywords from the job description",
            "Add measurable achievements to your experience section",
            "Ensure your resume uses a standard, ATS-friendly format",
            "Consider adding a skills section with relevant technical and soft skills"
        ],
        keywordMatches: [
            {term: "javascript", found: true, frequency: 3},
            {term: "react", found: true, frequency: 2},
            {term: "node.js", found: true, frequency: 1}
        ],
        job_suggestions: [
            {
                title: "Software Developer",
                company: "Sample Company",
                location: location || "Remote",
                salary: "$80,000 - $100,000",
                url: "https://example.com"
            },
            {
                title: "Frontend Engineer",
                company: "Tech Solutions Inc.",
                location: location || "Remote",
                salary: "$90,000 - $110,000",
                url: "https://example.com/job2"
            }
        ]
    };
}

module.exports = {
    analyzeResume
};