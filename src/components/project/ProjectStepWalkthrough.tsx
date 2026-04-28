import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Flask,
  SpinnerGap,
  XCircle,
  LockSimple,
} from '@phosphor-icons/react'
import { CodeEditor } from '@/components/CodeEditor'
import type { ProjectStep } from '@/types/project'
import { SkillVideoPlayer } from '@/components/common/SkillVideoPlayer'

// ── Legacy GIF walkthrough props (tutorial flow) ──────────────────────────────

interface GifWalkthroughProps {
  gifUrl?: string
  caption?: string
  tddProps?: undefined
}

// ── TDD step props ─────────────────────────────────────────────────────────────

export interface TestResult {
  hidden: boolean
  expected?: string
  actualOutput: string
  passed: boolean
  error?: string
}

interface TddStepProps {
  tddProps: {
    step: ProjectStep
    language: string
    stepIndex: number
    totalSteps: number
    testResults: TestResult[]
    isExecuting: boolean
    isStepValidated: boolean
    consoleOutput?: string
    onRunTests: (code: string) => void
    onNext: () => void
    onPrevious: () => void
    onComplete: () => void
    isFirst: boolean
    isLast: boolean
  }
  gifUrl?: undefined
  caption?: undefined
}

type ProjectStepWalkthroughProps = GifWalkthroughProps | TddStepProps

// ── Main component ────────────────────────────────────────────────────────────

export function ProjectStepWalkthrough(props: ProjectStepWalkthroughProps) {
  // ── TDD mode ────────────────────────────────────────────────────────────────
  if (props.tddProps) {
    return <TddStepView {...props.tddProps} />
  }

  // ── Legacy GIF walkthrough (tutorial mode) ──────────────────────────────────
  return <GifWalkthrough gifUrl={props.gifUrl} caption={props.caption} />
}

// ── TDD step view ─────────────────────────────────────────────────────────────

function TddStepView({
  step,
  language,
  stepIndex,
  totalSteps,
  testResults,
  isExecuting,
  isStepValidated,
  consoleOutput,
  onRunTests,
  onNext,
  onPrevious,
  onComplete,
  isFirst,
  isLast,
}: NonNullable<TddStepProps['tddProps']>) {
  const [code, setCode] = useState(step.initialCode)

  // Reset editor when step changes
  useMemo(() => {
    setCode(step.initialCode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id])

  const allPassed = testResults.length > 0 && testResults.every(r => r.passed)

  return (
    <div className="space-y-4">
      {/* ── Step header ── */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">
          Step {stepIndex + 1} of {totalSteps}
        </span>
        {isStepValidated && (
          <Badge className="bg-green-500/15 text-green-600 border border-green-500/30 gap-1">
            <CheckCircle size={14} weight="fill" />
            All tests passing
          </Badge>
        )}
      </div>

      {/* ── Sticky video player ── */}
      {step.videoId && (
        <div className="sticky top-0 z-20 bg-background pt-2 pb-4 border-b border-border/60 shadow-[0_4px_12px_-2px_hsl(var(--border)/0.5)]">
          <SkillVideoPlayer
            videoId={step.videoId}
            title={step.title}
            desc="Watch this explanation as you work through the step."
            level="Beginner"
            channel="Tutorial"
            accentColor="bg-indigo-600"
          />
        </div>
      )}

      {/* ── Instructions ── */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <div className="p-5 space-y-2">
          <h2 className="text-xl font-bold">{step.title}</h2>
          <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-line">
            {step.instructions}
          </div>
        </div>
      </Card>

      {/* ── Code editor ── */}
      <Card className="border-2 overflow-hidden">
        <CodeEditor
          code={code}
          onChange={setCode}
          language={language}
          showExecutionControls={false}
          showOutputPanel={false}
        />
      </Card>

      {/* ── Run & Test button ── */}
      <Button
        size="lg"
        onClick={() => onRunTests(code)}
        disabled={isExecuting}
        className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        {isExecuting ? (
          <>
            <SpinnerGap size={18} className="animate-spin" />
            Running tests…
          </>
        ) : (
          <>
            <Flask size={18} weight="duotone" />
            Run &amp; Test
          </>
        )}
      </Button>

      {/* ── Terminal output ── */}
      {consoleOutput && (
        <div className="rounded-lg overflow-hidden border border-zinc-700 shadow-lg">
          <div className="bg-zinc-800 px-4 py-2 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-zinc-400 text-xs font-mono ml-2">Terminal Output</span>
          </div>
          <pre className="bg-zinc-950 p-4 font-mono text-sm text-green-400 whitespace-pre-wrap min-h-[56px] max-h-[220px] overflow-y-auto m-0 leading-relaxed">{consoleOutput}</pre>
        </div>
      )}

      {/* ── Test results console ── */}
      {testResults.length > 0 && (
        <Card
          className={`border-2 transition-colors duration-300 ${
            allPassed
              ? 'border-green-500/60 bg-green-500/5'
              : 'border-red-500/60 bg-red-500/5'
          }`}
        >
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-sm">
              {allPassed ? (
                <>
                  <CheckCircle size={16} className="text-green-600" weight="fill" />
                  <span className="text-green-700">All tests passed!</span>
                </>
              ) : (
                <>
                  <XCircle size={16} className="text-red-600" weight="fill" />
                  <span className="text-red-700">Some tests failed</span>
                </>
              )}
            </div>

            <div className="space-y-2">
              {testResults.map((result, i) => (
                <div
                  key={i}
                  className={`rounded-md px-3 py-2 text-sm font-mono flex items-start gap-2 border ${
                    result.passed
                      ? 'bg-green-500/10 border-green-500/20 text-green-800'
                      : 'bg-red-500/10 border-red-500/20 text-red-800'
                  }`}
                >
                  {result.passed ? (
                    <CheckCircle size={15} weight="fill" className="mt-0.5 shrink-0 text-green-600" />
                  ) : (
                    <XCircle size={15} weight="fill" className="mt-0.5 shrink-0 text-red-600" />
                  )}
                  <div className="flex-1 min-w-0">
                    {result.hidden ? (
                      <span className="text-muted-foreground italic">
                        Hidden test case {i + 1} — {result.passed ? 'passed' : 'failed'}
                      </span>
                    ) : (
                      <>
                        <div>
                          Output: <span className="font-semibold">{result.actualOutput || '(empty)'}</span>
                        </div>
                        {!result.passed && result.expected && (
                          <div className="text-xs mt-0.5">
                            Expected: <span className="font-semibold">{result.expected}</span>
                          </div>
                        )}
                        {result.error && (
                          <div className="text-xs mt-1 text-red-700 whitespace-pre-wrap">{result.error}</div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ── Navigation ── */}
      <div className="flex justify-between gap-4 pt-2">
        <Button
          variant="outline"
          size="lg"
          onClick={onPrevious}
          disabled={isFirst}
          className="border-2"
        >
          <ArrowLeft className="mr-2" size={18} />
          Previous
        </Button>

        {isLast ? (
          <Button
            size="lg"
            onClick={onComplete}
            disabled={!isStepValidated}
            className={`gap-2 ${
              isStepValidated
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'pointer-events-none opacity-50 bg-muted text-muted-foreground'
            }`}
          >
            {!isStepValidated && <LockSimple size={18} weight="fill" />}
            <CheckCircle size={20} weight="fill" />
            Complete Project
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={onNext}
            disabled={!isStepValidated}
            className={`gap-2 ${
              isStepValidated
                ? 'bg-primary hover:bg-primary/90'
                : 'pointer-events-none opacity-50 bg-muted text-muted-foreground'
            }`}
          >
            {!isStepValidated && <LockSimple size={18} weight="fill" />}
            Next Step
            <ArrowRight className="ml-1" size={18} />
          </Button>
        )}
      </div>
    </div>
  )
}

// ── Legacy GIF walkthrough ────────────────────────────────────────────────────

function GifWalkthrough({ gifUrl, caption }: { gifUrl?: string; caption?: string }) {
  const [loadError, setLoadError] = useState(false)

  const safeWalkthroughMedia = useMemo(() => {
    if (!gifUrl) return null
    try {
      const parsed = new URL(gifUrl)
      const allowedHosts = new Set(['media.giphy.com', 'i.giphy.com', 'giphy.com'])
      if (!allowedHosts.has(parsed.hostname)) return null

      const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(parsed.pathname)
      return {
        kind: isVideo ? 'video' : 'image',
        url: gifUrl,
      }
    } catch {
      return null
    }
  }, [gifUrl])

  if (!safeWalkthroughMedia || loadError) return null

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-primary font-semibold">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10">
            👀
          </span>
          <span>Walkthrough</span>
        </div>
        <div className="rounded-lg overflow-hidden border border-primary/20 bg-background">
          {safeWalkthroughMedia.kind === 'video' ? (
            <video
              src={safeWalkthroughMedia.url}
              className="w-full h-auto object-cover"
              playsInline
              muted
              loop
              autoPlay
              controls
              preload="metadata"
              onError={() => setLoadError(true)}
            >
              Your browser does not support the walkthrough video.
            </video>
          ) : (
            <img
              src={safeWalkthroughMedia.url}
              alt={caption || 'Step walkthrough'}
              className="w-full h-auto object-cover"
              loading="lazy"
              onError={() => setLoadError(true)}
            />
          )}
        </div>
        {caption && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {caption}
          </p>
        )}
      </div>
    </Card>
  )
}
