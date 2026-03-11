#!/bin/bash
# Install backup cron job
cat > /tmp/darba_cron << 'CRON'
0 3 * * * /home/zzzeniv/darba/infra/postgres/backup.sh >> /home/zzzeniv/backups/backup.log 2>&1
CRON
crontab /tmp/darba_cron
rm /tmp/darba_cron
echo "Crontab installed:"
crontab -l
