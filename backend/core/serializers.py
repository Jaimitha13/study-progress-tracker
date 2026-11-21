from rest_framework import serializers

from .models import AppSettings


class AppSettingsSerializer(serializers.ModelSerializer):

    class Meta:
        model = AppSettings
        fields = [
            'id',
            'min_session_minutes',
            'max_session_minutes',
            'max_prerequisites',
            'updated_at'
        ]

        read_only_fields = ['id', 'updated_at']

    def validate_min_session_minutes(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "Minimum session minutes must be greater than 0."
            )

        return value

    def validate_max_session_minutes(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "Maximum session minutes must be greater than 0."
            )

        return value

    def validate_max_prerequisites(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "Maximum prerequisites must be greater than 0."
            )

        return value

    def validate(self, attrs):

        if self.instance:
            min_minutes = attrs.get(
                'min_session_minutes',
                self.instance.min_session_minutes
            )

            max_minutes = attrs.get(
                'max_session_minutes',
                self.instance.max_session_minutes
            )

        else:
            min_minutes = attrs.get('min_session_minutes', 5)
            max_minutes = attrs.get('max_session_minutes', 480)

        if max_minutes < min_minutes:
            raise serializers.ValidationError({
                'max_session_minutes':
                    'Maximum session minutes must be greater than or equal to minimum session minutes.'
            })

        return attrs