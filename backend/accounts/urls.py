from django.urls import path
from .serializers import UserListSerializer

from .views import (
    RegisterView,
    Dashboard,
    MeView,
    RoleListCreateView,
    RoleDetailView,
    PermissionListView,
    AssignPermissionView,
    AssignRoleView,
    UserListCreateView,
    UserDetailView,
    AuditLogListView,
    ExportUsersExcel,
    ExportRolesExcel,
    ExportAuditExcel,
)

urlpatterns = [
    # Authentication
    path("register/", RegisterView.as_view(), name="register"),
    path("dashboard/", Dashboard.as_view(), name="dashboard"),
    path("me/", MeView.as_view(), name="me"),

    # Users
    path("users/", UserListCreateView.as_view(), name="user-list-create"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="user-detail"),

    # Roles
    path("roles/", RoleListCreateView.as_view(), name="role-list"),
    path("roles/<int:pk>/", RoleDetailView.as_view(), name="role-detail"),

    # Permissions
    path("permissions/", PermissionListView.as_view(), name="permission-list"),

    # Assign permissions to a role
    path(
        "roles/<int:pk>/assign-permissions/",
        AssignPermissionView.as_view(),
        name="assign-permissions",
    ),

    # Assign roles to a user
    path(
        "users/<int:pk>/assign-roles/",
        AssignRoleView.as_view(),
        name="assign-roles",
    ),

    # Audit Logs
    path(
    "audit-logs/",
    AuditLogListView.as_view(),
    name="audit-log-list",
    ),

    # Export Excel Files
    path("export/users/", ExportUsersExcel.as_view(), name="export-users-excel"),
    path("export/roles/", ExportRolesExcel.as_view(), name="export-roles-excel"),
    path("export/audit-logs/", ExportAuditExcel.as_view(), name="export-audit-logs-excel"),
]