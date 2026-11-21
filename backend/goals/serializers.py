
from rest_framework import serializers
from .models import Goal, Topic, TopicPrerequisite
from django.shortcuts import get_object_or_404

class GoalSerializer(serializers.ModelSerializer):

    class Meta:
        model = Goal
        fields = [
            'id',
            'user',
            'title',
            'description',
            'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']


from .models import Goal, Topic


class TopicSerializer(serializers.ModelSerializer):

    is_unlocked = serializers.SerializerMethodField()
    missing_prerequisites = serializers.SerializerMethodField()

    class Meta:
        model = Topic
        fields = [
            'id',
            'goal',
            'title',
            'description',
            'is_completed',
            'created_at',
            'is_unlocked',
            'missing_prerequisites'
        ]

        read_only_fields = [
            'id',
            'goal',
            'is_completed',
            'created_at',
            'is_unlocked',
            'missing_prerequisites'
        ]

    def get_missing_prerequisites(self, obj):

        links = obj.prerequisite_links.select_related(
            'prerequisite'
        ).all()

        missing = []

        for link in links:

            if not link.prerequisite.is_completed:

                missing.append({
                    'id': link.prerequisite.id,
                    'title': link.prerequisite.title
                })

        return missing

    def get_is_unlocked(self, obj):

        missing = self.get_missing_prerequisites(obj)

        return len(missing) == 0


class TopicPrerequisiteSerializer(serializers.ModelSerializer):

    class Meta:
        model = TopicPrerequisite
        fields = ['id', 'topic', 'prerequisite']
        read_only_fields = ['id', 'topic']

    def validate(self, data):
        topic_id = self.context['view'].kwargs['topic_id']
        topic = get_object_or_404(Topic, id=topic_id)

        prerequisite = data['prerequisite']

        # Prevent self-dependency
        if topic.id == prerequisite.id:
            raise serializers.ValidationError(
                "A topic cannot be its own prerequisite."
            )

        # Both topics must belong to the same goal
        if topic.goal_id != prerequisite.goal_id:
            raise serializers.ValidationError(
                "Both topics must belong to the same goal."
            )

        # Prevent duplicate prerequisites
        exists = TopicPrerequisite.objects.filter(
            topic=topic,
            prerequisite=prerequisite
        ).exists()

        if exists:
            raise serializers.ValidationError(
                "This prerequisite already exists."
            )

        # Prevent circular dependencies
        visited = set()
        stack = [prerequisite]

        while stack:
            current = stack.pop()

            if current.id == topic.id:
                raise serializers.ValidationError(
                    "Circular prerequisite dependency is not allowed."
                )

            if current.id in visited:
                continue

            visited.add(current.id)

            required_ids = TopicPrerequisite.objects.filter(
                topic=current
            ).values_list('prerequisite_id', flat=True)

            for required_id in required_ids:
                stack.append(
                    Topic.objects.get(id=required_id)
                )

        return data 


class RecentGoalSerializer(serializers.ModelSerializer):

    total_topics = serializers.IntegerField(read_only=True)
    completed_topics = serializers.IntegerField(read_only=True)

    class Meta:
        model = Goal
        fields = [
            'id',
            'title',
            'description',
            'created_at',
            'total_topics',
            'completed_topics'
        ]