
from django.shortcuts import render

def loadingscreen(request):
    return render(request, 'loadingscreen.html')

def login(request):
    return render(request, 'login.html')

def register(request):
    return render(request, 'register.html')

def home(request):
    return render(request, 'home.html')

def universities(request):
    return render(request, 'universities.html')

def tehnologii(request):
    return render(request, 'tehnologii.html')

def chatbot(request):
    return render(request, 'chatbot.html')

def galerie(request):
    return render(request, 'galerie.html')
