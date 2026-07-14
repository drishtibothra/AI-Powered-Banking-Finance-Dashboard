"""change embedding dimension

Revision ID: 8ee10d93969f
Revises: b9d2d503cf56
Create Date: 2026-07-14 21:11:00.149355

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector 


# revision identifiers, used by Alembic.
revision: str = '8ee10d93969f'
down_revision: Union[str, Sequence[str], None] = 'b9d2d503cf56'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.alter_column(
        "entries",
        "embedding",
        existing_type=Vector(1536),
        type_=Vector(3072),
        existing_nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "entries",
        "embedding",
        existing_type=Vector(3072),
        type_=Vector(1536),
        existing_nullable=True,
    )