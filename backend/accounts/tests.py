from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import Role


class LoginAPITest(APITestCase):

    def setUp(self):
        User.objects.create_user(
            username="testuser",
            password="test12345"
        )

    def test_login(self):
        response = self.client.post(
            "/login/",
            {
                "username": "testuser",
                "password": "test12345"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_invalid_login(self):
        response = self.client.post(
            "/login/",
            {
                "username": "testuser",
                "password": "wrongpassword"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# Add this new class below LoginAPITest
class RegisterAPITest(APITestCase):

    def setUp(self):
        Role.objects.create(
            name="Customer",
            description="Default customer role"
        )

    def test_register_user(self):
        response = self.client.post(
            "/api/register/",
            {
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "StrongPassword123!",
                "password2": "StrongPassword123!"
            },
            format="json"
        )

    

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

class UserAPITest(APITestCase):

    def setUp(self):
    # Create the Customer role required by your serializer
        Role.objects.create(
        name="Customer",
        description="Default customer role"
    )

    # Create an authenticated admin user
        self.user = User.objects.create_user(
        username="admin",
        email="admin@example.com",
        password="admin123"
    )

    # Generate JWT token
        refresh = RefreshToken.for_user(self.user)
        self.token = str(refresh.access_token)

    # Authenticate requests
        self.client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {self.token}"
    )

    def test_get_users(self):
        response = self.client.get("/api/users/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_user(self):
        response = self.client.post(
            "/api/users/",
            {
                "username": "john",
                "email": "john@example.com",
                "password": "john12345"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED) 

    def test_update_user(self):
        user = User.objects.create_user(
        username="olduser",
        email="old@example.com",
        password="old12345"
    )

        response = self.client.put(
        f"/api/users/{user.id}/",
        {
            "username": "newuser",
            "email": "new@example.com"
        },
        format="json"
    )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_user(self):
        user = User.objects.create_user(
        username="deleteuser",
        email="delete@example.com",
        password="delete123"
    )

        response = self.client.delete(
        f"/api/users/{user.id}/"
    )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

class RoleAPITest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="admin123"
        )

        refresh = RefreshToken.for_user(self.user)
        self.token = str(refresh.access_token)

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )

    def test_get_roles(self):
        response = self.client.get("/api/roles/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_role(self):
        response = self.client.post(
        "/api/roles/",
        {
            "name": "Manager",
            "description": "Manager role"
        },
        format="json"
    )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_update_role(self):
        role = Role.objects.create(
        name="Staff",
        description="Staff role"
    )

        response = self.client.put(
        f"/api/roles/{role.id}/",
        {
            "name": "Senior Staff",
            "description": "Updated role"
        },
        format="json"
    )

        self.assertEqual(response.status_code, status.HTTP_200_OK)  

class PermissionAPITest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="admin123"
        )

        refresh = RefreshToken.for_user(self.user)
        self.token = str(refresh.access_token)

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )

    def test_get_permissions(self):
        response = self.client.get("/api/permissions/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

class AuditLogAPITest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="admin123"
        )

        refresh = RefreshToken.for_user(self.user)
        self.token = str(refresh.access_token)

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )

    def test_get_audit_logs(self):
        response = self.client.get("/api/audit-logs/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

class ExportAPITest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="admin123"
        )

        refresh = RefreshToken.for_user(self.user)
        self.token = str(refresh.access_token)

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )

    def test_export_users_excel(self):
        response = self.client.get("/api/export/users/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)