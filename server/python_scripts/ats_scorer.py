# server/python_scripts_ats_scorer.py

import subprocess
import json
import os
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import pypdf
from docx import Document
import re
import sys

# Ensure required NLTK resources are downloaded
try:
    nltk.data.find('corpora/stopwords')
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('stopwords')
    nltk.download('punkt')

def extract_text_from_resume(file_path):
    """Extracts text from a PDF or DOCX file."""
    try:
        if file_path.lower().endswith('.pdf'):
            try:
                with open(file_path, 'rb') as file:
                    reader = pypdf.PdfReader(file)
                    text = ""
                    for page in reader.pages:
                        text += page.extract_text() or ""
                    if not text.strip():
                        return "Empty PDF or unreadable content"
                    return text
            except Exception as pdf_error:
                print(f"Error extracting text from PDF: {pdf_error}", file=sys.stderr)
                return f"Error extracting text: {str(pdf_error)}"
        elif file_path.lower().endswith('.docx'):
            try:
                doc = Document(file_path)
                text = '\n'.join([paragraph.text for paragraph in doc.paragraphs])
                return text
            except Exception as docx_error:
                print(f"Error extracting text from DOCX: {docx_error}", file=sys.stderr)
                return f"Error extracting text: {str(docx_error)}"
        else:
            return "Unsupported file type. Only PDF and DOCX files are supported."
    except Exception as e:
        print(f"General error extracting text from resume: {e}", file=sys.stderr)
        return f"Error processing file: {str(e)}"
def clean_text(text):
    """Cleans the text by removing special characters, extra spaces, and converting to lowercase."""
    text = re.sub(r'[^a-zA-Z\s]', '', text)  # Remove special characters and numbers
    text = re.sub(r'\s+', ' ', text).strip()  # Remove extra spaces
    return text.lower()

def extract_keywords_from_job_description(job_description):
    """Extracts keywords from the job description using NLTK."""
    stop_words = set(stopwords.words('english'))
    word_tokens = word_tokenize(job_description)
    keywords = [w for w in word_tokens if w not in stop_words]
    return keywords

def analyze_keywords(text, keywords):
    """Analyzes the text for keyword matches and frequency."""
    keyword_matches = []
    for term in keywords:
        count = text.lower().count(term.lower())
        found = count > 0
        keyword_matches.append({"term": term, "found": found, "frequency": count})
    return keyword_matches

def calculate_keyword_score(keyword_matches):
    """Calculates a keyword score based on the number of keywords found."""
    total_keywords = len(keyword_matches)
    found_keywords = sum(1 for match in keyword_matches if match["found"])
    if total_keywords == 0:
        return 0  # Avoid division by zero
    return (found_keywords / total_keywords) * 100

def analyze_resume(resume_path, job_description_path, location, role):
    """Main function to analyze the resume against a job description."""
    # Extract text from resume
    resume_text = extract_text_from_resume(resume_path)
    cleaned_resume_text = clean_text(resume_text)

    # Validate that resume_text is not empty
    if not cleaned_resume_text:
        return {
            "atsScore": 0,
            "keywordScore": 0,
            "skillScore": 0,
            "experienceScore": 0,
            "formattingScore": 0,
            "grammarScore": 0,
            "resumeLengthScore": 0,
            "recommendations": ["Unable to extract text from the resume. Ensure the file is not corrupted."],
            "keywordMatches": [],
            "formattingIssues": [],
            "experienceGapAnalysis": [],
            "skillGaps": [],
            "quantifiableAchievements": [],
            "actionVerbs": [],
            "resumeLength": "",
            "customSections": [],
            "summaryAnalysis": [],
            "educationAnalysis": [],
            "contactInformation": [],
            "technicalSkills": [],
            "softSkills": [],
            "certifications": [],
            "awards": [],
            "projects": [],
            "leadership": [],
            "publications": [],
            "volunteerExperience": [],
            "militaryExperience": [],
            "references": [],
            "grammar": [],
            "buzzwords": [],
            "negativeKeywords": []
        }

    # Read job description from file
    with open(job_description_path, 'r') as file:
        job_description = file.read()

    job_description = clean_text(job_description)  # Clean the job description as well
    keywords = extract_keywords_from_job_description(job_description)
    keyword_matches = analyze_keywords(cleaned_resume_text, keywords)
    keyword_score = calculate_keyword_score(keyword_matches)

    # Placeholder scores and analysis (replace with real logic)
    skill_score = 70
    experience_score = 80
    formatting_score = 90
    grammar_score = 95
    resume_length_score = 85

    # Calculate the overall ATS score (you can adjust the weights as needed)
    ats_score = (0.25 * keyword_score +
                 0.20 * skill_score +
                 0.15 * experience_score +
                 0.15 * formatting_score +
                 0.10 * grammar_score +
                 0.05 * resume_length_score)

    analysis_results = {
        "atsScore": round(ats_score, 2),
        "keywordScore": round(keyword_score, 2),
        "skillScore": skill_score,
        "experienceScore": experience_score,
        "formattingScore": formatting_score,
        "grammarScore": grammar_score,
        "resumeLengthScore": resume_length_score,
        "recommendations": ["Review keyword usage.", "Check formatting."],
        "keywordMatches": keyword_matches,
        "formattingIssues": [],
        "experienceGapAnalysis": [],
        "skillGaps": [],
        "quantifiableAchievements": [],
        "actionVerbs": [],
        "resumeLength": "",
        "customSections": [],
        "summaryAnalysis": [],
        "educationAnalysis": [],
        "contactInformation": [],
        "technicalSkills": [],
        "softSkills": [],
        "certifications": [],
        "awards": [],
        "projects": [],
        "leadership": [],
        "publications": [],
        "volunteerExperience": [],
        "militaryExperience": [],
        "references": [],
        "grammar": [],
        "buzzwords": [],
        "negativeKeywords": []
    }

    # Call the job_suggestion script and merge the results
    try:
        job_suggestion_results = get_job_suggestions(cleaned_resume_text, location, role)
        analysis_results.update(job_suggestion_results)  # Merge the dictionaries
    except Exception as e:
        print(f"Error getting job suggestions: {e}", file=sys.stderr)
        analysis_results["job_suggestions"] = []  # Ensure there's an empty list if there's an error

    return analysis_results

def get_job_suggestions(resume_text, location, role):
    """
    Calls the job_suggestion.py script and returns the results.
    This function handles the execution and communication with the external script.
    """
    try:
        # Construct the command to execute the job_suggestion.py script
        python_executable = sys.executable  # Use the same Python interpreter
        script_path = os.path.join(os.path.dirname(__file__), "job_suggestion.py")  # Ensure correct path

        # Create a temporary file with resume text
        temp_resume_file = os.path.join(os.path.dirname(__file__), "temp_resume_text.txt")
        with open(temp_resume_file, 'w') as f:
            f.write(resume_text)

        # Prepare arguments to pass to the job_suggestion.py script
        args = [python_executable, script_path, temp_resume_file, location, role]

        # Execute the job_suggestion.py script and capture the output
        process = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        stdout, stderr = process.communicate()

        # Remove the temporary file
        os.remove(temp_resume_file)

        # Check for errors during execution
        if stderr:
            print(f"Error during job_suggestion.py execution:\n{stderr}", file=sys.stderr)
            return {"job_suggestions": []}

        # Parse the JSON output from the script
        try:
            job_suggestions = json.loads(stdout)
            return {"job_suggestions": job_suggestions}
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON from job_suggestion.py: {e}", file=sys.stderr)
            print(f"Script output: {stdout}", file=sys.stderr)
            return {"job_suggestions": []}

    except FileNotFoundError:
        print("job_suggestion.py not found. Ensure it exists in the specified path.", file=sys.stderr)
        return {"job_suggestions": []}
    except Exception as e:
        print(f"An error occurred while calling job_suggestion.py: {e}", file=sys.stderr)
        return {"job_suggestions": []}

if __name__ == "__main__":
    # Check if the correct number of arguments are provided
    if len(sys.argv) != 5:
        print(f"Usage: {sys.argv[0]} <resume_path> <job_description_path> <location> <role>", file=sys.stderr)
        sys.exit(1)

    resume_path = sys.argv[1]
    job_description_path = sys.argv[2]
    location = sys.argv[3]
    role = sys.argv[4]

    # Run the analysis
    results = analyze_resume(resume_path, job_description_path, location, role)
    
    # Output the results as JSON
    print(json.dumps(results, indent=4))