from rest_framework_simplejwt.views import TokenObtainPairView
from .authentication import EmailTokenObtainPairSerializer


class EmailLoginView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer