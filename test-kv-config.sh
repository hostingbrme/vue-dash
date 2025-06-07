#!/bin/bash

# Script de Teste - Configuração KV Namespace
# Este script verifica se a configuração do KV está correta

echo "🔍 Verificando Configuração KV Namespace..."
echo "=============================================="

# Verificar se está logado
echo "1. Verificando autenticação..."
if npx wrangler whoami > /dev/null 2>&1; then
    echo "✅ Autenticado no Cloudflare"
    npx wrangler whoami
else
    echo "❌ Não autenticado. Execute: npx wrangler login"
    exit 1
fi

echo ""

# Verificar wrangler.toml
echo "2. Verificando wrangler.toml..."
if [ -f "wrangler.toml" ]; then
    echo "✅ Arquivo wrangler.toml encontrado"
    
    # Verificar se tem preview_id
    if grep -q "preview_id" wrangler.toml; then
        echo "✅ preview_id configurado"
        echo "   Preview ID: $(grep preview_id wrangler.toml | cut -d'"' -f2)"
    else
        echo "❌ preview_id não encontrado no wrangler.toml"
        echo "   Execute: npx wrangler kv namespace create \"vue-dash-dev\" --preview"
        echo "   E adicione o preview_id retornado ao wrangler.toml"
        exit 1
    fi
else
    echo "❌ Arquivo wrangler.toml não encontrado"
    exit 1
fi

echo ""

# Listar namespaces
echo "3. Listando namespaces KV..."
npx wrangler kv namespace list

echo ""

# Verificar se o namespace de preview existe
echo "4. Verificando namespace de desenvolvimento..."
PREVIEW_ID=$(grep preview_id wrangler.toml | cut -d'"' -f2)

if [ "$PREVIEW_ID" != "SEU_PREVIEW_ID_AQUI" ]; then
    echo "✅ Preview ID configurado: $PREVIEW_ID"
    
    # Testar acesso ao namespace
    echo "5. Testando acesso ao namespace de desenvolvimento..."
    if npx wrangler kv key list --namespace-id="$PREVIEW_ID" --preview > /dev/null 2>&1; then
        echo "✅ Namespace de desenvolvimento acessível"
    else
        echo "❌ Erro ao acessar namespace de desenvolvimento"
        echo "   Verifique se o preview_id está correto"
        exit 1
    fi
else
    echo "❌ Preview ID não configurado corretamente"
    echo "   Substitua 'SEU_PREVIEW_ID_AQUI' pelo ID real"
    exit 1
fi

echo ""

# Verificar dependências
echo "6. Verificando dependências..."
if [ -f "package.json" ]; then
    echo "✅ package.json encontrado"
    
    if npm list > /dev/null 2>&1; then
        echo "✅ Dependências instaladas"
    else
        echo "⚠️  Execute: npm install"
    fi
else
    echo "❌ package.json não encontrado"
    exit 1
fi

echo ""
echo "🎉 Configuração verificada com sucesso!"
echo "=============================================="
echo ""
echo "Para executar o desenvolvimento local:"
echo "  npm run dev:cf"
echo ""
echo "Acesse: http://localhost:8788"
echo ""
echo "Para testar a API:"
echo "  curl http://localhost:8788/api/data"

