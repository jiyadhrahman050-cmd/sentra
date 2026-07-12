from django.contrib.auth import get_user_model
from django.db.models import Count

User = get_user_model()

from .filters import UserFilter
from .pagination import CustomPagination
from .utils import create_audit_log
from .excel import export_to_excel

from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
    ListAPIView,
)

from .models import (
    Role,
    Permission,
    UserRole,
    RolePermission,
    AuditLog,
)

from .serializers import (
    RegisterSerializer,
    RoleSerializer,
    RoleCreateUpdateSerializer,
    PermissionSerializer,
    AssignPermissionSerializer,
    AssignRoleSerializer,
    UserListSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    AuditLogSerializer,
    DashboardActivitySerializer,
)



def can_manage_role(user, target_role):
    user_roles = list(
        UserRole.objects.filter(user=user)
        .values_list("role__name", flat=True)
    )

    if "Admin" in user_roles:
        return True

    if "Manager" in user_roles:
        return target_role.name in ["Manager", "Viewer"]

    if "Viewer" in user_roles:
        return target_role.name == "Viewer"

    return False



class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer


class Dashboard(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        recent_logs = AuditLog.objects.select_related(
            "actor"
        )[:5]

        recent_activity = DashboardActivitySerializer(
            recent_logs,
            many=True
        ).data

        return Response({
            "total_users": User.objects.count(),
            "active_users": User.objects.filter(
                is_active=True
            ).count(),
            "roles": Role.objects.count(),
            "audit_logs": AuditLog.objects.count(),
            "recent_activity": recent_activity,
        })
    


class RoleListCreateView(ListCreateAPIView):

    queryset = Role.objects.annotate(
        users_count=Count("role_users", distinct=True)
    )

    def get_serializer_class(self):
        if self.request.method == "POST":
            return RoleCreateUpdateSerializer
        return RoleSerializer

    def perform_create(self, serializer):
        role = serializer.save()

        create_audit_log(
            request=self.request,
            action="role.create",
            model_name="Role",
            object_id=role.id,
            description=f"Created role {role.name}",
        )


    def get_serializer_class(self):
        if self.request.method == "POST":
            return RoleCreateUpdateSerializer
        return RoleSerializer

    def perform_create(self, serializer):
        role = serializer.save()

        create_audit_log(
            request=self.request,
            action="role.create",
            model_name="Role",
            object_id=role.id,
            description=f"Created role {role.name}",
        )

class RoleDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Role.objects.all()

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return RoleCreateUpdateSerializer
        return RoleSerializer

    def perform_update(self, serializer):
        role = serializer.save()

        create_audit_log(
            request=self.request,
            action="role.update",
            model_name="Role",
            object_id=role.id,
            description=f"Updated role {role.name}",
        )

    def perform_destroy(self, instance):
        create_audit_log(
            request=self.request,
            action="role.delete",
            model_name="Role",
            object_id=instance.id,
            description=f"Deleted role {instance.name}",
        )

        instance.delete()


class PermissionListView(ListAPIView):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer  

class AssignPermissionView(APIView):

    def put(self, request, pk):
        serializer = AssignPermissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        role = Role.objects.get(pk=pk)

        if not can_manage_role(request.user, role):
            return Response(
                {"detail": "You do not have permission to edit this role."},
                status=status.HTTP_403_FORBIDDEN,
            )

        permissions = Permission.objects.filter(
            id__in=serializer.validated_data["permission_ids"]
        )

        role.permissions.set(permissions)

        create_audit_log(
            request=request,
            action="role.update",
            model_name="Role",
            object_id=role.id,
            description=f"Updated permissions for {role.name}",
        )

        return Response(
            {"message": "Permissions assigned successfully."},
            status=status.HTTP_200_OK,
        )

        
    
class AssignRoleView(APIView):

    def put(self, request, pk):
        serializer = AssignRoleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.get(pk=pk)

        UserRole.objects.filter(user=user).delete()

        for role in Role.objects.filter(
            id__in=serializer.validated_data["role_ids"]
        ):
            UserRole.objects.create(
                user=user,
                role=role,
            )

        create_audit_log(
    request=request,
    action="user.role.assign",
    model_name="User",
    object_id=user.id,
    description=f"Assigned roles to {user.email}",
)

        return Response(
            {
                "message": "Roles assigned successfully."
            },
            status=status.HTTP_200_OK,
        )
    
class UserListCreateView(ListCreateAPIView):

    queryset = User.objects.filter(is_active=True)
    filterset_class = UserFilter
    pagination_class = CustomPagination

    search_fields = [
        "username",
        "email",
    ]

    ordering_fields = [
        "username",
        "email",
        "date_joined",
    ]

    ordering = [
        "-date_joined",
    ]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserCreateSerializer
        return UserListSerializer

    def perform_create(self, serializer):
        user = serializer.save()

        create_audit_log(
    request=self.request,
    action="user.create",
    model_name="User",
    object_id=user.id,
    description=f"Created user {user.email}",
)


class UserDetailView(RetrieveUpdateDestroyAPIView):

    queryset = User.objects.all()

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return UserUpdateSerializer
        return UserListSerializer

    def perform_update(self, serializer):
        user = serializer.save()

        create_audit_log(
            request=self.request,
            action="UPDATE",
            model_name="User",
            object_id=user.id,
            description=f"Updated user {user.email}",
        )

    def perform_destroy(self, instance):
        create_audit_log(
            request=self.request,
            action="DELETE",
            model_name="User",
            object_id=instance.id,
            description=f"Deleted user {instance.email}",
        )

        instance.delete()

class AuditLogListView(ListAPIView):

    queryset = AuditLog.objects.select_related("actor")

    serializer_class = AuditLogSerializer

    pagination_class = CustomPagination

    search_fields = [
        "action",
        "model_name",
        "description",
    ]

    ordering_fields = [
        "created_at",
        "action",
    ]

    ordering = [
        "-created_at",
    ]

class ExportUsersExcel(APIView):

    def get(self, request):

        users = User.objects.all()

        return export_to_excel(
            filename="users",
            sheet_name="Users",
            headers=[
                "ID",
                "Username",
                "Email",
                "Active",
                "Joined Date",
            ],
            queryset=users,
            row_builder=lambda user: [
                user.id,
                user.username,
                user.email,
                user.is_active,
                user.date_joined.strftime("%Y-%m-%d %H:%M"),
            ],
        )
    
class ExportRolesExcel(APIView):

    def get(self, request):

        roles = Role.objects.all()

        return export_to_excel(
            filename="roles",
            sheet_name="Roles",
            headers=[
                "ID",
                "Role",
                "Description",
                "Created At",
            ],
            queryset=roles,
            row_builder=lambda role: [
                role.id,
                role.name,
                role.description,
                role.created_at.strftime("%Y-%m-%d %H:%M"),
            ],
        )
    
class ExportAuditExcel(APIView):

    def get(self, request):

        logs = AuditLog.objects.select_related("actor")

        return export_to_excel(
            filename="audit_logs",
            sheet_name="Audit Logs",
            headers=[
                "Actor",
                "Action",
                "Model",
                "Object",
                "Description",
                "IP",
                "Created At",
            ],
            queryset=logs,
            row_builder=lambda log: [
                log.actor.email if log.actor else "",
                log.action,
                log.model_name,
                log.object_id,
                log.description,
                log.ip_address,
                log.created_at.strftime("%Y-%m-%d %H:%M"),
            ],
        )
    

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        roles = list(
            UserRole.objects.filter(user=request.user)
            .values_list("role__name", flat=True)
        )

        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "roles": roles,
        })