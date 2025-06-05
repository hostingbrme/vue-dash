/**
 * Manipula requisições para /api/data
 * GET: Retorna todos os dados do KV
 * PUT: Substitui todos os dados no KV pelos dados enviados no corpo da requisição
 */
export async function onRequest(context) {
  // context contém informações sobre a requisição, ambiente, etc.
  // context.env contém os bindings (como nosso DB_KV)
  // context.request contém detalhes da requisição (método, corpo, etc.)

  const { request, env } = context
  const kv = env.DB_KV // Acessa o KV através do binding que criamos
  const DATA_KEY = 'dashboardData' // Chave única onde guardaremos *todo* o array de dados no KV

  try {
    if (request.method === 'GET') {
      // Tenta ler os dados da chave DATA_KEY no KV
      const data = await kv.get(DATA_KEY, { type: 'json' })
      if (data === null) {
        // Se não houver dados ainda, retorna um array vazio
        return new Response(JSON.stringify([]), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        })
      }
      // Retorna os dados encontrados
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    } else if (request.method === 'PUT') {
      // Espera que o corpo da requisição seja um JSON com o array completo de dados
      const newData = await request.json()

      // Validação básica (opcional, mas recomendado)
      if (!Array.isArray(newData)) {
        return new Response('Corpo da requisição inválido, esperado um array JSON.', {
          status: 400,
        })
      }

      // Salva (sobrescreve) os novos dados na chave DATA_KEY no KV
      await kv.put(DATA_KEY, JSON.stringify(newData))

      // Retorna sucesso
      return new Response(JSON.stringify({ success: true, message: 'Dados salvos no KV.' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      // Método não suportado
      return new Response('Método não permitido', { status: 405 })
    }
  } catch (error) {
    console.error(`Erro na Function /api/data (${request.method}):`, error)
    return new Response('Erro interno do servidor', { status: 500 })
  }
}
