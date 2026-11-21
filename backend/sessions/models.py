
from django.db import models
from django.conf import settings
from goals.models import Topic


class StudySession(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='study_sessions'
    )

    topic = models.ForeignKey(
        Topic,
        on_delete=models.CASCADE,
        related_name='study_sessions'
    )

    date = models.DateField()

    minutes = models.PositiveIntegerField()

    note = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.topic.title} - {self.minutes} minutes"
