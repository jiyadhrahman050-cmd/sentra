from .models import AuditLog


def get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")

    if x_forwarded_for:
        return x_forwarded_for.split(",")[0]

    return request.META.get("REMOTE_ADDR")


def create_audit_log(
    request,
    action,
    model_name,
    object_id,
    description,
):
    AuditLog.objects.create(
        actor=request.user if request.user.is_authenticated else None,
        action=action,
        model_name=model_name,
        object_id=str(object_id),
        description=description,
        ip_address=get_client_ip(request),
    )