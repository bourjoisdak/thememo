#!/usr/bin/env bash
# Claude가 작업을 마칠 때(Stop) 변경 사항이 있으면 자동으로 커밋하고 푸시한다.
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0
[ -z "$(git status --porcelain)" ] && exit 0

files=$(git status --porcelain | awk '{print $NF}' | head -8 | paste -sd, - | sed 's/,/, /g')
git add -A
git commit -q \
  -m "자동 저장: $(date '+%Y-%m-%d %H:%M')" \
  -m "변경: $files" \
  -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" || exit 0

if git push -q 2>/dev/null; then
  echo "{\"systemMessage\": \"자동 커밋·푸시 완료: $(git log -1 --format=%h)\"}"
else
  echo "{\"systemMessage\": \"자동 커밋은 했지만 푸시에 실패했어요 (git push 확인 필요)\"}"
fi
