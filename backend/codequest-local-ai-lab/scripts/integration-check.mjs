import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { getConfig } from '../connector/src/config.mjs'
import { createPairingStore } from '../connector/src/pairing.mjs'
import { createConnectorServer } from '../connector/src/server.mjs'
import { createMockOllamaServer } from '../mock-ollama/src/server.mjs'

function listen(server) {
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address())))
}

function close(server) {
  return new Promise((resolve) => server.close(resolve))
}

const origin = 'http://127.0.0.1:5173'
const token = 'integration-token'
const storePath = path.join(os.tmpdir(), `cq-connector-integration-${process.pid}.json`)
process.env.CQ_TEST_BEARER_TOKEN = token
process.env.CQ_CONNECTOR_PAIRING_STORE = storePath

const pairing = createPairingStore({ storePath })
const mock = createMockOllamaServer()
const mockAddress = await listen(mock)
const connector = createConnectorServer({
  config: getConfig({
    port: 0,
    allowedOrigins: [origin],
    labToken: '',
    pairingStorePath: storePath,
    ollamaBaseUrl: `http://127.0.0.1:${mockAddress.port}`,
    probeTimeoutMs: 1000,
    generationTimeoutMs: 2000,
  }),
  pairingStore: pairing,
})
const connectorAddress = await listen(connector)
const baseUrl = `http://127.0.0.1:${connectorAddress.port}`

try {
  const headers = { Origin: origin, 'X-CodeQuest-Connector-Token': token }
  const status = await fetch(`${baseUrl}/api/v1/status`, { headers }).then((response) => response.json())
  const models = await fetch(`${baseUrl}/api/v1/models`, { headers }).then((response) => response.json())
  if (!Array.isArray(models.models) || !models.models[0]?.name) {
    throw new Error(`Integration proof missing models: ${JSON.stringify(models)}`)
  }
  const analysisResponse = await fetch(`${baseUrl}/api/v1/resume/tailor`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: models.models[0].name,
      resume_text: 'Data Analyst\nBuilt SQL and Power BI dashboards for weekly operations reporting.',
      job_description: 'Data Analyst role requiring SQL, Python, Power BI, and stakeholder reporting.',
    }),
  })
  const analysis = await analysisResponse.json()
  if (!analysisResponse.ok || !status.ollama.connected || !analysis.result?.suggestions?.length) {
    throw new Error('Integration proof did not produce the required output')
  }

  console.log(
    JSON.stringify(
      {
        connection: {
          connector_status: status.connector.status,
          bind: status.connector.bind,
          ollama_connected: status.ollama.connected,
          pairing: status.pairing?.state,
        },
        model: models.models[0].name,
        output: {
          suggestion_count: analysis.result.suggestions.length,
          evidence_verified: analysis.result.suggestions[0].evidence_verified,
          missing_keywords: analysis.result.missing_keywords,
        },
        meta: analysis.meta,
      },
      null,
      2,
    ),
  )
} finally {
  await close(connector)
  await close(mock)
  try {
    fs.unlinkSync(storePath)
  } catch {
    // ignore
  }
  delete process.env.CQ_TEST_BEARER_TOKEN
  delete process.env.CQ_CONNECTOR_PAIRING_STORE
}
