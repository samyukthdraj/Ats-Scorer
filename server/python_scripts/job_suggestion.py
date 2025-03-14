import sys
import json
import re
import os

def clean_location_input(location_string):
    """
    Cleans the location input string by removing special characters and extra spaces,
    and converting it to a standard format.
    """
    # Remove any character that is not a letter, number, space, or comma
    cleaned_string = re.sub(r'[^a-zA-Z0-9\s,]', '', location_string)
    # Replace multiple spaces with a single space
    cleaned_string = re.sub(r'\s+', ' ', cleaned_string).strip()
    return cleaned_string

def fetch_sample_jobs(role, location):
    """
    Returns sample job data for testing purposes.
    In a production environment, you would fetch real job data.
    """
    return [
        {
            "title": f"{role} at Sample Company",
            "company": "Sample Company",
            "location": location,
            "salary": "$80,000 - $120,000 per year",
            "url": "https://example.com/job1"
        },
        {
            "title": f"Senior {role}",
            "company": "Another Company",
            "location": location,
            "salary": "$100,000 - $150,000 per year",
            "url": "https://example.com/job2"
        },
        {
            "title": f"Junior {role}",
            "company": "Startup Inc.",
            "location": location,
            "salary": "$60,000 - $80,000 per year",
            "url": "https://example.com/job3"
        }
    ]

def fetch_jobs(resume_text, location, role, max_jobs=5):
    """
    Fetches job listings based on the resume text, location, and role.
    For development purposes, we're using sample data.
    """
    try:
        # In a real application, you would make an API call to a job service here
        # For now, we'll return sample data
        return fetch_sample_jobs(role, location)
    except Exception as e:
        print(f"An error occurred: {e}", file=sys.stderr)
        return []

if __name__ == "__main__":
    # Check if the correct number of arguments are provided
    if len(sys.argv) < 3:
        print("Usage: job_suggestion.py <resume_file_path> <location> <role>", file=sys.stderr)
        sys.exit(1)

    # Extract arguments from command line
    resume_file_path = sys.argv[1]
    location = sys.argv[2]
    role = sys.argv[3] if len(sys.argv) > 3 else "Software Developer"

    # Read resume text from file
    # In a production system, you'd extract text from the resume file
    try:
        with open(resume_file_path, 'r', encoding='utf-8', errors='ignore') as f:
            resume_text = f.read()
    except Exception as e:
        print(f"Error reading resume file: {e}", file=sys.stderr)
        # Provide a fallback if file can't be read
        resume_text = "Developer with experience in JavaScript and React"
    
    # Clean the location input
    cleaned_location = clean_location_input(location)

    # Fetch job suggestions
    job_suggestions = fetch_jobs(resume_text, cleaned_location, role)

    # Output job suggestions as JSON
    print(json.dumps(job_suggestions))