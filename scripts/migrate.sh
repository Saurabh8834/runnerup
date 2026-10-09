#!/bin/sh
if [ -d "backend" ]; then
  cd backend && sh scripts/migrate.sh
else
  sh scripts/migrate.sh
fi
