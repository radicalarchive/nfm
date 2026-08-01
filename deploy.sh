#!/bin/sh
# Deploy the JS/WebGL port to the static host.
#
# Usage: ./deploy.sh [user@host:path]     (default: cop:/www/nfm/)
#
# Builds a staging tree, then mirrors it with rsync --delete, so the remote
# directory ends up containing exactly what's here and nothing else.
#
# Layout is FLAT, matching what the host already served:
#   nfm/index.html   A/B test link page
#   nfm/main.html    the game
#   nfm/*.js         the port modules (tests excluded)
#   nfm/data/        models.zip, images.zip, HUD gifs
#   nfm/stages/      stage definitions
#
# vfs.detectFpath() probes './' first, which is what this layout wants.

set -eu

DEST="${1:-cop:/www/nfm/}"
SRC="$(cd "$(dirname "$0")" && pwd)"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

cp "$SRC"/js/*.js "$SRC"/js/index.html "$SRC"/js/main.html "$STAGE/"
rm -f "$STAGE"/*.test.js
cp -r "$SRC/data" "$SRC/stages" "$STAGE/"

# ---- cache busting ---------------------------------------------------------
# The host sends no Cache-Control, so browsers apply heuristic freshness and an
# ES module graph can go stale one file at a time -- you reload, get the new
# main.html, and it imports last week's graphics.js. That produced a round of
# "the change isn't there" that cost more than this does.
#
# Stamp = hash of the module sources, so the query only changes when the code
# does and an unchanged deploy still hits cache. Every relative import and the
# <script src> gets ?v=STAMP appended. Asset fetches (data/, stages/) go
# through vfs.js and are deliberately NOT stamped: they are the big files and
# they change far less often.
STAMP="$(cat "$STAGE"/*.js "$STAGE"/*.html | md5sum | cut -c1-8)"
for f in "$STAGE"/*.js "$STAGE"/*.html; do
  sed -i -E "s@(from '\./[A-Za-z0-9_.-]+\.js)'@\1?v=$STAMP'@g; \
             s@(src=\"\./[A-Za-z0-9_.-]+\.js)\"@\1?v=$STAMP\"@g" "$f"
done
echo "cache stamp: $STAMP"

echo "staging tree:"
du -sh "$STAGE"

# --chmod is not optional: the staging dir comes from mktemp -d (mode 700) and
# rsync -a would propagate that, leaving the web server with a 403 on every
# path under it.
rsync -az --delete --chmod=D755,F644 --info=stats1 "$STAGE/" "$DEST"
echo "deployed to $DEST"
