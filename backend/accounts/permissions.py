from accounts.models import Permission



permissions = [
    ("View Users", "users.view"),
    ("Create Users", "users.create"),
    ("Edit Users", "users.edit"),
    ("Delete Users", "users.delete"),
    ("View Roles", "roles.view"),
    ("Manage Roles", "roles.manage"),
    ("View Permissions", "permissions.view"),
    ("View Audit Logs", "audit.view"),
]

for name, code in permissions:
    Permission.objects.get_or_create(
        name=name,
        codename=code,
    )
    
