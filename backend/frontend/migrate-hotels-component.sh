#!/bin/bash

# Script para migrar componentes de hotéis v1 → v2
# Uso: ./migrate-hotels-component.sh <caminho-do-arquivo>

FILE=$1
BACKUP_DIR="migration-backups"

if [ -z "$FILE" ]; then
  echo "❌ Uso: $0 <caminho-do-arquivo>"
  echo "Exemplo: $0 src/apps/hotels-app/pages/home.tsx"
  exit 1
fi

if [ ! -f "$FILE" ]; then
  echo "❌ Ficheiro não encontrado: $FILE"
  exit 1
fi

# Criar diretório de backups
mkdir -p "$BACKUP_DIR"

# Criar backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/$(basename $FILE).backup_$TIMESTAMP"
cp "$FILE" "$BACKUP_FILE"
echo "✅ Backup criado: $BACKUP_FILE"

# Analisar o arquivo
echo "🔍 Analisando $FILE..."
echo ""

# 1. Verificar se já usa hotelService
if grep -q "hotelService" "$FILE"; then
  echo "✅ Já usa hotelService"
else
  echo "⚠️  Não usa hotelService - precisa migrar"
fi

# 2. Verificar endpoints antigos
echo ""
echo "🔌 Endpoints antigos encontrados:"
grep -n "/api/hotels\|searchHotels\|getHotel" "$FILE" | head -10

# 3. Verificar imports
echo ""
echo "📦 Imports encontrados:"
grep -n "import.*from" "$FILE" | head -10

# 4. Criar relatório
echo ""
echo "📋 RELATÓRIO DE MIGRAÇÃO PARA: $(basename $FILE)"
echo "=============================================="
echo "1. Faça backup: ✅"
echo "2. Verifique se precisa importar hotelService"
echo "3. Substitua chamadas /api/hotels por hotelService"
echo "4. Use searchHotelsWithFallback() para migração gradual"
echo "5. Teste o componente"
echo ""
echo "💡 COMANDOS ÚTEIS:"
echo "   # Testar se v2 funciona"
echo "   curl 'http://localhost:8000/api/v2/hotels/search?location=Maputo'"
echo ""
echo "📁 Backup salvo em: $BACKUP_FILE"
