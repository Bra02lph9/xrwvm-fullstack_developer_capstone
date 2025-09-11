# Uncomment the imports below before you add the function code
import requests
from dotenv import load_dotenv


load_dotenv()

# Remove trailing "/" if present, so concatenations don't create "//"
backend_url = ("http://localhost:3030").rstrip("/")
sentiment_analyzer_url = ("http://localhost:5050").rstrip("/")


# -----------------------------
# GET request to backend
# -----------------------------
def get_request(endpoint, **kwargs):
    request_url = f"{backend_url}{endpoint}"
    print(f"GET from {request_url} with params {kwargs}")
    try:
        # Using params handles URL encoding safely
        response = requests.get(request_url, params=kwargs)
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Network exception occurred: {e}")
        return None


# -----------------------------
# Analyze review sentiments
# -----------------------------
def analyze_review_sentiments(text):
    request_url = f"{sentiment_analyzer_url}/analyze/"
    try:
        # Pass text as query param instead of concatenating in URL
        response = requests.get(request_url, params={"text": text})
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Network exception occurred: {e}")
        return None


# -----------------------------
# Post review to backend
# -----------------------------
def post_review(data_dict):
    request_url = f"{backend_url}/insert_review"
    try:
        response = requests.post(request_url, json=data_dict, timeout=5)
        response.raise_for_status()  # Raise exception for HTTP errors
        res_json = response.json()
        print("Node response:", res_json)
        return res_json
    except requests.exceptions.RequestException as e:
        print(f"Network exception occurred: {e}")
        return {"status": 500, "message": str(e)}
    except ValueError as e:
        print(f"Invalid JSON from Node: {e}")
        return {"status": 500, "message": "Invalid JSON from Node"}
