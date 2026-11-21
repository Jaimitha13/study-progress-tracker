from rest_framework import generics, permissions

from .models import AppSettings
from .serializers import AppSettingsSerializer
from datetime import timedelta

from django.db.models import Sum
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response

from goals.models import Goal, Topic
from sessions.models import StudySession

class IsMentor(permissions.BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'mentor'
        )


class MentorSettingsView(generics.RetrieveUpdateAPIView):

    serializer_class = AppSettingsSerializer

    permission_classes = [
        permissions.IsAuthenticated,
        IsMentor
    ]

    def get_object(self):

        settings, created = AppSettings.objects.get_or_create(
            pk=1,
            defaults={
                'min_session_minutes': 5,
                'max_session_minutes': 480,
                'max_prerequisites': 5
            }
        )

        return settings




class LearnerProgressDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):

        if getattr(request.user, 'role', None) != 'learner':
            return Response(
                {"error": "Only learners can access the progress dashboard."},
                status=403
            )

        user = request.user

        # Goals and topics
        goals = Goal.objects.filter(user=user)
        topics = Topic.objects.filter(goal__user=user)

        total_goals = goals.count()
        total_topics = topics.count()

        completed_topics = topics.filter(is_completed=True).count()
        pending_topics = total_topics - completed_topics

        # Completion percentage
        completion_percentage = (
            round((completed_topics / total_topics) * 100, 2)
            if total_topics > 0 else 0
        )

        # Total study minutes
        sessions = StudySession.objects.filter(user=user)

        total_study_minutes = sessions.aggregate(
            total=Sum('minutes')
        )['total'] or 0

        # Current week: Monday to today
        today = timezone.localdate()
        week_start = today - timedelta(days=today.weekday())

        weekly_study_minutes = sessions.filter(
            date__gte=week_start,
            date__lte=today
        ).aggregate(
            total=Sum('minutes')
        )['total'] or 0

        return Response({
            "total_goals": total_goals,
            "total_topics": total_topics,
            "completed_topics": completed_topics,
            "pending_topics": pending_topics,
            "completion_percentage": completion_percentage,
            "total_study_minutes": total_study_minutes,
            "weekly_study_minutes": weekly_study_minutes
        })