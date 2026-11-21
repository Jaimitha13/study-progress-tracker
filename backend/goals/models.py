
from django.db import models
from django.conf import settings


class Goal(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='goals'
    )

    title = models.CharField(max_length=200)

    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title




class Topic(models.Model):

    goal = models.ForeignKey(
        Goal,
        on_delete=models.CASCADE,
        related_name='topics'
    )

    title = models.CharField(max_length=200)

    description = models.TextField(blank=True)

    is_completed = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title




class TopicPrerequisite(models.Model):

    topic = models.ForeignKey(
        Topic,
        on_delete=models.CASCADE,
        related_name='prerequisite_links'
    )

    prerequisite = models.ForeignKey(
        Topic,
        on_delete=models.CASCADE,
        related_name='dependent_links'
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['topic', 'prerequisite'],
                name='unique_topic_prerequisite'
            )
        ]

    def __str__(self):
        return f"{self.topic.title} requires {self.prerequisite.title}"
