
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


class CustomUserAdmin(UserAdmin):

    fieldsets = UserAdmin.fieldsets + (
        ('Application Role', {
            'fields': ('role', 'mentor')
        }),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Application Role', {
            'fields': ('role', 'mentor')
        }),
    )


admin.site.register(User, CustomUserAdmin)
