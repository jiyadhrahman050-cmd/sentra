import django_filters
from django.contrib.auth.models import User


class UserFilter(django_filters.FilterSet):

    class Meta:
        model = User
        fields = {
            "is_active": ["exact"],
            "is_staff": ["exact"],
            "is_superuser": ["exact"],
        }