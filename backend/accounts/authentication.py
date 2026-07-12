from django.contrib.auth import authenticate, get_user_model
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .utils import create_audit_log

User = get_user_model()


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed("Invalid email or password")

        user = authenticate(
            username=user.username,
            password=password,
        )

        if user is None:
            raise AuthenticationFailed("Invalid email or password")
        
        create_audit_log(
        request=self.context["request"],
        action="auth.login",
        model_name="Authentication",
        object_id=user.id,
        description=f"Signed in from {self.context['request'].META.get('REMOTE_ADDR')}",
)

        refresh = self.get_token(user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }