#!/bin/sh

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
/app/wait-for-it.sh mysql:3306 -t 60

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting the application..."
exec "$@"