# Django imports
from django.contrib.auth.models import User
from django.contrib.auth import logout, login, authenticate
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# App models
from .models import CarMake, CarModel
from .populate import initiate  # uncomment if you have an initiate() function

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
#     pass

# def get_dealer_reviews(request, dealer_id):
#     pass

# def get_dealer_details(request, dealer_id):
#     pass

# def add_review(request):
#     pass
