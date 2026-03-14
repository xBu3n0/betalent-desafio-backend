#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FORCE="${1:-}"

usage() {
  echo "Uso: ./scripts/init-env.sh [--force]"
}

copy_env() {
  local source_file="$1"
  local target_file="$2"

  if [[ ! -f "$source_file" ]]; then
    echo "Arquivo de exemplo nao encontrado: $source_file" >&2
    exit 1
  fi

  if [[ -f "$target_file" && "$FORCE" != "--force" ]]; then
    echo "Mantido: $target_file"
    return
  fi

  cp "$source_file" "$target_file"
  echo "Criado: $target_file"
}

if [[ -n "$FORCE" && "$FORCE" != "--force" ]]; then
  usage
  exit 1
fi

copy_env "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
copy_env "$ROOT_DIR/adonis/.env.example" "$ROOT_DIR/adonis/.env"

echo "Arquivos .env prontos. Inicie a stack com: docker compose up -d --build"
