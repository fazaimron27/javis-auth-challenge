#!/usr/bin/env sh
# Use: ./wait-for-it.sh host:port [-t timeout] [-- command args]

TIMEOUT=15
QUIET=0

while getopts "t:q" OPTION; do
  case "$OPTION" in
    t)
      TIMEOUT="$OPTARG"
      ;;
    q)
      QUIET=1
      ;;
    *)
      exit 1
      ;;
  esac
done

shift $((OPTIND-1))

HOST=$(printf "%s" "$1" | cut -d : -f 1)
PORT=$(printf "%s" "$1" | cut -d : -f 2)
shift

if [ -z "${HOST}" ] || [ -z "${PORT}" ]; then
  echo "Error: you need to provide a host and port as the first argument."
  exit 1
fi

TIMEOUT_END=$(($(date +%s) + TIMEOUT))
while :; do
  nc -z "${HOST}" "${PORT}" > /dev/null 2>&1
  result=$?
  if [ $result -eq 0 ]; then
    if [ $QUIET -ne 1 ]; then
      echo "$(date) - ${HOST}:${PORT} is available"
    fi
    break
  fi
  NOW=$(date +%s)
  if [ $NOW -ge $TIMEOUT_END ]; then
    if [ $QUIET -ne 1 ]; then
      echo "$(date) - timeout waiting for ${HOST}:${PORT}"
    fi
    exit 1
  fi
  if [ $QUIET -ne 1 ]; then
    echo "$(date) - waiting for ${HOST}:${PORT}... ($((TIMEOUT_END - NOW))s remaining)"
  fi
  sleep 1
done

shift

if [ "$#" -gt 0 ]; then
  exec "$@"
fi