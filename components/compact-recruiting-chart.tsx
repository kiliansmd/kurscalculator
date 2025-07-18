"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Euro, Calendar, Users, Play, RotateCcw, Sparkles, Lock } from "lucide-react"

interface CompactRecruitingChartProps {
  className?: string
}

export function CompactRecruitingChart({ className = "" }: CompactRecruitingChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)

  // Fixe Werte basierend auf Erfahrungswerten
  const salaryBase = 60000 // Fest: 60k brutto
  const commissionRate = 20 // Fest: 20% Vermittlungshonorar

  // Variable Werte - nur Vermittlungen können beeinflusst werden
  const [projectsPerYear, setProjectsPerYear] = useState(6)

  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>(0)
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false)

  // Easing function for smooth acceleration and deceleration
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  // Calculate monthly data with accelerating placements
  const calculateMonthlyData = () => {
    const data = []
    let cumulativeRevenue = 0

    // Realistische Vermittlungs-Timeline basierend auf der gewählten Anzahl
    const placementRevenue = salaryBase * (commissionRate / 100)

    // Verteilung der Vermittlungen über das Jahr
    const placementMonths = []
    if (projectsPerYear >= 1) placementMonths.push(3) // Erste nach 3 Monaten
    if (projectsPerYear >= 2) placementMonths.push(6) // Zweite nach 6 Monaten
    if (projectsPerYear >= 3) placementMonths.push(8) // Dritte nach 8 Monaten
    if (projectsPerYear >= 4) placementMonths.push(10) // Vierte nach 10 Monaten
    if (projectsPerYear >= 5) placementMonths.push(11) // Fünfte nach 11 Monaten
    if (projectsPerYear >= 6) placementMonths.push(12) // Sechste nach 12 Monaten

    // Weitere Vermittlungen gleichmäßig verteilen
    if (projectsPerYear > 6) {
      const additionalPlacements = projectsPerYear - 6
      const availableMonths = [4, 5, 7, 9] // Verfügbare Monate
      for (let i = 0; i < additionalPlacements && i < availableMonths.length; i++) {
        placementMonths.push(availableMonths[i])
      }
    }

    placementMonths.sort((a, b) => a - b)

    for (let month = 1; month <= 12; month++) {
      let monthlyRevenue = 0
      const isPlacement = placementMonths.includes(month)

      if (isPlacement) {
        monthlyRevenue = placementRevenue
        cumulativeRevenue += monthlyRevenue
      }

      data.push({
        month,
        monthlyRevenue,
        cumulativeRevenue,
        isPlacement,
        placementNumber: isPlacement ? placementMonths.indexOf(month) + 1 : 0,
      })
    }

    return data
  }

  const monthlyData = calculateMonthlyData()

  const drawChart = (progress = 1) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size with high DPI support
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const padding = 50
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Clear canvas with subtle gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
    bgGradient.addColorStop(0, "#fefefe")
    bgGradient.addColorStop(1, "#f8fafc")
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)

    const maxRevenue = Math.max(...monthlyData.map((d) => d.cumulativeRevenue))
    const currentMonth = Math.floor(progress * 12)
    const visibleData = monthlyData.slice(0, currentMonth + 1)

    // Draw subtle grid lines
    ctx.strokeStyle = "#f1f5f9"
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let i = 1; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Draw animated line with gradient
    if (visibleData.length > 1) {
      // Area under curve with animated gradient
      const areaGradient = ctx.createLinearGradient(0, padding, 0, height - padding)
      areaGradient.addColorStop(0, `rgba(252, 172, 2, ${0.2 * progress})`)
      areaGradient.addColorStop(1, `rgba(252, 172, 2, ${0.02 * progress})`)

      ctx.fillStyle = areaGradient
      ctx.beginPath()
      ctx.moveTo(padding + (chartWidth / 12) * visibleData[0].month, height - padding)

      visibleData.forEach((data, index) => {
        const x = padding + (chartWidth / 12) * data.month
        const y = height - padding - (data.cumulativeRevenue / maxRevenue) * chartHeight

        // Smooth interpolation for the last point during animation
        if (index === visibleData.length - 1 && progress < 1) {
          const monthProgress = progress * 12 - currentMonth
          const prevY =
            index > 0
              ? height - padding - (visibleData[index - 1].cumulativeRevenue / maxRevenue) * chartHeight
              : height - padding
          const interpolatedY = prevY + (y - prevY) * monthProgress
          ctx.lineTo(x, interpolatedY)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.lineTo(padding + (chartWidth / 12) * visibleData[visibleData.length - 1].month, height - padding)
      ctx.closePath()
      ctx.fill()

      // Main line with glow effect
      ctx.shadowColor = "rgba(252, 172, 2, 0.3)"
      ctx.shadowBlur = 8
      ctx.strokeStyle = "#fcac02"
      ctx.lineWidth = 3
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      ctx.beginPath()
      visibleData.forEach((data, index) => {
        const x = padding + (chartWidth / 12) * data.month
        const y = height - padding - (data.cumulativeRevenue / maxRevenue) * chartHeight

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          // Smooth interpolation for the last point
          if (index === visibleData.length - 1 && progress < 1) {
            const monthProgress = progress * 12 - currentMonth
            const prevData = visibleData[index - 1]
            const prevX = padding + (chartWidth / 12) * prevData.month
            const prevY = height - padding - (prevData.cumulativeRevenue / maxRevenue) * chartHeight
            const interpolatedX = prevX + (x - prevX) * monthProgress
            const interpolatedY = prevY + (y - prevY) * monthProgress
            ctx.lineTo(interpolatedX, interpolatedY)
          } else {
            ctx.lineTo(x, y)
          }
        }
      })
      ctx.stroke()
      ctx.shadowBlur = 0

      // Draw animated data points
      visibleData.forEach((data, index) => {
        const x = padding + (chartWidth / 12) * data.month
        const y = height - padding - (data.cumulativeRevenue / maxRevenue) * chartHeight

        // Skip the last point if it's being animated
        if (index === visibleData.length - 1 && progress < 1 && (progress * 12) % 1 !== 0) return

        if (data.isPlacement) {
          // Animated placement markers with different sizes for acceleration effect
          const scale = Math.min(1, (progress * 12 - data.month + 1) * 2)
          const isEarlyPlacement = data.month <= 6
          const markerSize = isEarlyPlacement ? 12 : 10 // Slightly larger for early placements

          // Outer glow
          ctx.fillStyle = "rgba(16, 185, 129, 0.2)"
          ctx.beginPath()
          ctx.arc(x, y, (markerSize + 3) * scale, 0, 2 * Math.PI)
          ctx.fill()

          // White background
          ctx.fillStyle = "#ffffff"
          ctx.beginPath()
          ctx.arc(x, y, markerSize * scale, 0, 2 * Math.PI)
          ctx.fill()

          // Green center
          ctx.fillStyle = "#10b981"
          ctx.beginPath()
          ctx.arc(x, y, (markerSize - 4) * scale, 0, 2 * Math.PI)
          ctx.fill()

          // Animated label
          if (scale > 0.5) {
            ctx.fillStyle = "#10b981"
            ctx.font = "bold 10px Inter, sans-serif"
            ctx.textAlign = "center"
            ctx.globalAlpha = Math.min(1, (scale - 0.5) * 2)
            ctx.fillText(`${data.placementNumber}. Vermittlung`, x, y - 25)
            ctx.globalAlpha = 1
          }
        } else if (data.cumulativeRevenue > 0) {
          // Regular data points (for months after placements)
          ctx.fillStyle = "#ffffff"
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, 2 * Math.PI)
          ctx.fill()

          ctx.fillStyle = "#fcac02"
          ctx.beginPath()
          ctx.arc(x, y, 2, 0, 2 * Math.PI)
          ctx.fill()
        }
      })
    }

    // Draw Y-axis labels
    ctx.fillStyle = "#64748b"
    ctx.font = "11px Inter, sans-serif"
    ctx.textAlign = "right"
    for (let i = 0; i <= 5; i++) {
      const value = (maxRevenue / 5) * i
      const y = height - padding - (chartHeight / 5) * i
      if (value > 0) {
        ctx.fillText(`${Math.round(value).toLocaleString("de-DE")} €`, padding - 10, y + 3)
      }
    }

    // Draw X-axis labels
    ctx.textAlign = "center"
    for (let i = 1; i <= 12; i++) {
      const x = padding + (chartWidth / 12) * i
      const opacity = i <= currentMonth + 1 ? 1 : 0.3
      ctx.globalAlpha = opacity
      ctx.fillText(`M${i}`, x, height - padding + 20)
    }
    ctx.globalAlpha = 1
  }

  // Smooth animation with easing
  useEffect(() => {
    if (isAnimating) {
      const animate = (timestamp: number) => {
        if (startTimeRef.current === 0) {
          startTimeRef.current = timestamp
        }

        const elapsed = timestamp - startTimeRef.current
        const duration = 4500 // 4.5 seconds for better pacing
        const rawProgress = Math.min(elapsed / duration, 1)
        const easedProgress = easeInOutCubic(rawProgress)

        setAnimationProgress(easedProgress)

        if (rawProgress < 1) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          setIsAnimating(false)
          startTimeRef.current = 0
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAnimating])

  // Auto-play animation on mount
  useEffect(() => {
    if (!hasAutoPlayed) {
      const timer = setTimeout(() => {
        startAnimation()
        setHasAutoPlayed(true)
      }, 500) // Small delay for better UX

      return () => clearTimeout(timer)
    }
  }, [hasAutoPlayed])

  // Draw chart when progress changes
  useEffect(() => {
    drawChart(animationProgress)
  }, [animationProgress, projectsPerYear])

  const startAnimation = () => {
    setAnimationProgress(0)
    setIsAnimating(true)
    startTimeRef.current = 0
  }

  const stopAnimation = () => {
    setIsAnimating(false)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    startTimeRef.current = 0
  }

  const resetAnimation = () => {
    stopAnimation()
    setAnimationProgress(0)
    drawChart(0)
  }

  const totalRevenue = monthlyData[11]?.cumulativeRevenue || 0
  const avgMonthlyRevenue = totalRevenue / 12
  const totalPlacements = Math.min(projectsPerYear, monthlyData.filter((d) => d.isPlacement).length)

  return (
    <Card
      className={`border-0 shadow-2xl bg-white overflow-hidden transition-all duration-500 hover:shadow-3xl ${className}`}
    >
      <CardHeader className="bg-gradient-to-r from-custom-orange to-amber-500 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12 animate-pulse delay-1000"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Recruiting Business Potenzial</CardTitle>
                <p className="text-white/90 text-sm">
                  Basierend auf Erfahrungswerten - {projectsPerYear} Vermittlungen im ersten Jahr
                </p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm">
              <Sparkles className="h-3 w-3 mr-1 animate-spin" />
              Live Simulation
            </Badge>
          </div>

          {/* Key Metrics with animation */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center bg-white/10 rounded-lg p-3 backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Euro className="h-4 w-4" />
                <span className="text-sm font-medium">Jahresumsatz</span>
              </div>
              <div className="text-xl font-bold">
                {Math.round(totalRevenue * animationProgress).toLocaleString("de-DE")} €
              </div>
            </div>

            <div className="text-center bg-white/10 rounded-lg p-3 backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Ø Monatlich</span>
              </div>
              <div className="text-xl font-bold">
                {Math.round(avgMonthlyRevenue * animationProgress).toLocaleString("de-DE")} €
              </div>
            </div>

            <div className="text-center bg-white/10 rounded-lg p-3 backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Vermittlungen</span>
              </div>
              <div className="text-xl font-bold">
                {Math.floor(totalPlacements * animationProgress)} / {projectsPerYear}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Simplified Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={startAnimation}
                disabled={isAnimating}
                size="sm"
                className="bg-custom-orange hover:bg-custom-orange-dark text-white transition-all duration-200 hover:scale-105"
              >
                <Play className="h-4 w-4 mr-2" />
                Animation starten
              </Button>

              <Button
                onClick={resetAnimation}
                variant="outline"
                size="sm"
                className="transition-all duration-200 hover:scale-105 bg-transparent"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Zurücksetzen
              </Button>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-2">
              <div className="w-24 h-1 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-custom-orange transition-all duration-100 ease-out"
                  style={{ width: `${animationProgress * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 font-medium">{Math.round(animationProgress * 100)}%</span>
            </div>
          </div>

          {/* Parameter Controls - Nur Vermittlungen variabel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fixe Werte - nur zur Anzeige */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  Durchschnittsgehalt
                  <Lock className="h-3 w-3 text-slate-400" />
                </label>
                <span className="text-lg font-bold text-slate-600">{salaryBase.toLocaleString("de-DE")} €</span>
              </div>
              <div className="bg-slate-100 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500">Basierend auf Erfahrungswerten</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  Provision
                  <Lock className="h-3 w-3 text-slate-400" />
                </label>
                <span className="text-lg font-bold text-slate-600">{commissionRate}%</span>
              </div>
              <div className="bg-slate-100 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500">Realistischer Branchendurchschnitt</p>
              </div>
            </div>

            {/* Variable Vermittlungen */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">Vermittlungen pro Jahr</label>
                <span className="text-lg font-bold text-custom-orange">{projectsPerYear}</span>
              </div>
              <Slider
                value={[projectsPerYear]}
                onValueChange={(value) => setProjectsPerYear(value[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>1</span>
                <span>10</span>
              </div>
              <p className="text-xs text-slate-500 text-center">
                ≈ {(projectsPerYear / 12).toFixed(1)} Vermittlungen pro Monat
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Chart */}
        <div className="relative bg-gradient-to-br from-slate-50 to-blue-50/20 rounded-xl p-4 border border-slate-200/50 mb-6 transition-all duration-300 hover:shadow-lg">
          <canvas ref={canvasRef} className="w-full h-80 rounded-lg" style={{ width: "100%", height: "320px" }} />

          {/* Minimalist Legend */}
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
              <div className="w-4 h-1 bg-custom-orange rounded-full"></div>
              <span className="text-slate-700">Kumulativer Umsatz</span>
            </div>
            <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-slate-700">Vermittlung erfolgreich</span>
            </div>
          </div>
        </div>

        {/* Updated Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-green-600" />
              </div>
              <h4 className="font-semibold text-green-900 text-sm">Realistische Basis</h4>
            </div>
            <p className="text-green-800 text-xs leading-relaxed">
              60k€ Durchschnittsgehalt und 20% Provision basieren auf unseren Erfahrungswerten aus der Praxis.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-3 w-3 text-blue-600" />
              </div>
              <h4 className="font-semibold text-blue-900 text-sm">Deine Variable</h4>
            </div>
            <p className="text-blue-800 text-xs leading-relaxed">
              Nur die Anzahl der Vermittlungen kannst du beeinflussen - sei realistisch bei deiner Einschätzung!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
