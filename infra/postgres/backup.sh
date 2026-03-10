#!/bin/bash
# PostgreSQL backup script for Darba
# Usage: run via cron or manually on the server
# Keeps last 7 daily backups

BACKUP_DIR="/home/zzzeniv/backups/postgres"
CONTAINER="darba-postgres-1"
DB_USER="${POSTGRES_USER:-darba}"
DB_NAME="${POSTGRES_DB:-darba}"
DATE=$(date +%Y%m%d_%H%M%S)
KEEP_DAYS=7

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup: ${DB_NAME}"

docker exec "$CONTAINER" pg_dump -U "$DB_USER" -Fc "$DB_NAME" > "$BACKUP_DIR/${DB_NAME}_${DATE}.dump"

if [ $? -eq 0 ]; then
    SIZE=$(du -h "$BACKUP_DIR/${DB_NAME}_${DATE}.dump" | cut -f1)
    echo "[$(date)] Backup OK: ${DB_NAME}_${DATE}.dump ($SIZE)"
else
    echo "[$(date)] Backup FAILED" >&2
    exit 1
fi

# Cleanup old backups
find "$BACKUP_DIR" -name "*.dump" -mtime +$KEEP_DAYS -delete
echo "[$(date)] Cleanup done (kept last $KEEP_DAYS days)"
