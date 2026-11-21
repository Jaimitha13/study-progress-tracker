from django.urls import path

from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    ProfileView,
    LearnerListView,
    MentorDashboardView,
    LearnerProgressView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),

    path('learners/', LearnerListView.as_view(), name='learner-list'),
    path(
        'mentor/dashboard/',
        MentorDashboardView.as_view(),
        name='mentor-dashboard'
    ),
    path(
        'learners/<int:pk>/progress/',
        LearnerProgressView.as_view(),
        name='learner-progress'
    ),
]