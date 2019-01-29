from sugar_odm import MemoryModel, Field
from sugar_api import JSONAPIMixin


class Group(MemoryModel, JSONAPIMixin):

    __acl__ = {
        'administrator': ['all']
    }

    name = Field(required=True)
