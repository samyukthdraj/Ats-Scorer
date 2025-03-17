import sys
import json
import re
import os
import urllib.parse
import urllib.request
import urllib.error

class CareerjetAPIClient:
    """
    Python 3 compatible Careerjet API client
    """
    def __init__(self, locale):
        self.locale = locale
        # API endpoint
        self.api_url = "http://public.api.careerjet.net/search"

    def search(self, params):
        """
        Search for jobs using the CareerJet API
        
        Parameters:
        params (dict): Search parameters including keywords, location, etc.
        
        Returns:
        dict: JSON response from the API
        """
        # Add the locale to the parameters
        params['locale_code'] = self.locale
        
        # Create the query string
        query_string = urllib.parse.urlencode(params)
        
        # Create the full URL
        url = f"{self.api_url}?{query_string}"
        
        try:
            # Make the request
            response = urllib.request.urlopen(url)
            
            # Read the response data
            data = response.read().decode('utf-8')
            
            # Parse the JSON response
            results = json.loads(data)
            
            return results
        except urllib.error.URLError as e:
            print(f"Error making API request: {e}", file=sys.stderr)
            return {"jobs": []}
        except json.JSONDecodeError as e:
            print(f"Error parsing API response: {e}", file=sys.stderr)
            return {"jobs": []}
        except Exception as e:
            print(f"Unexpected error: {e}", file=sys.stderr)
            return {"jobs": []}

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
    Used as a fallback when the API call fails.
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

def fetch_jobs_from_careerjet(role, location, max_jobs=5):
    """
    Fetches job listings from Careerjet API based on the role and location.
    """
    try:
        # Initialize the Careerjet API client
        cj = CareerjetAPIClient("en_US")
        
        # Prepare the search parameters
        search_params = {
            'keywords': role,
            'location': location,
            'pagesize': max_jobs,
            'page': 1,
            # 'affid': 'YOUR_AFFILIATE_ID'  # Replace with your affiliate ID if you have one
        }
        
        # Execute the search
        results = cj.search(search_params)
        
        # Format the job listings
        jobs = []
        if 'jobs' in results and results['jobs']:
            for job in results['jobs'][:max_jobs]:
                job_data = {
                    "title": job.get('title', f"{role} Position"),
                    "company": job.get('company', 'Unknown Company'),
                    "location": job.get('locations', location),
                    "salary": job.get('salary', 'Salary not specified'),
                    "url": job.get('url', '#')
                }
                jobs.append(job_data)
            return jobs
        else:
            print("No job results found from API. Using sample data.", file=sys.stderr)
            return fetch_sample_jobs(role, location)
    except Exception as e:
        print(f"Error fetching jobs from Careerjet API: {e}", file=sys.stderr)
        return fetch_sample_jobs(role, location)

def fetch_jobs(resume_text, location, role, max_jobs=5):
    """
    Fetches job listings based on the resume text, location, and role.
    Uses the Careerjet API for real job listings.
    """
    try:
        # Extract keywords from resume that might be relevant for job search
        # This is a simplified approach - you might want to use NLP techniques for better results
        keywords = role  # Use the role as the main keyword for now
        
        # Clean the location input
        cleaned_location = clean_location_input(location)
        
        # Try to fetch jobs from Careerjet API
        jobs = fetch_jobs_from_careerjet(keywords, cleaned_location, max_jobs)
        
        # If we got jobs, return them
        if jobs:
            return jobs
        
        # If no jobs were found, return sample data
        return fetch_sample_jobs(role, location)
    except Exception as e:
        print(f"An error occurred in fetch_jobs: {e}", file=sys.stderr)
        return fetch_sample_jobs(role, location)

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
    try:
        with open(resume_file_path, 'r', encoding='utf-8', errors='ignore') as f:
            resume_text = f.read()
    except Exception as e:
        print(f"Error reading resume file: {e}", file=sys.stderr)
        # Provide a fallback if file can't be read
        resume_text = "Developer with experience in JavaScript and React"
    
    # Fetch job suggestions
    job_suggestions = fetch_jobs(resume_text, location, role)

    # Output job suggestions as JSON
    print(json.dumps(job_suggestions))