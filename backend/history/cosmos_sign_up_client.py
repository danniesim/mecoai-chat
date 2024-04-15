import uuid
from datetime import datetime
from azure.cosmos.aio import CosmosClient
from azure.cosmos import exceptions


class CosmosSignUpClient():

    def __init__(self, cosmosdb_endpoint: str, credential: any,
                 database_name: str, container_name: str,
                 enable_message_feedback: bool = False):
        self.cosmosdb_endpoint = cosmosdb_endpoint
        self.credential = credential
        self.database_name = database_name
        self.container_name = container_name
        self.enable_message_feedback = enable_message_feedback
        try:
            self.cosmosdb_client = CosmosClient(
                self.cosmosdb_endpoint, credential=credential)
        except exceptions.CosmosHttpResponseError as e:
            if e.status_code == 401:
                raise ValueError("Invalid credentials") from e
            else:
                raise ValueError("Invalid CosmosDB endpoint") from e

        try:
            self.database_client = self.cosmosdb_client.get_database_client(
                database_name)
        except exceptions.CosmosResourceNotFoundError:
            raise ValueError("Invalid CosmosDB database name")

        try:
            self.container_client = self.database_client.get_container_client(
                container_name)
        except exceptions.CosmosResourceNotFoundError:
            raise ValueError("Invalid CosmosDB container name")

    async def ensure(self):
        if not self.cosmosdb_client or not self.database_client or not self.container_client:
            return False, "CosmosDB client not initialized correctly"

        try:
            database_info = await self.database_client.read()
        except BaseException:
            return False, f"CosmosDB database {self.database_name} on account {self.cosmosdb_endpoint} not found"

        try:
            container_info = await self.container_client.read()
        except BaseException:
            return False, f"CosmosDB container {self.container_name} not found"

        return True, "CosmosDB client initialized successfully"

    async def create_sign_up(
            self, user_id, email, email_verified, name, family_name, given_name,
            picture_url, user_ip):
        sign_up = {
            'id': str(uuid.uuid4()),
            'type': 'sign_up',
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat(),
            'userId': user_id,
            'email': email,
            'email_verified': email_verified,
            'name': name,
            'family_name': family_name,
            'given_name': given_name,
            'picture_url': picture_url,
            'user_ip': user_ip
        }
        # TODO: add some error handling based on the output of the upsert_item
        # call
        resp = await self.container_client.upsert_item(sign_up)
        if resp:
            return resp
        else:
            return False
