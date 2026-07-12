from django.conf import settings
from django.db import models


class Permission(models.Model):
    """
    Application permission.
    Example:
        users.view
        users.create
        users.edit
        roles.manage
    """

    name = models.CharField(max_length=100)

    codename = models.CharField(
        max_length=100,
        unique=True
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.codename


class Role(models.Model):
    """
    User role.
    Example:
        Admin
        Manager
        Viewer
    """

    name = models.CharField(
        max_length=50,
        unique=True
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    permissions = models.ManyToManyField(
        Permission,
        through="RolePermission",
        related_name="roles"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class RolePermission(models.Model):
    """
    Many-to-many table between Role and Permission.
    """

    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE
    )

    permission = models.ForeignKey(
        Permission,
        on_delete=models.CASCADE
    )

    class Meta:
        unique_together = (
            "role",
            "permission",
        )

    def __str__(self):
        return f"{self.role} -> {self.permission}"


class UserRole(models.Model):
    """
    Assign roles to users.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="user_roles"
    )

    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name="role_users"
    )

    assigned_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        unique_together = (
            "user",
            "role",
        )

    def __str__(self):
        return f"{self.user.email} - {self.role.name}"
    

class AuditLog(models.Model):

    ACTIONS = [
        ("CREATE", "Create"),
        ("UPDATE", "Update"),
        ("DELETE", "Delete"),
        ("LOGIN", "Login"),
        ("LOGOUT", "Logout"),
        ("ASSIGN_ROLE", "Assign Role"),
        ("REMOVE_ROLE", "Remove Role"),
        ("ASSIGN_PERMISSION", "Assign Permission"),
    ]

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs"
    )

    action = models.CharField(
        max_length=50,
        choices=ACTIONS
    )

    model_name = models.CharField(
        max_length=100
    )

    object_id = models.CharField(
        max_length=100
    )

    description = models.TextField()

    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action} - {self.model_name}"