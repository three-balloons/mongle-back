#!/bin/sh
until mysqladmin ping -h db -u${DB_USER} -p${DB_PASSWORD} --silent; do
  echo "Waiting for MySQL..."
  sleep 2
done

npx prisma migrate deploy
node dist/main.js
