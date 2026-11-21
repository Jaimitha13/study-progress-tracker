
from django.urls import path

from .views import (
    StudySessionListCreateView,
    StudySessionDetailView
)

urlpatterns = [
    path('', StudySessionListCreateView.as_view(), name='session-list-create'),
    path('<int:pk>/', StudySessionDetailView.as_view(), name='session-detail'),
]
