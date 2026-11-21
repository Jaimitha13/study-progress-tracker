from django.contrib import admin
from .models import Goal, Topic, TopicPrerequisite

admin.site.register(Goal)
admin.site.register(Topic)
admin.site.register(TopicPrerequisite)