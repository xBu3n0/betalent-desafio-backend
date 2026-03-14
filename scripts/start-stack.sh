#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FORCE_ENV=false
DETACH=false
BUILD=true

usage() {
  cat <<'EOF'
Uso: ./scripts/start-stack.sh [--force] [--detach] [--no-build]

Opcoes:
  --force     recria .env e adonis/.env a partir dos exemplos
  --detach    sobe os containers em background
  --no-build  nao executa build antes do up
  --help      mostra esta mensagem
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --force)
      FORCE_ENV=true
      ;;
    --detach)
      DETACH=true
      ;;
    --no-build)
      BUILD=false
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Opcao invalida: $1" >&2
      usage
      exit 1
      ;;
  esac

  shift
done

INIT_ENV_ARGS=()
COMPOSE_ARGS=(up)

if [[ "$FORCE_ENV" == true ]]; then
  INIT_ENV_ARGS+=(--force)
fi

if [[ "$BUILD" == true ]]; then
  COMPOSE_ARGS+=(--build)
fi

if [[ "$DETACH" == true ]]; then
  COMPOSE_ARGS+=(-d)
fi

"$ROOT_DIR/scripts/init-env.sh" "${INIT_ENV_ARGS[@]}"

cd "$ROOT_DIR"

echo "Iniciando stack com: docker compose ${COMPOSE_ARGS[*]}"
exec docker compose "${COMPOSE_ARGS[@]}"
