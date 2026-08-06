"""create auth table

Revision ID: 20260806_01
Revises:
Create Date: 2026-08-06 13:09:10.000000
"""

import sqlalchemy as sa
from alembic import op

revision = "20260806_01"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "auth",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("username", sa.String(length=80), nullable=False, unique=True),
        sa.Column("password", sa.String(length=255), nullable=False),
        sa.Column("access_token", sa.Text(), nullable=True),
        sa.Column("refresh_token", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), onupdate=sa.text("now()")),
    )


def downgrade():
    op.drop_table("auth")
