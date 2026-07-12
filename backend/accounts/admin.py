from django.contrib import admin
from .models import (
    Permission,
    Role,
    RolePermission,
    UserRole,
    AuditLog,
)

admin.site.register(Permission)
admin.site.register(Role)
admin.site.register(RolePermission)
admin.site.register(UserRole)
admin.site.register(AuditLog)
