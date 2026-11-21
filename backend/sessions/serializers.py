
from rest_framework import serializers
from django.utils import timezone

from .models import StudySession


# Learner Study Session Serializer
class StudySessionSerializer(serializers.ModelSerializer):

    class Meta:
        model = StudySession
        fields = [
            'id',
            'user',
            'topic',
            'date',
            'minutes',
            'note',
            'created_at'
        ]

        read_only_fields = [
            'id',
            'user',
            'created_at'
        ]

    # Validate study date
    def validate_date(self, value):

        if value > timezone.localdate():
            raise serializers.ValidationError(
                "Study date cannot be in the future."
            )

        return value

    # Validate topic ownership
    def validate_topic(self, value):

        request = self.context.get('request')

        if request and value.goal.user_id != request.user.id:
            raise serializers.ValidationError(
                "You can only record sessions for your own topics."
            )

        return value

    # Validate session duration
    def validate_minutes(self, value):

        # Import here to avoid circular imports
        from core.models import AppSettings

        settings = AppSettings.objects.filter(pk=1).first()

        min_minutes = settings.min_session_minutes if settings else 5
        max_minutes = settings.max_session_minutes if settings else 480

        if value < min_minutes:
            raise serializers.ValidationError(
                f"Study session must be at least {min_minutes} minutes."
            )

        if value > max_minutes:
            raise serializers.ValidationError(
                f"Study session cannot exceed {max_minutes} minutes."
            )

        return value


# Recent Study Sessions Serializer
class RecentStudySessionSerializer(serializers.ModelSerializer):

    topic_title = serializers.CharField(
        source='topic.title',
        read_only=True
    )

    goal_title = serializers.CharField(
        source='topic.goal.title',
        read_only=True
    )

    class Meta:
        model = StudySession
        fields = [
            'id',
            'topic_title',
            'goal_title',
            'date',
            'minutes',
            'note'
        ]


# Mentor Study Session Serializer
# Read-only information for assigned learners
class MentorStudySessionSerializer(serializers.ModelSerializer):

    topic_title = serializers.CharField(
        source='topic.title',
        read_only=True
    )

    goal_title = serializers.CharField(
        source='topic.goal.title',
        read_only=True
    )

    class Meta:
        model = StudySession
        fields = [
            'id',
            'topic_title',
            'goal_title',
            'date',
            'minutes',
            'note',
            'created_at'
        ]
