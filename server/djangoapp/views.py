# Django imports
from django.contrib.auth.models import User
from django.contrib.auth import logout, login, authenticate
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# App models
from .models import CarMake, CarModel
from .populate import initiate  # uncomment if you have an initiate() function

from .restapis import get_request, analyze_review_sentiments, post_review

# Logging
import logging
import json

logger = logging.getLogger(__name__)


# -----------------------------
# Authentication Views
# -----------------------------

@csrf_exempt
def login_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=405)

    try:
        data = json.loads(request.body)
    except Exception as e:
        return JsonResponse({"error": f"Invalid JSON: {e}"}, status=400)

    username = data.get('userName')
    password = data.get('password')

    if not username or not password:
        return JsonResponse({"error": "Username and password required"}, status=400)

    user = authenticate(username=username, password=password)

    if user is not None:
        login(request, user)
        return JsonResponse({"userName": username, "status": "Authenticated"})
    else:
        return JsonResponse({"error": "Invalid credentials"}, status=401)


@csrf_exempt
def logout_user(request):
    logout(request)
    return JsonResponse({"userName": ""})


@csrf_exempt
def registration(request):
    try:
        data = json.loads(request.body)
        username = data['userName']
        password = data['password']
        first_name = data['firstName']
        last_name = data['lastName']
        email = data['email']
    except Exception as e:
        return JsonResponse({"error": f"Invalid JSON or missing fields: {e}"}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({"userName": username, "error": "Already Registered"})

    user = User.objects.create_user(
        username=username,
        first_name=first_name,
        last_name=last_name,
        password=password,
        email=email
    )
    login(request, user)
    return JsonResponse({"userName": username, "status": "Authenticated"})


# -----------------------------
# Cars View (your exact code)
# -----------------------------

@csrf_exempt
def get_cars(request):
    # Populate database if either CarMake or CarModel is empty
    if CarMake.objects.count() == 0 or CarModel.objects.count() == 0:
        print("Populating CarMake and CarModel tables...")
        initiate()  # Populate both tables

    # Fetch all car models with related car make
    car_models = CarModel.objects.select_related('car_make')

    # Build a list of cars
    cars = [{"CarModel": cm.name, "CarMake": cm.car_make.name} for cm in car_models]

    print(f"Returning {len(cars)} cars")  # Debugging
    return JsonResponse({"CarModels": cars})


# -----------------------------
# Placeholder views for future features
# -----------------------------

# def get_dealerships(request):
# Update the `get_dealerships` render list of dealerships all by default, particular state if state is passed
def get_dealerships(request, state="All"):
    if state == "All":
        endpoint = "/fetchDealers/"
    else:
        endpoint = f"/fetchDealers/{state}"

    response = get_request(endpoint)

    # Ensure dealers_list is always an array
    if response and isinstance(response, dict):
        dealers_list = response.get("dealers") or []
    else:
        dealers_list = []

    return JsonResponse({"status": 200, "dealers": dealers_list})

# def get_dealer_reviews(request, dealer_id):


def get_dealer_reviews(request, dealer_id):
    # if dealer id has been provided
    if (dealer_id):
        endpoint = "/fetchReviews/dealer/" + str(dealer_id)
        reviews = get_request(endpoint)
        for review_detail in reviews:
            response = analyze_review_sentiments(review_detail['review'])
            print(response)
            review_detail['sentiment'] = response['sentiment']
        return JsonResponse({"status": 200, "reviews": reviews})
    else:
        return JsonResponse({"status": 400, "message": "Bad Request"})

# def get_dealer_details(request, dealer_id):


def get_dealer_details(request, dealer_id):
    if dealer_id:
        endpoint = "/fetchDealer/" + str(dealer_id)
        dealership = get_request(endpoint)

        # Always wrap in list
        dealer_list = dealership if isinstance(dealership, list) else [dealership]

        return JsonResponse({"status": 200, "dealer": dealer_list})
    return JsonResponse({"status": 400, "message": "Bad Request"})

# def add_review(request):


@csrf_exempt
def add_review(request):
    if request.method != "POST":
        return JsonResponse({"status": 400, "message": "POST required"})

    try:
        data = json.loads(request.body)
    except Exception as e:
        return JsonResponse({"status": 400, "message": f"Invalid JSON: {e}"})

    response = post_review(data)

    if response and response.get("status") == 200:
        return JsonResponse({"status": 200})
    else:
        return JsonResponse({"status": 500, "message": response.get("message", "Error posting review")})
