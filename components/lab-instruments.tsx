'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'

type SourceId = 'uniform' | 'skewed' | 'bimodal'
type SampleMean = { id: number; value: number }
type RegressionPoint = { id: number; x: number; y: number; outlier?: boolean }
type LineCoordinates = { x1: number; y1: number; x2: number; y2: number }
type LabInstrumentsProps = { active: boolean }

const sourceOptions: Array<{ id: SourceId; label: string }> = [
  { id: 'uniform', label: 'Uniform' },
  { id: 'skewed', label: 'Skewed' },
  { id: 'bimodal', label: 'Bimodal' },
]

const sourceParameters: Record<SourceId, { minimum: number; maximum: number; mean: number; standardDeviation: number; seed: number }> = {
  uniform: { minimum: 0, maximum: 1, mean: 0.5, standardDeviation: Math.sqrt(1 / 12), seed: 1807 },
  skewed: { minimum: 0, maximum: 3, mean: 1, standardDeviation: 1, seed: 2909 },
  bimodal: { minimum: -1.35, maximum: 1.35, mean: 0, standardDeviation: Math.sqrt(1.03), seed: 3911 },
}

const maxSamples = 2000
const histogramBinCount = 36
const histogramWidth = 720
const histogramHeight = 320
const histogramLeft = 38
const histogramRight = 704
const histogramTop = 22
const histogramBottom = 292
const regressionWidth = 720
const regressionHeight = 390
const regressionLeft = 52
const regressionRight = 698
const regressionTop = 34
const regressionBottom = 344

function createSeededRandom(seed: number) {
  let state = seed >>> 0

  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function drawSourceValue(source: SourceId, random: () => number) {
  if (source === 'uniform') return random()
  if (source === 'skewed') return -Math.log(Math.max(1e-9, 1 - random()))
  return (random() < 0.5 ? -1 : 1) + (random() - 0.5) * 0.6
}

function calculateSampleMean(source: SourceId, sampleSize: number, random: () => number) {
  let total = 0
  for (let index = 0; index < sampleSize; index += 1) total += drawSourceValue(source, random)
  return total / sampleSize
}

function summarize(values: number[]) {
  if (!values.length) return { mean: 0, standardDeviation: 0 }
  const mean = values.reduce((total, value) => total + value, 0) / values.length
  const variance = values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length
  return { mean, standardDeviation: Math.sqrt(variance) }
}

function normalDensity(value: number, mean: number, standardDeviation: number) {
  const zScore = (value - mean) / standardDeviation
  return Math.exp(-0.5 * zScore * zScore) / (standardDeviation * Math.sqrt(2 * Math.PI))
}

function buildHistogram(samples: SampleMean[], source: SourceId, sampleSize: number) {
  const parameters = sourceParameters[source]
  const domainWidth = parameters.maximum - parameters.minimum
  const binWidth = domainWidth / histogramBinCount
  const plotWidth = histogramRight - histogramLeft
  const plotHeight = histogramBottom - histogramTop
  const counts = Array.from({ length: histogramBinCount }, () => 0)
  const stackIndex = Array.from({ length: histogramBinCount }, () => 0)
  const bins = samples.map((sample) => {
    const index = Math.max(
      0,
      Math.min(histogramBinCount - 1, Math.floor(((sample.value - parameters.minimum) / domainWidth) * histogramBinCount)),
    )
    const currentStack = stackIndex[index]
    stackIndex[index] += 1
    counts[index] += 1
    return { id: sample.id, index, currentStack }
  })
  const maximumObserved = Math.max(1, ...counts)
  const expected = Array.from({ length: 81 }, (_, index) => {
    const value = parameters.minimum + (index / 80) * domainWidth
    const samplingDeviation = parameters.standardDeviation / Math.sqrt(sampleSize)
    return {
      value,
      count: normalDensity(value, parameters.mean, samplingDeviation) * binWidth * samples.length,
    }
  })
  const peak = Math.max(maximumObserved, ...expected.map((point) => point.count), 1)
  const dotGap = Math.min(4.2, plotHeight / maximumObserved)
  const dots = bins.map((bin) => ({
    id: bin.id,
    cx: histogramLeft + ((bin.index + 0.5) / histogramBinCount) * plotWidth,
    cy: histogramBottom - (bin.currentStack + 0.5) * dotGap,
    radius: Math.min(1.8, Math.max(0.65, dotGap * 0.38)),
  }))
  const curve = expected
    .map((point, index) => {
      const x = histogramLeft + (index / 80) * plotWidth
      const y = histogramBottom - (point.count / peak) * plotHeight
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')

  return { dots, curve }
}

function createDefaultRegressionPoints(): RegressionPoint[] {
  const random = createSeededRandom(8137)
  return Array.from({ length: 14 }, (_, index) => {
    const x = 5 + index * 6.4 + random() * 5
    const y = 12 + x * 0.76 + (random() - 0.5) * 24
    return { id: index, x, y }
  })
}

function calculateRegression(points: RegressionPoint[]) {
  if (!points.length) return { slope: 0, intercept: 0, correlation: 0, rSquared: 0 }

  const meanX = points.reduce((total, point) => total + point.x, 0) / points.length
  const meanY = points.reduce((total, point) => total + point.y, 0) / points.length
  const sumSquaresX = points.reduce((total, point) => total + (point.x - meanX) ** 2, 0)
  const sumSquaresY = points.reduce((total, point) => total + (point.y - meanY) ** 2, 0)
  const sumProducts = points.reduce((total, point) => total + (point.x - meanX) * (point.y - meanY), 0)
  const slope = sumSquaresX === 0 ? 0 : sumProducts / sumSquaresX
  const intercept = meanY - slope * meanX
  const correlation = sumSquaresX === 0 || sumSquaresY === 0 ? 0 : sumProducts / Math.sqrt(sumSquaresX * sumSquaresY)

  return { slope, intercept, correlation, rSquared: correlation ** 2 }
}

function mapRegressionPoint(point: RegressionPoint) {
  return {
    x: regressionLeft + (point.x / 100) * (regressionRight - regressionLeft),
    y: regressionBottom - (point.y / 120) * (regressionBottom - regressionTop),
  }
}

function lineValueToSvg(value: number) {
  return regressionBottom - (value / 120) * (regressionBottom - regressionTop)
}

function useReducedMotionPreference() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setReducedMotion(mediaQuery.matches)
    updatePreference()
    mediaQuery.addEventListener('change', updatePreference)
    return () => mediaQuery.removeEventListener('change', updatePreference)
  }, [])

  return reducedMotion
}

function useThrottledAnnouncement(message: string, active: boolean) {
  const [announcement, setAnnouncement] = useState(message)
  const latestMessage = useRef(message)
  const lastAnnouncedAt = useRef(0)
  const pendingTimer = useRef<number | null>(null)

  useEffect(() => {
    latestMessage.current = message
    if (!active) {
      if (pendingTimer.current !== null) window.clearTimeout(pendingTimer.current)
      pendingTimer.current = null
      return
    }

    const now = Date.now()
    const wait = 1000 - (now - lastAnnouncedAt.current)
    if (wait <= 0) {
      if (pendingTimer.current !== null) window.clearTimeout(pendingTimer.current)
      pendingTimer.current = null
      lastAnnouncedAt.current = now
      setAnnouncement(message)
    } else if (pendingTimer.current === null) {
      pendingTimer.current = window.setTimeout(() => {
        pendingTimer.current = null
        lastAnnouncedAt.current = Date.now()
        setAnnouncement(latestMessage.current)
      }, wait)
    }
  }, [active, message])

  useEffect(
    () => () => {
      if (pendingTimer.current !== null) window.clearTimeout(pendingTimer.current)
    },
    [],
  )

  return announcement
}

function NumericReadout({
  label,
  value,
  format,
  active,
  reducedMotion,
}: {
  label: string
  value: number
  format: (value: number) => string
  active: boolean
  reducedMotion: boolean
}) {
  const [displayValue, setDisplayValue] = useState(value)
  const currentValue = useRef(value)

  useEffect(() => {
    if (reducedMotion || !active) {
      currentValue.current = value
      setDisplayValue(value)
      return
    }

    const from = currentValue.current
    const startedAt = performance.now()
    let frame = 0
    let lastDisplayed = Number.NaN

    function tick(now: number) {
      const progress = Math.min((now - startedAt) / 360, 1)
      const eased = 1 - (1 - progress) ** 3
      const nextValue = from + (value - from) * eased
      currentValue.current = nextValue

      if (Math.abs(nextValue - lastDisplayed) >= 0.001 || progress === 1) {
        lastDisplayed = nextValue
        setDisplayValue(nextValue)
      }

      if (progress < 1) frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [active, reducedMotion, value])

  return (
    <div className="lab-readout">
      <span className="lab-readout-label">{label}</span>
      <output className="lab-readout-value">{format(displayValue)}</output>
    </div>
  )
}

function ReadoutGroup({
  message,
  active,
  children,
}: {
  message: string
  active: boolean
  children: ReactNode
}) {
  const announcement = useThrottledAnnouncement(message, active)

  return (
    <>
      <div className="lab-readouts">{children}</div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </>
  )
}

function SourceDistributionPlot({ source }: { source: SourceId }) {
  const paths: Record<SourceId, string> = {
    uniform: 'M 14 32 L 166 32',
    skewed: 'M 14 18 C 30 20, 43 35, 60 55 C 87 84, 121 96, 166 101',
    bimodal: 'M 14 96 C 29 96, 35 83, 45 56 C 54 31, 66 22, 78 42 C 90 64, 98 94, 109 89 C 121 84, 129 47, 143 32 C 152 22, 160 35, 166 51',
  }

  return (
    <svg className="clt-source-plot" viewBox="0 0 180 116" role="img" aria-label={`${sourceOptions.find((option) => option.id === source)?.label} source distribution`}>
      <line x1="12" y1="102" x2="168" y2="102" />
      <line x1="12" y1="12" x2="12" y2="102" />
      <path d={paths[source]} />
    </svg>
  )
}

function CentralLimitInstrument({ active }: { active: boolean }) {
  const reducedMotion = useReducedMotionPreference()
  const [source, setSource] = useState<SourceId>('uniform')
  const [sampleSize, setSampleSize] = useState(10)
  const [samples, setSamples] = useState<SampleMean[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const samplesRef = useRef<SampleMean[]>([])
  const sampleIdRef = useRef(0)
  const sourceRef = useRef<SourceId>('uniform')
  const sampleSizeRef = useRef(10)
  const reducedMotionRef = useRef(false)
  const randomRef = useRef(createSeededRandom(sourceParameters.uniform.seed))

  const appendSamples = useCallback((count: number) => {
    const remaining = maxSamples - samplesRef.current.length
    const amount = Math.min(count, remaining)
    if (amount <= 0) return

    const nextSamples = samplesRef.current.slice()
    for (let index = 0; index < amount; index += 1) {
      nextSamples.push({
        id: sampleIdRef.current,
        value: calculateSampleMean(sourceRef.current, sampleSizeRef.current, randomRef.current),
      })
      sampleIdRef.current += 1
    }

    samplesRef.current = nextSamples
    setSamples(nextSamples)
  }, [])

  const resetExperiment = useCallback((nextSource: SourceId, nextSampleSize: number) => {
    sourceRef.current = nextSource
    sampleSizeRef.current = nextSampleSize
    randomRef.current = createSeededRandom(sourceParameters[nextSource].seed)
    sampleIdRef.current = 0
    samplesRef.current = []
    setSamples([])
    setIsRunning(false)
    setSource(nextSource)
    setSampleSize(nextSampleSize)
    if (reducedMotionRef.current) appendSamples(500)
  }, [appendSamples])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const applyPreference = () => {
      reducedMotionRef.current = mediaQuery.matches
      if (mediaQuery.matches && samplesRef.current.length < 500) {
        appendSamples(500 - samplesRef.current.length)
      }
    }

    applyPreference()
    mediaQuery.addEventListener('change', applyPreference)
    return () => mediaQuery.removeEventListener('change', applyPreference)
  }, [appendSamples])

  useEffect(() => {
    if (!isRunning) return
    if (!active) {
      setIsRunning(false)
      return
    }

    const timer = window.setInterval(() => {
      const remaining = maxSamples - samplesRef.current.length
      if (remaining <= 0) {
        setIsRunning(false)
        return
      }

      appendSamples(Math.min(24, remaining))
      if (samplesRef.current.length >= maxSamples) setIsRunning(false)
    }, 36)

    return () => window.clearInterval(timer)
  }, [active, appendSamples, isRunning])

  const values = useMemo(() => samples.map((sample) => sample.value), [samples])
  const summary = useMemo(() => summarize(values), [values])
  const histogram = useMemo(() => buildHistogram(samples, source, sampleSize), [samples, sampleSize, source])
  const sourceLabel = sourceOptions.find((option) => option.id === source)?.label ?? 'Uniform'
  const announcement = `${samples.length} samples. Mean of sample means ${summary.mean.toFixed(3)}. Standard deviation of sample means ${summary.standardDeviation.toFixed(3)}.`

  function changeSource(nextSource: SourceId) {
    if (nextSource !== source) resetExperiment(nextSource, sampleSize)
  }

  function changeSampleSize(nextSampleSize: number) {
    resetExperiment(source, nextSampleSize)
  }

  return (
    <div className="lab-instrument clt-instrument">
      <div className="clt-layout">
        <aside className="clt-source-panel">
          <div className="lab-panel-heading">
            <span className="lab-kicker">Source / Distribution</span>
            <span className="lab-panel-value">{sourceLabel}</span>
          </div>
          <SourceDistributionPlot source={source} />
          <div className="clt-source-switch" role="group" aria-label="Choose source distribution">
            {sourceOptions.map((option) => (
              <button
                key={option.id}
                className="lab-segment-button"
                type="button"
                aria-pressed={source === option.id}
                onClick={() => changeSource(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </aside>

        <div className="clt-histogram-panel">
          <div className="lab-panel-heading">
            <span className="lab-kicker">Sample means / Histogram</span>
            <span className="lab-panel-value">n = {sampleSize}</span>
          </div>
          <div className="lab-chart-frame clt-chart-frame">
            <svg
              className="clt-histogram"
              viewBox={`0 0 ${histogramWidth} ${histogramHeight}`}
              preserveAspectRatio="none"
              role="img"
              aria-label={`${samples.length} sample means from the ${sourceLabel.toLowerCase()} distribution, with ${sampleSize} draws per sample`}
            >
              <line className="lab-chart-grid" x1={histogramLeft} y1="82" x2={histogramRight} y2="82" />
              <line className="lab-chart-grid" x1={histogramLeft} y1="172" x2={histogramRight} y2="172" />
              <line className="lab-chart-axis" x1={histogramLeft} y1={histogramBottom} x2={histogramRight} y2={histogramBottom} />
              <line className="lab-chart-axis" x1={histogramLeft} y1={histogramTop} x2={histogramLeft} y2={histogramBottom} />
              {[0.25, 0.5, 0.75].map((fraction) => {
                const x = histogramLeft + fraction * (histogramRight - histogramLeft)
                return <line className="lab-chart-tick" key={fraction} x1={x} y1={histogramBottom} x2={x} y2={histogramBottom + 5} />
              })}
              {histogram.dots.map((dot) => (
                <circle
                  className="lab-histogram-dot"
                  key={dot.id}
                  cx={dot.cx}
                  cy={dot.cy}
                  r={dot.radius}
                />
              ))}
              <path
                className="lab-theoretical-curve"
                d={histogram.curve}
                style={{ opacity: Math.min(0.88, samples.length / 500) }}
              />
            </svg>
            <span className="lab-chart-note">Each dot is one sample mean</span>
          </div>
        </div>
      </div>

      <div className="clt-control-row">
        <div className="clt-size-control">
          <div className="clt-size-heading">
            <label htmlFor="clt-sample-size">Sample size</label>
            <output htmlFor="clt-sample-size">n = {sampleSize}</output>
          </div>
          <input
            id="clt-sample-size"
            type="range"
            min="1"
            max="50"
            step="1"
            value={sampleSize}
            aria-label="Sample size"
            aria-valuetext={`${sampleSize} draws per sample`}
            onChange={(event) => changeSampleSize(Number(event.currentTarget.value))}
          />
          <div className="clt-range-ends" aria-hidden="true">
            <span>1</span>
            <span>50</span>
          </div>
        </div>

        <div className="lab-actions" role="group" aria-label="Central limit theorem controls">
          <button className="lab-action-button lab-action-button--primary" type="button" onClick={() => appendSamples(1)} disabled={samples.length >= maxSamples || isRunning}>
            Drop
          </button>
          <button className="lab-action-button" type="button" onClick={() => setIsRunning(true)} disabled={samples.length >= maxSamples || isRunning}>
            Run
          </button>
          <button className="lab-action-button" type="button" onClick={() => resetExperiment(source, sampleSize)}>
            Reset
          </button>
        </div>
      </div>

      <ReadoutGroup message={announcement} active={active}>
        <NumericReadout label="Sample count" value={samples.length} format={(value) => Math.round(value).toLocaleString('en-US')} active={active} reducedMotion={reducedMotion} />
        <NumericReadout label="Mean of sample means" value={summary.mean} format={(value) => value.toFixed(3)} active={active} reducedMotion={reducedMotion} />
        <NumericReadout label="Std. dev. of sample means" value={summary.standardDeviation} format={(value) => value.toFixed(3)} active={active} reducedMotion={reducedMotion} />
      </ReadoutGroup>

      <p className="lab-caption">Synthetic data, computed in your browser.</p>
    </div>
  )
}

function createRegressionLine(slope: number, intercept: number): LineCoordinates {
  return {
    x1: regressionLeft,
    y1: lineValueToSvg(intercept),
    x2: regressionRight,
    y2: lineValueToSvg(slope * 100 + intercept),
  }
}

function RegressionInstrument({ active }: { active: boolean }) {
  const reducedMotion = useReducedMotionPreference()
  const initialPoints = useMemo(() => createDefaultRegressionPoints(), [])
  const [points, setPoints] = useState<RegressionPoint[]>(initialPoints)
  const [showResiduals, setShowResiduals] = useState(false)
  const [displayedLine, setDisplayedLine] = useState<LineCoordinates>(() => createRegressionLine(calculateRegression(initialPoints).slope, calculateRegression(initialPoints).intercept))
  const pointsRef = useRef(points)
  const historyRef = useRef<RegressionPoint[][]>([])
  const nextPointIdRef = useRef(initialPoints.length)
  const draggingPointRef = useRef<number | null>(null)
  const chartRef = useRef<SVGSVGElement>(null)
  const displayedLineRef = useRef(displayedLine)

  const statistics = useMemo(() => calculateRegression(points), [points])
  const targetLine = useMemo(
    () => createRegressionLine(statistics.slope, statistics.intercept),
    [statistics.intercept, statistics.slope],
  )
  const hasOutlier = points.some((point) => point.outlier)
  const message = `Slope ${statistics.slope.toFixed(2)}. Intercept ${statistics.intercept.toFixed(2)}. r ${statistics.correlation.toFixed(2)}. R squared ${statistics.rSquared.toFixed(2)}.`

  const commitPoints = useCallback((nextPoints: RegressionPoint[]) => {
    pointsRef.current = nextPoints
    setPoints(nextPoints)
  }, [])

  const saveHistory = useCallback(() => {
    historyRef.current = [...historyRef.current, pointsRef.current.map((point) => ({ ...point }))].slice(-80)
  }, [])

  useEffect(() => {
    if (reducedMotion || !active) {
      displayedLineRef.current = targetLine
      setDisplayedLine(targetLine)
      return
    }

    const from = displayedLineRef.current
    const startedAt = performance.now()
    let frame = 0

    function tick(now: number) {
      const progress = Math.min((now - startedAt) / 400, 1)
      const eased = 1 - (1 - progress) ** 3
      const nextLine = {
        x1: from.x1 + (targetLine.x1 - from.x1) * eased,
        y1: from.y1 + (targetLine.y1 - from.y1) * eased,
        x2: from.x2 + (targetLine.x2 - from.x2) * eased,
        y2: from.y2 + (targetLine.y2 - from.y2) * eased,
      }
      displayedLineRef.current = nextLine
      setDisplayedLine(nextLine)
      if (progress < 1) frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [active, reducedMotion, targetLine])

  function getDataCoordinates(clientX: number, clientY: number) {
    const bounds = chartRef.current?.getBoundingClientRect()
    if (!bounds || !bounds.width || !bounds.height) return null

    const svgX = ((clientX - bounds.left) / bounds.width) * regressionWidth
    const svgY = ((clientY - bounds.top) / bounds.height) * regressionHeight
    return {
      x: Math.max(0, Math.min(100, ((svgX - regressionLeft) / (regressionRight - regressionLeft)) * 100)),
      y: Math.max(0, Math.min(120, ((regressionBottom - svgY) / (regressionBottom - regressionTop)) * 120)),
    }
  }

  function updatePoint(pointId: number, coordinates: { x: number; y: number }) {
    const nextPoints = pointsRef.current.map((point) =>
      point.id === pointId ? { ...point, x: coordinates.x, y: coordinates.y } : point,
    )
    commitPoints(nextPoints)
  }

  function handlePointPointerDown(event: PointerEvent<SVGCircleElement>, pointId: number) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    saveHistory()
    draggingPointRef.current = pointId
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePlotPointerMove(event: PointerEvent<SVGSVGElement>) {
    const pointId = draggingPointRef.current
    if (pointId === null) return
    const coordinates = getDataCoordinates(event.clientX, event.clientY)
    if (coordinates) updatePoint(pointId, coordinates)
  }

  function finishPointDrag() {
    draggingPointRef.current = null
  }

  function handleEmptyPlotClick(event: MouseEvent<SVGSVGElement>) {
    if (!(event.target instanceof Element) || event.target.getAttribute('data-add-point-area') !== 'true') return
    const coordinates = getDataCoordinates(event.clientX, event.clientY)
    if (!coordinates) return

    saveHistory()
    commitPoints([...pointsRef.current, { id: nextPointIdRef.current, ...coordinates }])
    nextPointIdRef.current += 1
  }

  function nudgePoint(pointId: number, event: KeyboardEvent<SVGCircleElement>) {
    const adjustments: Record<string, { x: number; y: number }> = {
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: 1 },
      ArrowDown: { x: 0, y: -1 },
    }
    const adjustment = adjustments[event.key]
    if (!adjustment) return

    event.preventDefault()
    saveHistory()
    const point = pointsRef.current.find((item) => item.id === pointId)
    if (!point) return
    updatePoint(pointId, {
      x: Math.max(0, Math.min(100, point.x + adjustment.x)),
      y: Math.max(0, Math.min(120, point.y + adjustment.y)),
    })
  }

  function removePoint(pointId: number) {
    if (pointsRef.current.length <= 2) return
    saveHistory()
    commitPoints(pointsRef.current.filter((point) => point.id !== pointId))
  }

  function addOutlier() {
    if (pointsRef.current.some((point) => point.outlier)) return
    saveHistory()
    commitPoints([...pointsRef.current, { id: nextPointIdRef.current, x: 92, y: 12, outlier: true }])
    nextPointIdRef.current += 1
  }

  function undo() {
    const previous = historyRef.current.pop()
    if (!previous) return
    commitPoints(previous)
  }

  function resetRegression() {
    const nextPoints = createDefaultRegressionPoints()
    historyRef.current = []
    nextPointIdRef.current = nextPoints.length
    setShowResiduals(false)
    commitPoints(nextPoints)
  }

  return (
    <div className="lab-instrument regression-instrument">
      <div className="lab-panel-heading regression-heading">
        <span className="lab-kicker">Regression / Least squares</span>
        <span className="lab-panel-value">Synthetic scatter</span>
      </div>

      <div className="regression-chart-frame">
        <svg
          ref={chartRef}
          className="regression-chart"
          viewBox={`0 0 ${regressionWidth} ${regressionHeight}`}
          preserveAspectRatio="none"
          role="group"
          aria-label="Interactive regression scatter plot"
          aria-describedby="regression-instructions"
          onPointerMove={handlePlotPointerMove}
          onPointerUp={finishPointDrag}
          onPointerCancel={finishPointDrag}
          onClick={handleEmptyPlotClick}
        >
          <defs>
            <clipPath id="regression-plot-clip">
              <rect x={regressionLeft} y={regressionTop} width={regressionRight - regressionLeft} height={regressionBottom - regressionTop} />
            </clipPath>
          </defs>
          <rect data-add-point-area="true" x="0" y="0" width={regressionWidth} height={regressionHeight} fill="transparent" />
          {[0, 30, 60, 90, 120].map((value) => {
            const y = lineValueToSvg(value)
            return <line className="lab-chart-grid" key={value} x1={regressionLeft} y1={y} x2={regressionRight} y2={y} />
          })}
          {[0, 25, 50, 75, 100].map((value) => {
            const x = regressionLeft + (value / 100) * (regressionRight - regressionLeft)
            return <line className="lab-chart-grid" key={value} x1={x} y1={regressionTop} x2={x} y2={regressionBottom} />
          })}
          <line className="lab-chart-axis" x1={regressionLeft} y1={regressionBottom} x2={regressionRight} y2={regressionBottom} />
          <line className="lab-chart-axis" x1={regressionLeft} y1={regressionTop} x2={regressionLeft} y2={regressionBottom} />
          <g clipPath="url(#regression-plot-clip)">
            {showResiduals && points.map((point) => {
              const position = mapRegressionPoint(point)
              const predictedY = lineValueToSvg(statistics.slope * point.x + statistics.intercept)
              return (
                <line
                  className="regression-residual"
                  key={`residual-${point.id}`}
                  x1={position.x}
                  y1={position.y}
                  x2={position.x}
                  y2={predictedY}
                />
              )
            })}
            <line
              className="regression-fit-line"
              x1={displayedLine.x1}
              y1={displayedLine.y1}
              x2={displayedLine.x2}
              y2={displayedLine.y2}
            />
            {points.map((point, index) => {
              const position = mapRegressionPoint(point)
              return (
                <circle
                  className={`regression-point${point.outlier ? ' regression-point--outlier' : ''}`}
                  key={point.id}
                  cx={position.x}
                  cy={position.y}
                  r="5"
                  role="button"
                  tabIndex={0}
                  aria-label={`Point ${index + 1}: x ${point.x.toFixed(1)}, y ${point.y.toFixed(1)}. Drag to move, use arrow keys to nudge, or double-click to remove.`}
                  onPointerDown={(event) => handlePointPointerDown(event, point.id)}
                  onKeyDown={(event) => nudgePoint(point.id, event)}
                  onDoubleClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    removePoint(point.id)
                  }}
                  style={{ touchAction: 'none' }}
                />
              )
            })}
          </g>
        </svg>
        <span className="regression-chart-note">Drag a point or select open space to add one</span>
        <p className="sr-only" id="regression-instructions">
          Drag a point to move it. Click empty space to add a point. Double-click a point to remove it. Focus a point and use the arrow keys to nudge it.
        </p>
      </div>

      <div className="regression-controls" role="group" aria-label="Regression controls">
        <button className="lab-action-button" type="button" aria-pressed={showResiduals} onClick={() => setShowResiduals((current) => !current)}>
          Residuals
        </button>
        <button className="lab-action-button" type="button" onClick={undo} disabled={historyRef.current.length === 0}>
          Undo
        </button>
        <button className="lab-action-button" type="button" onClick={resetRegression}>
          Reset
        </button>
        <button className="lab-action-button lab-action-button--primary" type="button" onClick={addOutlier} disabled={hasOutlier}>
          Add outlier
        </button>
      </div>

      <ReadoutGroup message={message} active={active}>
        <NumericReadout label="Slope" value={statistics.slope} format={(value) => value.toFixed(2)} active={active} reducedMotion={reducedMotion} />
        <NumericReadout label="Intercept" value={statistics.intercept} format={(value) => value.toFixed(2)} active={active} reducedMotion={reducedMotion} />
        <NumericReadout label="r" value={statistics.correlation} format={(value) => value.toFixed(2)} active={active} reducedMotion={reducedMotion} />
        <NumericReadout label="R squared" value={statistics.rSquared} format={(value) => value.toFixed(2)} active={active} reducedMotion={reducedMotion} />
      </ReadoutGroup>

      <p className="lab-caption">Synthetic data, computed in your browser.</p>
    </div>
  )
}

export default function LabInstruments({ active }: LabInstrumentsProps) {
  const [activeTab, setActiveTab] = useState<'clt' | 'regression'>('clt')
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const isCltActive = active && activeTab === 'clt'
  const isRegressionActive = active && activeTab === 'regression'

  function moveTabFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | null = null
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % 2
    if (event.key === 'ArrowLeft') nextIndex = (index + 1) % 2
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = 1
    if (nextIndex === null) return

    event.preventDefault()
    setActiveTab(nextIndex === 0 ? 'clt' : 'regression')
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <div className="lab-instruments">
      <div className="lab-tabs" role="tablist" aria-label="Choose a statistical instrument">
        <button
          ref={(element) => { tabRefs.current[0] = element }}
          className="lab-tab"
          id="lab-tab-clt"
          type="button"
          role="tab"
          aria-selected={activeTab === 'clt'}
          aria-controls="lab-panel-clt"
          tabIndex={activeTab === 'clt' ? 0 : -1}
          onClick={() => setActiveTab('clt')}
          onKeyDown={(event) => moveTabFocus(event, 0)}
        >
          <span>01</span> Central limit theorem
        </button>
        <button
          ref={(element) => { tabRefs.current[1] = element }}
          className="lab-tab"
          id="lab-tab-regression"
          type="button"
          role="tab"
          aria-selected={activeTab === 'regression'}
          aria-controls="lab-panel-regression"
          tabIndex={activeTab === 'regression' ? 0 : -1}
          onClick={() => setActiveTab('regression')}
          onKeyDown={(event) => moveTabFocus(event, 1)}
        >
          <span>02</span> Regression
        </button>
      </div>

      <div className="lab-panels">
        <div
          className="lab-tab-panel"
          id="lab-panel-clt"
          role="tabpanel"
          aria-labelledby="lab-tab-clt"
          aria-hidden={!isCltActive}
          inert={!isCltActive}
          data-active={isCltActive}
        >
          <CentralLimitInstrument active={isCltActive} />
        </div>
        <div
          className="lab-tab-panel"
          id="lab-panel-regression"
          role="tabpanel"
          aria-labelledby="lab-tab-regression"
          aria-hidden={!isRegressionActive}
          inert={!isRegressionActive}
          data-active={isRegressionActive}
        >
          <RegressionInstrument active={isRegressionActive} />
        </div>
      </div>
    </div>
  )
}
