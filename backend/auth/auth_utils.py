import os
from quart_auth import (
    current_user
)


def get_authenticated_user_details(request_headers):
    user_object = {}
    user_object['user_principal_id'] = current_user.auth_id
    # user_object['user_name'] =
    # user_object['auth_provider'] =
    # user_object['auth_token'] =
    # user_object['client_principal_b64'] =
    # user_object['aad_id_token'] =
    return user_object
