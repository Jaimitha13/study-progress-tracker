from django.shortcuts import get_object_or_404
from django.db.models import Sum

from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .permissions import IsMentor
from .serializers import RegisterSerializer, UserProfileSerializer

from goals.models import Goal, Topic
from sessions.models import StudySession
from sessions.serializers import MentorStudySessionSerializer
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class LoginView(ObtainAuthToken):

    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):

        serializer = self.serializer_class(
            data=request.data,
            context={'request': request}
        )

        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']

        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user_id': user.id,
            'username': user.username,
            'role': user.role
        })


class LogoutView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        Token.objects.filter(user=request.user).delete()

        return Response({
            'message': 'Successfully logged out.'
        })



class ProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        serializer = UserProfileSerializer(request.user)

        return Response(serializer.data)



class LearnerListView(generics.ListAPIView):

    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated, IsMentor]

    def get_queryset(self):
        return User.objects.filter(
            role='learner',
            mentor=self.request.user
        ).order_by('username')


class MentorDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsMentor]

    def get(self, request):
        learners = User.objects.filter(
            role='learner',
            mentor=request.user
        )

        learner_ids = learners.values_list('id', flat=True)

        total_learners = learners.count()

        total_goals = Goal.objects.filter(
            user__in=learner_ids
        ).count()

        total_topics = Topic.objects.filter(
            goal__user__in=learner_ids
        ).count()

        completed_topics = Topic.objects.filter(
            goal__user__in=learner_ids,
            is_completed=True
        ).count()

        pending_topics = total_topics - completed_topics

        completion_percentage = (
            round((completed_topics / total_topics) * 100, 2)
            if total_topics else 0
        )

        total_study_minutes = StudySession.objects.filter(
            user__in=learner_ids
        ).aggregate(total=Sum('minutes'))['total'] or 0

        students = []

        for learner in learners:
            goals = Goal.objects.filter(user=learner)
            topics = Topic.objects.filter(goal__user=learner)

            topic_count = topics.count()
            completed_count = topics.filter(is_completed=True).count()

            percentage = (
                round((completed_count / topic_count) * 100, 2)
                if topic_count else 0
            )

            study_minutes = StudySession.objects.filter(
                user=learner
            ).aggregate(total=Sum('minutes'))['total'] or 0

            students.append({
                'id': learner.id,
                'username': learner.username,
                'email': learner.email,
                'total_goals': goals.count(),
                'total_topics': topic_count,
                'completed_topics': completed_count,
                'pending_topics': topic_count - completed_count,
                'completion_percentage': percentage,
                'total_study_minutes': study_minutes,
            })

        return Response({
            'mentor': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
            },
            'summary': {
                'total_learners': total_learners,
                'total_goals': total_goals,
                'total_topics': total_topics,
                'completed_topics': completed_topics,
                'pending_topics': pending_topics,
                'completion_percentage': completion_percentage,
                'total_study_minutes': total_study_minutes,
            },
            'students': students,
        })

class LearnerProgressView(APIView):
    permission_classes = [IsAuthenticated, IsMentor]

    def get(self, request, pk):
        learner = get_object_or_404(
            User,
            pk=pk,
            role='learner',
            mentor=request.user
        )

        goals = Goal.objects.filter(
            user=learner
        ).prefetch_related('topics').order_by('-created_at')

        goal_data = []

        total_topics = 0
        completed_topics = 0

        for goal in goals:
            topics = goal.topics.all()

            topic_list = []

            for topic in topics:
                topic_list.append({
                    'id': topic.id,
                    'title': topic.title,
                    'description': topic.description,
                    'is_completed': topic.is_completed,
                    'created_at': topic.created_at,
                })

                total_topics += 1

                if topic.is_completed:
                    completed_topics += 1

            goal_data.append({
                'id': goal.id,
                'title': goal.title,
                'description': goal.description,
                'created_at': goal.created_at,
                'topics': topic_list,
            })

        sessions = StudySession.objects.filter(
            user=learner
        ).select_related(
            'topic',
            'topic__goal'
        ).order_by('-date', '-created_at')

        total_study_minutes = sessions.aggregate(
            total=Sum('minutes')
        )['total'] or 0

        percentage = (
            round((completed_topics / total_topics) * 100, 2)
            if total_topics else 0
        )

        return Response({
            'student': {
                'id': learner.id,
                'username': learner.username,
                'email': learner.email,
            },
            'summary': {
                'total_goals': goals.count(),
                'total_topics': total_topics,
                'completed_topics': completed_topics,
                'pending_topics': total_topics - completed_topics,
                'completion_percentage': percentage,
                'total_study_minutes': total_study_minutes,
            },
            'goals': goal_data,
            'study_sessions': MentorStudySessionSerializer(
    sessions,
    many=True
).data,
        })