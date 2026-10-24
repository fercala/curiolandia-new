#!/bin/sh
# Gancho de inicio de sesión (SessionStart) para el entorno en la nube.
# El plugin playwright busca Google Chrome en /opt/google/chrome/chrome, pero en la nube solo
# hay el Chromium de Playwright en /opt/pw-browsers. Este script crea allí un lanzador que
# arranca ese Chromium con --no-sandbox (en el contenedor se corre como root y sin él no abre).
# No hace nada si ya existe Chrome, si no hay Chromium o si no se puede escribir en /opt
# (por ejemplo, en el ordenador de Fernando): nunca debe impedir que empiece la sesión.
DESTINO=/opt/google/chrome/chrome
[ -x "$DESTINO" ] && exit 0
CHROMIUM=$(ls -d /opt/pw-browsers/chromium-*/chrome-linux64/chrome 2>/dev/null | head -n 1)
[ -n "$CHROMIUM" ] || exit 0
mkdir -p /opt/google/chrome 2>/dev/null || exit 0
printf '#!/bin/sh\nexec "%s" --no-sandbox "$@"\n' "$CHROMIUM" > "$DESTINO" 2>/dev/null || exit 0
chmod +x "$DESTINO"
exit 0
