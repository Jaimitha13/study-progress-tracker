
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    ROLE_CHOICES = (
        ('learner', 'Learner'),
        ('mentor', 'Mentor'),
    )

    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='learner'
    )

    mentor = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_learners',
        limit_choices_to={'role': 'mentor'}
    )

    def __str__(self):
        return self.username
