from django.urls import path

from .views import MentorSettingsView, LearnerProgressDashboardView


urlpatterns = [
    path(
        'settings/',
        MentorSettingsView.as_view(),
        name='mentor-settings'
    ),
    path(
        'dashboard/',
        LearnerProgressDashboardView.as_view(),
        name='learner-progress-dashboard'
    )
]