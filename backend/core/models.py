
from django.db import models


class AppSettings(models.Model):

    min_session_minutes = models.PositiveIntegerField(default=5)

    max_session_minutes = models.PositiveIntegerField(default=480)

    max_prerequisites = models.PositiveIntegerField(default=5)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Application Settings"
