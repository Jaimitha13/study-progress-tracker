from rest_framework import serializers
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role='learner'
        )


class MentorSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class UserProfileSerializer(serializers.ModelSerializer):
    mentor = MentorSummarySerializer(read_only=True, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'mentor']
        read_only_fields = ['id', 'role', 'mentor']