#!/usr/bin/env bash
# assert-llm-endpoints.sh
# Hackathon binding rider MD-03 R2: only Vertex AI Gemini is allowed for LLM calls.
# Fail the build if ANY non-Vertex LLM provider host is referenced in source / config.
#
# Why this matters: judges DQ submissions that bypass the locked stack.
#                   This guard makes the constraint un-violatable in CI.
#
# Allowlist policy:
#   - Allowed: aiplatform.googleapis.com, *.googleapis.com (Google), *.run.app (our services), *.rapidapi.com (MCP egress)
#   - Forbidden: aistudio.google.com, generativelanguage.googleapis.com, api.openai.com,
#                api.anthropic.com, openai.azure.com, api.cohere.ai, api.mistral.ai, api.together.xyz,
#                api.groq.com, *.huggingface.co/api, ollama, lmstudio
#
# Usage: bash scripts/assert-llm-endpoints.sh
# Exit 0 = clean. Exit 1 = at least one violation.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

# Search scope: source + config files only. Exclude lockfiles, build outputs, and node_modules.
SEARCH_PATHS=(
  "apps"
  "agents"
  "deploy"
  ".github"
  "scripts"
  "specs"
  "prisma"
)

EXCLUDES=(
  --exclude-dir=node_modules
  --exclude-dir=.next
  --exclude-dir=dist
  --exclude-dir=build
  --exclude-dir=.venv
  --exclude-dir=__pycache__
  --exclude-dir=.git
  --exclude=pnpm-lock.yaml
  --exclude=package-lock.json
  --exclude=yarn.lock
  --exclude=poetry.lock
  --exclude=requirements.lock
  # this script must be allowed to mention forbidden hosts (it's the guard itself):
  --exclude=assert-llm-endpoints.sh
)

# Each pattern below is a literal substring match (grep -F).
FORBIDDEN_PATTERNS=(
  "aistudio.google.com"
  "generativelanguage.googleapis.com"
  "api.openai.com"
  "openai.azure.com"
  "api.anthropic.com"
  "api.cohere.ai"
  "api.cohere.com"
  "api.mistral.ai"
  "api.together.xyz"
  "api.groq.com"
  "huggingface.co/api"
  "api-inference.huggingface.co"
  "localhost:11434"      # ollama default
  "127.0.0.1:11434"
  "lmstudio.ai"
)

EXIT=0
echo "scripts/assert-llm-endpoints.sh — scanning for non-Vertex LLM endpoints"
echo "search roots: ${SEARCH_PATHS[*]}"

# Build path arguments only for paths that exist (avoid grep error).
EXISTING_PATHS=()
for p in "${SEARCH_PATHS[@]}"; do
  if [ -d "$p" ] || [ -f "$p" ]; then EXISTING_PATHS+=("$p"); fi
done

if [ ${#EXISTING_PATHS[@]} -eq 0 ]; then
  echo "no search paths exist yet; nothing to scan."
  exit 0
fi

for pat in "${FORBIDDEN_PATTERNS[@]}"; do
  # -r recursive, -F fixed-string, -n line numbers, -I skip binaries
  if HITS=$(grep -rFnI "${EXCLUDES[@]}" -- "$pat" "${EXISTING_PATHS[@]}" 2>/dev/null); then
    echo "FORBIDDEN endpoint reference: '$pat'"
    echo "$HITS"
    echo
    EXIT=1
  fi
done

# Also: assert positive presence of Vertex AI usage somewhere in agents/ once skeletons exist.
# (Soft check — warn only, do not fail; full check arrives once user adds ADK code.)
if [ -d agents ]; then
  if ! grep -rqI --include="*.py" -F "aiplatform" agents 2>/dev/null; then
    echo "WARN: no agents/**/*.py references google-cloud-aiplatform yet."
    echo "      This is acceptable for placeholder skeletons but MUST be present before submission."
  fi
fi

if [ $EXIT -eq 0 ]; then
  echo "OK — no forbidden LLM endpoints detected."
else
  echo "FAIL — non-Vertex LLM endpoint references found. See above."
fi
exit $EXIT
