
from django.urls import path
from . import views

urlpatterns = [
    path('', views.loadingscreen, name='loadingscreen'),
    path('login/', views.login, name='login'),
    path('register/', views.register, name='register'),
    path('home/', views.home, name='home'),
    path('universities/', views.universities, name='universities'),
    path('tehnologii/', views.tehnologii, name='tehnologii'),
    path('chatbot/', views.chatbot, name='chatbot'),
    path('galerie/', views.galerie, name='galerie'),
    path('meals/', views.meals, name='meals'),
]
