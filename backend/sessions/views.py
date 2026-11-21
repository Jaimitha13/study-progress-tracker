
from rest_framework import generics, permissions

from .models import StudySession
from .serializers import StudySessionSerializer


# Only authenticated learners can use the Sessions API
class IsLearner(permissions.BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'learner'
        )


# GET: List sessions
# POST: Create a session
class StudySessionListCreateView(generics.ListCreateAPIView):

    serializer_class = StudySessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsLearner]

    def get_queryset(self):
        return StudySession.objects.filter(
            user=self.request.user
        ).select_related(
            'topic',
            'topic__goal'
        ).order_by('-date', '-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# GET: Retrieve one session
# PUT/PATCH: Update one session
# DELETE: Delete one session
class StudySessionDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = StudySessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsLearner]

    def get_queryset(self):
        return StudySession.objects.filter(
            user=self.request.user
        ).select_related(
            'topic',
            'topic__goal'
        )
