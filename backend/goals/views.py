
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
from .models import Goal, Topic, TopicPrerequisite
from .serializers import GoalSerializer, TopicSerializer,TopicPrerequisiteSerializer,  RecentGoalSerializer
from sessions.serializers import RecentStudySessionSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.db import transaction
from core.models import AppSettings
from rest_framework import serializers
from django.db.models import Sum, Count, Q
from sessions.models import StudySession

class GoalListCreateView(generics.ListCreateAPIView):

    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        if user.role == 'mentor':
            return Goal.objects.all()

        return Goal.objects.filter(user=user)

    def perform_create(self, serializer):

        if self.request.user.role != 'learner':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                "Only learners can create goals."
            )

        serializer.save(user=self.request.user)

class TopicListCreateView(generics.ListCreateAPIView):
    serializer_class = TopicSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        goal = get_object_or_404(Goal, id=self.kwargs['goal_id'])

        if self.request.user.role == 'mentor':
            return Topic.objects.filter(goal=goal)

        if goal.user != self.request.user:
            raise PermissionDenied("You cannot view this goal's topics.")

        return Topic.objects.filter(goal=goal)

    def perform_create(self, serializer):
        goal = get_object_or_404(Goal, id=self.kwargs['goal_id'])

        if self.request.user.role != 'learner':
            raise PermissionDenied("Only learners can create topics.")

        if goal.user != self.request.user:
            raise PermissionDenied("You can only add topics to your own goals.")

        serializer.save(goal=goal)

class TopicPrerequisiteListCreateView(generics.ListCreateAPIView):
    serializer_class = TopicPrerequisiteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        topic_id = self.kwargs['topic_id']
        topic = get_object_or_404(Topic, id=topic_id)

        if self.request.user.role == 'mentor':
            return TopicPrerequisite.objects.filter(topic=topic)

        if topic.goal.user != self.request.user:
            raise PermissionDenied(
                "You cannot view prerequisites for this topic."
            )

        return TopicPrerequisite.objects.filter(topic=topic)

    def perform_create(self, serializer):
        topic = get_object_or_404(
            Topic,
            id=self.kwargs['topic_id']
        )

        if self.request.user.role != 'learner':
            raise PermissionDenied(
                "Only learners can create prerequisites."
            )

        if topic.goal.user != self.request.user:
            raise PermissionDenied(
                "You can only manage prerequisites for your own topics."
            )

        # Get the latest mentor settings
        settings = AppSettings.objects.filter(pk=1).first()

        max_prerequisites = (
            settings.max_prerequisites if settings else 5
        )

        # Count existing prerequisites
        current_count = TopicPrerequisite.objects.filter(
            topic=topic
        ).count()

        # Check the maximum limit
        if current_count >= max_prerequisites:
            raise serializers.ValidationError({
                "error": (
                    f"You cannot add more than "
                    f"{max_prerequisites} prerequisites to this topic."
                )
            })

        serializer.save(topic=topic)


class TopicPrerequisiteDeleteView(generics.DestroyAPIView):
    serializer_class = TopicPrerequisiteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        if self.request.user.role != 'learner':
            raise PermissionDenied(
                "Only learners can delete their prerequisites."
            )

        topic = get_object_or_404(
            Topic,
            id=self.kwargs['topic_id'],
            goal__user=self.request.user
        )

        return TopicPrerequisite.objects.filter(topic=topic)   



class GoalDetailView(generics.RetrieveAPIView):
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'mentor':
            return Goal.objects.all()

        return Goal.objects.filter(user=user)  


class GoalUpdateView(generics.UpdateAPIView):
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

     if self.request.user.role != 'learner':
        raise PermissionDenied(
            "Mentors cannot modify or delete learner goals."
        )

     return Goal.objects.filter(user=self.request.user)


class GoalDeleteView(generics.DestroyAPIView):
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

       if self.request.user.role != 'learner':
        raise PermissionDenied(
            "Mentors cannot modify or delete learner goals."
        )

       return Goal.objects.filter(user=self.request.user)

class TopicDetailView(generics.RetrieveAPIView):
    serializer_class = TopicSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'mentor':
            return Topic.objects.all()

        return Topic.objects.filter(goal__user=user)



class TopicUpdateView(generics.UpdateAPIView):
    serializer_class = TopicSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

       if self.request.user.role != 'learner':
        raise PermissionDenied(
            "Mentors cannot modify or delete learner topics."
        )

       return Topic.objects.filter(goal__user=self.request.user)


class TopicDeleteView(generics.DestroyAPIView):
    serializer_class = TopicSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        if self.request.user.role != 'learner':
            raise PermissionDenied(
                "Mentors cannot delete learner topics."
            )

        return Topic.objects.filter(
            goal__user=self.request.user
        )





class TopicCompleteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        topic = get_object_or_404(Topic, id=pk)

        if request.user.role != 'learner':
            raise PermissionDenied(
                "Only learners can complete topics."
            )

        if topic.goal.user != request.user:
            raise PermissionDenied(
                "You can only complete your own topics."
            )

        missing = get_missing_prerequisites(topic)

        if missing:
            return Response(
                {
                    "error": "This topic is locked. Complete all prerequisites first.",
                    "missing_prerequisites": missing
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        topic.is_completed = True
        topic.save(update_fields=['is_completed'])

        return Response(
            {
                "message": "Topic completed successfully.",
                "topic": TopicSerializer(topic).data
            },
            status=status.HTTP_200_OK
        )


class TopicReopenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        topic = get_object_or_404(Topic, id=pk)

        if request.user.role != 'learner':
            raise PermissionDenied(
                "Only learners can reopen topics."
            )

        if topic.goal.user != request.user:
            raise PermissionDenied(
                "You can only reopen your own topics."
            )

        with transaction.atomic():

            topic.is_completed = False
            topic.save(update_fields=['is_completed'])

            reopen_dependent_topics(topic)

        return Response(
            {
                "message": "Topic reopened successfully. Dependent topics have been relocked.",
                "topic": TopicSerializer(topic).data
            },
            status=status.HTTP_200_OK
        )
    




def get_missing_prerequisites(topic):

    links = TopicPrerequisite.objects.filter(
        topic=topic
    ).select_related('prerequisite')

    missing = []

    for link in links:
        if not link.prerequisite.is_completed:
            missing.append({
                'id': link.prerequisite.id,
                'title': link.prerequisite.title
            })

    return missing


def reopen_dependent_topics(topic, visited=None):

    if visited is None:
        visited = set()

    if topic.id in visited:
        return

    visited.add(topic.id)

    dependent_links = TopicPrerequisite.objects.filter(
        prerequisite=topic
    ).select_related('topic')

    for link in dependent_links:

        dependent_topic = link.topic

        if dependent_topic.is_completed:
            dependent_topic.is_completed = False
            dependent_topic.save(update_fields=['is_completed'])

        reopen_dependent_topics(dependent_topic, visited)





class DashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        if user.role != 'learner':
            raise PermissionDenied(
                "Only learners can access the learner dashboard."
            )

        # Total goals
        total_goals = Goal.objects.filter(
            user=user
        ).count()

        # Total topics
        total_topics = Topic.objects.filter(
            goal__user=user
        ).count()

        # Completed topics
        completed_topics = Topic.objects.filter(
            goal__user=user,
            is_completed=True
        ).count()

        # Pending topics
        pending_topics = total_topics - completed_topics

        # Completion percentage
        completion_percentage = 0

        if total_topics > 0:
            completion_percentage = round(
                (completed_topics / total_topics) * 100,
                2
            )

        # Total study minutes
        study_data = StudySession.objects.filter(
            user=user
        ).aggregate(total=Sum('minutes'))

        total_study_minutes = study_data['total'] or 0

        # Recent 5 goals with topic counts
        recent_goals_queryset = Goal.objects.filter(
            user=user
        ).annotate(
            total_topics=Count('topics'),
            completed_topics=Count(
                'topics',
                filter=Q(topics__is_completed=True)
            )
        ).order_by('-created_at')[:5]

        recent_goals = RecentGoalSerializer(
            recent_goals_queryset,
            many=True
        ).data

        # Recent 5 study sessions
        recent_sessions_queryset = StudySession.objects.filter(
            user=user
        ).select_related(
            'topic',
            'topic__goal'
        ).order_by(
            '-date',
            '-created_at'
        )[:5]

        recent_study_sessions = RecentStudySessionSerializer(
            recent_sessions_queryset,
            many=True
        ).data

        # Dashboard response
        return Response({

            'total_goals': total_goals,
            'total_topics': total_topics,
            'completed_topics': completed_topics,
            'pending_topics': pending_topics,
            'completion_percentage': completion_percentage,
            'total_study_minutes': total_study_minutes,
            'recent_goals': recent_goals,
            'recent_study_sessions': recent_study_sessions

        }, status=status.HTTP_200_OK)
