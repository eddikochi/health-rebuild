#!/usr/bin/env bash
# Publica o app no GitHub Pages (grátis) tornando o repositório PÚBLICO.
# Rode isto se quiser o link HTTPS para abrir no celular sem conta paga.
#
#   bash scripts/publish-pages.sh
#
# Alternativa privada: importe o repo na Vercel (mantém privado) — veja README.
set -euo pipefail

REPO="eddikochi/health-rebuild"
URL="https://eddikochi.github.io/health-rebuild/"

echo "→ Tornando o repositório público…"
gh repo edit "$REPO" --visibility public --accept-visibility-change-consequences

echo "→ Habilitando GitHub Pages (fonte: GitHub Actions)…"
gh api -X POST "repos/$REPO/pages" -f build_type=workflow >/dev/null 2>&1 || \
  gh api -X PUT "repos/$REPO/pages" -f build_type=workflow >/dev/null 2>&1 || true

echo "→ Disparando o deploy…"
gh workflow run "Deploy to GitHub Pages" --repo "$REPO"

echo "→ Aguardando a publicação (pode levar ~1–2 min)…"
sleep 15
gh run watch "$(gh run list --repo "$REPO" --workflow 'Deploy to GitHub Pages' --limit 1 --json databaseId --jq '.[0].databaseId')" --repo "$REPO" --exit-status || true

echo
echo "✅ Pronto! Abra no celular:"
echo "   $URL"
