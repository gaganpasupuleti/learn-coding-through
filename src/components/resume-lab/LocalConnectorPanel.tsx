import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, XCircle } from 'lucide-react'

import {
  fetchConnectorModels,
  fetchConnectorStatus,
  pairConnector,
  revokeConnectorPairing,
} from '@/lib/ai/connector-client'
import type { ConnectorModel, ConnectorStatus } from '@/lib/ai/connector-schemas'
import {
  readSelectedModel,
  writeSelectedModel,
} from '@/lib/ai/codequest-local-provider'
import {
  clearPairedConnectorToken,
  hasPairedConnectorToken,
} from '@/lib/connector-url'
import { cn } from '@/lib/utils'

type PanelState =
  | 'checking'
  | 'connector-unavailable'
  | 'pairing-required'
  | 'ollama-unavailable'
  | 'no-models'
  | 'models-available'
  | 'model-selected'

interface LocalConnectorPanelProps {
  className?: string
}

export function LocalConnectorPanel({ className }: LocalConnectorPanelProps) {
  const [status, setStatus] = useState<ConnectorStatus | null>(null)
  const [models, setModels] = useState<ConnectorModel[]>([])
  const [selectedModel, setSelectedModel] = useState<string | null>(() => readSelectedModel())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pairingCode, setPairingCode] = useState('')
  const [pairingBusy, setPairingBusy] = useState(false)
  const [paired, setPaired] = useState(() => hasPairedConnectorToken())

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const nextStatus = await fetchConnectorStatus()
      setStatus(nextStatus)
      const needsPairing =
        nextStatus.pairing?.state === 'unpaired' ||
        nextStatus.pairing?.pairing_required === true ||
        !hasPairedConnectorToken()
      setPaired(!needsPairing && hasPairedConnectorToken())

      if (needsPairing) {
        setModels([])
        return
      }
      if (!nextStatus.ollama.connected) {
        setModels([])
        return
      }
      const nextModels = await fetchConnectorModels()
      setModels(nextModels)
      const remembered = readSelectedModel()
      const firstModel = nextModels[0]?.model ?? null
      const resolved =
        remembered && nextModels.some((m) => m.model === remembered) ? remembered : firstModel
      setSelectedModel(resolved)
      if (resolved) writeSelectedModel(resolved)
    } catch (err) {
      setStatus(null)
      setModels([])
      setError(err instanceof Error ? err.message : 'Connector is unavailable')
      setPaired(hasPairedConnectorToken())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const onPair = async () => {
    setPairingBusy(true)
    setError(null)
    try {
      await pairConnector(pairingCode)
      setPairingCode('')
      setPaired(true)
      await refresh()
    } catch (err) {
      clearPairedConnectorToken()
      setPaired(false)
      setError(err instanceof Error ? err.message : 'Pairing failed')
    } finally {
      setPairingBusy(false)
    }
  }

  const onDisconnect = async () => {
    setPairingBusy(true)
    setError(null)
    try {
      await revokeConnectorPairing().catch(() => {
        clearPairedConnectorToken()
      })
      setPaired(false)
      setModels([])
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Disconnect failed')
    } finally {
      setPairingBusy(false)
    }
  }

  const panelState: PanelState = useMemo(() => {
    if (loading) return 'checking'
    if (error && !status) return 'connector-unavailable'
    if (!paired || status?.pairing?.state === 'unpaired') return 'pairing-required'
    if (!status?.ollama.connected) return 'ollama-unavailable'
    if (models.length === 0) return 'no-models'
    if (selectedModel) return 'model-selected'
    return 'models-available'
  }, [error, loading, models.length, paired, selectedModel, status])

  const statusLabel = useMemo(() => {
    switch (panelState) {
      case 'checking':
        return 'Checking connector'
      case 'connector-unavailable':
        return 'Connector unavailable'
      case 'pairing-required':
        return 'Pairing required'
      case 'ollama-unavailable':
        return 'Connector paired'
      case 'no-models':
        return 'No local models installed'
      case 'models-available':
      case 'model-selected':
        return 'Local AI ready'
      default: {
        const exhaustive: never = panelState
        return exhaustive
      }
    }
  }, [panelState])

  return (
    <section
      className={cn('rounded-xl border border-slate-200 bg-white p-4 shadow-sm', className)}
      aria-label="Local AI connector status"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Local AI Connector</h2>
          <p className="mt-1 text-xs text-slate-600">
            Pair this browser with the connector running on your laptop. Generation uses Ollama
            locally — no cloud token is stored in the app config.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          Refresh
        </button>
      </div>

      <div className="mt-4 grid gap-2 text-xs sm:grid-cols-4">
        <StatusRow
          label="Connector"
          value={panelState === 'connector-unavailable' ? 'Unavailable' : 'Running'}
          ok={panelState !== 'checking' && panelState !== 'connector-unavailable'}
          loading={panelState === 'checking'}
        />
        <StatusRow
          label="Pairing"
          value={paired ? 'Paired' : 'Unpaired'}
          ok={paired}
          loading={panelState === 'checking'}
        />
        <StatusRow
          label="Ollama"
          value={status?.ollama.connected ? 'Connected' : 'Unavailable'}
          ok={Boolean(status?.ollama.connected)}
          loading={panelState === 'checking'}
        />
        <StatusRow
          label="Model"
          value={selectedModel ?? 'Not selected'}
          ok={Boolean(selectedModel)}
          loading={panelState === 'checking'}
        />
      </div>

      <p className="mt-3 text-sm font-medium text-slate-800">{statusLabel}</p>

      {panelState === 'pairing-required' && (
        <div className="mt-3 space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs text-amber-900">
            Start the Local Connector on this laptop, then enter the one-time code printed in its
            console (expires in 5 minutes).
          </p>
          <label htmlFor="connector-pairing-code" className="text-xs font-medium text-slate-700">
            Pairing code
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              id="connector-pairing-code"
              value={pairingCode}
              onChange={(event) => setPairingCode(event.target.value.toUpperCase())}
              autoComplete="one-time-code"
              spellCheck={false}
              className="min-w-[12rem] flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm tracking-wider text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
              placeholder="XXXXXXXX"
            />
            <button
              type="button"
              disabled={pairingBusy || pairingCode.trim().length < 6}
              onClick={() => void onPair()}
              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              {pairingBusy ? 'Pairing…' : 'Pair device'}
            </button>
          </div>
        </div>
      )}

      {paired && (
        <div className="mt-3">
          <button
            type="button"
            disabled={pairingBusy}
            onClick={() => void onDisconnect()}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Disconnect / re-pair
          </button>
        </div>
      )}

      {panelState === 'no-models' && (
        <p className="mt-2 text-xs text-slate-600">
          Install a model with{' '}
          <code className="rounded bg-slate-100 px-1">ollama pull &lt;model-name&gt;</code>
        </p>
      )}

      {error && (
        <p className="mt-2 flex items-start gap-2 text-xs text-rose-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {error.includes('pairing') ? 'Local Connector pairing is required.' : error}
        </p>
      )}

      {models.length > 0 && (
        <div className="mt-3">
          <label htmlFor="local-model-select" className="text-xs font-medium text-slate-700">
            Installed Ollama models
          </label>
          <select
            id="local-model-select"
            value={selectedModel ?? ''}
            onChange={(event) => {
              const value = event.target.value
              setSelectedModel(value)
              writeSelectedModel(value)
            }}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          >
            {models.map((model) => (
              <option key={model.model} value={model.model}>
                {model.name || model.model}
              </option>
            ))}
          </select>
        </div>
      )}

      <p className="mt-3 text-xs text-slate-500">
        Hugging Face API — Coming Later (disabled by default)
      </p>
    </section>
  )
}

function StatusRow({
  label,
  value,
  ok,
  loading,
}: {
  label: string
  value: string
  ok: boolean
  loading: boolean
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-800">
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" aria-hidden />
        ) : ok ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
        ) : (
          <XCircle className="h-3.5 w-3.5 text-rose-600" aria-hidden />
        )}
        <span className="truncate">{value}</span>
      </p>
    </div>
  )
}
