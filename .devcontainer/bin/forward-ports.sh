#!/usr/bin/env bash
set -u

# postStartCommand reaps this hook's process tree the moment it returns, which
# kills the last bridge we background before it finishes detaching: 8000 has the
# 8025 wait loop to settle in, but 8025 launches just as the script exits and
# gets reaped. Re-exec the whole worker in its own detached session once so the
# hook returns immediately; the bridges below are then children of a session
# reparented to PID 1 and nothing tears them down on hook completion.
if [ -z "${_FWD_DETACHED:-}" ]; then
    _FWD_DETACHED=1 setsid -f "$0" "$@" </dev/null >/tmp/forward-ports.log 2>&1
    exit 0
fi

bridge() { # $1=local port  $2=target host:port
for p in /proc/[0-9]*; do read -r c < "$p/comm" 2>/dev/null || continue
    [ "$c" = socat ] && grep -qa "TCP-LISTEN:$1," "$p/cmdline" 2>/dev/null && kill "${p#/proc/}" 2>/dev/null
done
for _ in $(seq 1 30); do                      # wait for the sibling to boot
    socat -T1 - "TCP:$2" </dev/null >/dev/null 2>&1 && break; sleep 1
done
socat TCP-LISTEN:"$1",fork,reuseaddr "TCP:$2" </dev/null >"/tmp/socat-$1.log" 2>&1 &
}
bridge 8000 nginx:8000
bridge 8025 mailpit:8025
echo "port bridges started"