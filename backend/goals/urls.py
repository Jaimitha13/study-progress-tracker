
from django.urls import path
from .views import GoalListCreateView,TopicListCreateView, TopicPrerequisiteListCreateView,TopicPrerequisiteDeleteView, GoalDetailView,GoalUpdateView,GoalDeleteView,TopicDetailView,TopicUpdateView,TopicDeleteView,TopicCompleteView,TopicReopenView
from .views import DashboardView


urlpatterns = [
    path('', GoalListCreateView.as_view(), name='goal-list-create'),
    path('<int:pk>/', GoalDetailView.as_view(), name='goal-detail'),
    path('<int:pk>/update/', GoalUpdateView.as_view(), name='goal-update'),
     path('<int:pk>/delete/', GoalDeleteView.as_view(), name='goal-delete'),
     path('<int:goal_id>/topics/', TopicListCreateView.as_view(), name='topic-list-create'),

# Retrieve Topic
path(
    'topics/detail/<int:pk>/',
    TopicDetailView.as_view(),
    name='topic-detail'
),

# Update Topic
path(
    'topics/<int:pk>/update/',
    TopicUpdateView.as_view(),
    name='topic-update'
),

# Delete Topic
path(
    'topics/<int:pk>/delete/',
    TopicDeleteView.as_view(),
    name='topic-delete'
),

path(
    'topics/<int:pk>/complete/',
    TopicCompleteView.as_view(),
    name='topic-complete'
),

path(
    'topics/<int:pk>/reopen/',
    TopicReopenView.as_view(),
    name='topic-reopen'
),

      path(
        'topics/<int:topic_id>/prerequisites/',
        TopicPrerequisiteListCreateView.as_view(),
        name='topic-prerequisite-list-create'
    ),

    path(
    'topics/<int:topic_id>/prerequisites/<int:pk>/',
    TopicPrerequisiteDeleteView.as_view(),
    name='topic-prerequisite-delete'
),

path(
    'dashboard/',
    DashboardView.as_view(),
    name='learner-dashboard'
),
]
