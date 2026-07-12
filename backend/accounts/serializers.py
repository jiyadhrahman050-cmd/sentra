from django.contrib.auth.models import User
from rest_framework import serializers

from .models import (
    Role,
    Permission,
    UserRole,
    RolePermission,
    AuditLog,
)


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
        ]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )

       
        

        return user

class PermissionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Permission
        fields = "__all__"


class RoleSerializer(serializers.ModelSerializer):

    permissions = PermissionSerializer(
        many=True,
        read_only=True
    )

    users_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Role
        fields = [
            "id",
            "name",
            "description",
            "permissions",
            "created_at",
            "users_count",
        ]

    def get_users_count(self, obj):
        return obj.role_users.count()


class RoleCreateUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Role
        fields = [
            "id",
            "name",
            "description"
        ]


class AssignPermissionSerializer(serializers.Serializer):

    permission_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True
    )

    def validate_permission_ids(self, value):
        permissions = Permission.objects.filter(id__in=value)

        if permissions.count() != len(value):
            raise serializers.ValidationError(
                "One or more permissions do not exist."
            )

        return value


class AssignRoleSerializer(serializers.Serializer):

    role_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True
    )

    def validate_role_ids(self, value):
        roles = Role.objects.filter(id__in=value)

        if roles.count() != len(value):
            raise serializers.ValidationError(
                "One or more roles do not exist."
            )

        return value
    
class UserListSerializer(serializers.ModelSerializer):

    roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "is_active",
            "last_login",
            "roles",
        ]

    def get_roles(self, obj):

        return [
        {
            "id": ur.role.id,
            "name": ur.role.name,
        }
        for ur in obj.user_roles.select_related("role")
    ]
    
class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "is_active",
            "role_ids",
        ]

    def create(self, validated_data):
        role_ids = validated_data.pop("role_ids", [])

        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        roles = Role.objects.filter(id__in=role_ids)

        for role in roles:
            UserRole.objects.create(
                user=user,
                role=role
            )

        return user


class UserUpdateSerializer(serializers.ModelSerializer):

    role_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        write_only=True
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "is_active",
            "role_ids",
        ]

    def update(self, instance, validated_data):

        role_ids = validated_data.pop("role_ids", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if role_ids is not None:

            UserRole.objects.filter(
                user=instance
            ).delete()

            for role in Role.objects.filter(id__in=role_ids):
                UserRole.objects.create(
                    user=instance,
                    role=role
                )

        return instance
    
class AuditLogSerializer(serializers.ModelSerializer):

    actor = serializers.StringRelatedField()

    class Meta:
        model = AuditLog
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "is_active",
            "date_joined",
        ]

        

class DashboardActivitySerializer(serializers.ModelSerializer):
    actor = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "actor",
            "action",
            "description",
            "created_at",
        ]

    def get_actor(self, obj):
        if obj.actor:
            return obj.actor.email
        return "System"