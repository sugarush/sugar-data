from sugar_odm import MemoryModel, Field
from sugar_api import JSONAPIMixin


class User(MemoryModel, JSONAPIMixin):

    __acl__ = {
        'self': ['read', 'update'],
        'administrator': ['all'],
        'other': ['read']
    }

    username = Field(required=True)
    password = Field(required=True)

    group = Field(required=True)
