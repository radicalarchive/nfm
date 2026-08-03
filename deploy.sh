#!/bin/sh
# Deploy the JS/WebGL port to the static host.
#
# Usage: ./deploy.sh [user@host:path]     (default: cop:/www/nfm/)
#
# Builds a staging tree, then mirrors it with rsync --delete, so the remote
# directory ends up containing exactly what's here and nothing else.
#
# The deployed tree mirrors the repo, minus everything the browser never asks
# for (the jar, the decompiled sources, the tests):
#
#   nfm/index.html      the launcher
#   nfm/web/            main.html + the port modules
#   nfm/web/vendor/     BassoonTracker, the MOD player web/music.js imports
#   nfm/data/           models.zip, images.zip, sounds.zip, HUD gifs
#   nfm/stages/         stage definitions
#   nfm/mycars/         the four cars that ship with the game
#   nfm/music/          the tracker modules, fetched per stage by web/music.js
#
# Keeping the same shape as the repo is what lets vfs.detectFpath() work
# unchanged in both places: './' from the root launcher, '../' from web/.

set -eu

DEST="${1:-cop:/www/nfm/}"
SRC="$(cd "$(dirname "$0")" && pwd)"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

mkdir -p "$STAGE/web"
cp "$SRC"/index.html "$STAGE/"
cp "$SRC"/web/*.js "$SRC"/web/main.html "$STAGE/web/"
rm -f "$STAGE"/web/*.test.js
# web/vendor/ is a SUBDIRECTORY, so the glob above misses it. Leaving it out
#404s bassoonplayer.js, and because a failed ES module import throws, boot()
# never finishes -- the page just sits on "booting...". The browser reports it
# as a disallowed MIME type ("") rather than as a 404, which is a confusing
# way to be told a file is absent.
cp -r "$SRC/web/vendor" "$STAGE/web/"
# web/careditor/ is a subdirectory too, and the same glob misses it. Copy it,
# then drop the tests -- they import node:test and would 404 nothing, but they
# are dead weight on a static host.
mkdir -p "$STAGE/web/careditor"
cp "$SRC"/web/careditor/*.js "$STAGE/web/careditor/"
rm -f "$STAGE"/web/careditor/*.test.js
# music/ holds the tracker modules web/music.js fetches per stage (3.3 MB).
# Not needed before the soundtrack was wired up; very much needed now.
# mycars/ holds the four cars that ship with the game. The launcher lists them
# alongside whatever is in browser storage, so they have to be fetchable.
cp -r "$SRC/data" "$SRC/stages" "$SRC/music" "$SRC/mycars" "$STAGE/"

# ---- cache busting ---------------------------------------------------------
# The host sends no Cache-Control, so browsers apply heuristic freshness and an
# ES module graph can go stale one file at a time -- you reload, get the new
# main.html, and it imports last week's graphics.js. That produced a round of
# "the change isn't there" that cost more than this does.
#
# Stamp = hash of the module sources, so the query only changes when the code
# does and an unchanged deploy still hits cache. Every relative import and the
# <script src> gets ?v=STAMP appended, including index.html's './web/...'
# imports. Asset fetches (data/, stages/) go through vfs.js and are
# deliberately NOT stamped: they are the big files and they change far less
# often.
STAMP="$(cat "$STAGE"/web/*.js "$STAGE"/web/vendor/*.js "$STAGE"/web/careditor/*.js "$STAGE"/web/*.html "$STAGE"/index.html | md5sum | cut -c1-8)"
for f in "$STAGE"/web/*.js "$STAGE"/web/careditor/*.js "$STAGE"/web/*.html "$STAGE"/index.html; do
  sed -i -E "s@(from '\./([A-Za-z0-9_.-]+/)?[A-Za-z0-9_.-]+\.js)'@\1?v=$STAMP'@g; \
             s@(src=\"\./([A-Za-z0-9_.-]+/)?[A-Za-z0-9_.-]+\.js)\"@\1?v=$STAMP\"@g" "$f"
done
echo "cache stamp: $STAMP"

echo "staging tree:"
du -sh "$STAGE"

# --chmod is not optional: the staging dir comes from mktemp -d (mode 700) and
# rsync -a would propagate that, leaving the web server with a 403 on every
# path under it.
rsync -az --delete --chmod=D755,F644 --info=stats1 "$STAGE/" "$DEST"
echo "deployed to $DEST"
