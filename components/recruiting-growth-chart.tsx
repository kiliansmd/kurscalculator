"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Euro, Calendar, Sparkles, Play, Pause, RotateCcw, Lock } from "lucide-react"

interface RecruitingGrowthChartProps {
  className?: string
}

export function RecruitingGrowthChart({ className = "" }: RecruitingGrowthChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(0)
  const [animationSpeed, setAnimationSpeed] = useState(100)

  // Fixe Werte basierend auf Erfahrung
  const salaryBase = 60000 // 60k€ brutto
  const commissionRate = 20 // 20% Provision

  // Variable Werte - nur Vermittlungen können beeinflusst werden
  const [projectsPerYear, setProjectsPerYear] = useState(6)

  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  // Calculate monthly data
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
      const placements = placementMonths.includes(month) ? 1 : 0

      if (placements > 0) {
        monthlyRevenue = placementRevenue * placements
        cumulativeRevenue += monthlyRevenue
      }

      data.push({
        month,
        monthlyRevenue,
        cumulativeRevenue,
        placements,
      })
    }

    return data
  }

  const monthlyData = calculateMonthlyData()

  const drawChart = (animatedMonth = 12) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = rect.width
    const height = rect.height
    const padding = 60
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Create gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
    bgGradient.addColorStop(0, "#f8fafc")
    bgGradient.addColorStop(1, "#f1f5f9")
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)

    // Data for animation
    const visibleData = monthlyData.slice(0, animatedMonth)
    const maxRevenue = Math.max(...monthlyData.map((d) => d.cumulativeRevenue))

    // Draw grid lines
    ctx.strokeStyle = "#e2e8f0"
    ctx.lineWidth = 1
    ctx.setLineDash([2, 4])

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Vertical grid lines
    for (let i = 0; i <= 12; i++) {
      const x = padding + (chartWidth / 12) * i
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()
    }

    ctx.setLineDash([])

    // Draw cumulative revenue line
    if (visibleData.length > 1) {
      // Create gradient for line
      const lineGradient = ctx.createLinearGradient(0, 0, 0, height)
      lineGradient.addColorStop(0, "#fcac02")
      lineGradient.addColorStop(1, "#f59e0b")

      ctx.strokeStyle = lineGradient
      ctx.lineWidth = 4
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      ctx.beginPath()
      visibleData.forEach((data, index) => {
        const x = padding + (chartWidth / 12) * data.month
        const y = height - padding - (data.cumulativeRevenue / maxRevenue) * chartHeight

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      // Draw area under curve
      const areaGradient = ctx.createLinearGradient(0, padding, 0, height - padding)
      areaGradient.addColorStop(0, "rgba(252, 172, 2, 0.2)")
      areaGradient.addColorStop(1, "rgba(252, 172, 2, 0.05)")

      ctx.fillStyle = areaGradient
      ctx.beginPath()
      ctx.moveTo(padding + (chartWidth / 12) * visibleData[0].month, height - padding)
      visibleData.forEach((data) => {
        const x = padding + (chartWidth / 12) * data.month
        const y = height - padding - (data.cumulativeRevenue / maxRevenue) * chartHeight
        ctx.lineTo(x, y)
      })
      ctx.lineTo(padding + (chartWidth / 12) * visibleData[visibleData.length - 1].month, height - padding)
      ctx.closePath()
      ctx.fill()

      // Draw data points
      visibleData.forEach((data, index) => {
        const x = padding + (chartWidth / 12) * data.month
        const y = height - padding - (data.cumulativeRevenue / maxRevenue) * chartHeight

        // Outer circle
        ctx.fillStyle = "#ffffff"
        ctx.beginPath()
        ctx.arc(x, y, 8, 0, 2 * Math.PI)
        ctx.fill()

        // Inner circle
        ctx.fillStyle = data.placements > 0 ? "#10b981" : "#fcac02"
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, 2 * Math.PI)
        ctx.fill()

        // Highlight major milestones
        if (data.month === 3) {
          ctx.strokeStyle = "#10b981"
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(x, y, 12, 0, 2 * Math.PI)
          ctx.stroke()

          // Milestone label
          ctx.fillStyle = "#10b981"
          ctx.font = "bold 12px Inter, sans-serif"
          ctx.textAlign = "center"
          ctx.fillText("1. Vermittlung", x, y - 25)
        } else if (data.placements > 0 && data.month > 3) {
          const placementMonths = [3, 6, 8, 10, 11, 12] // Declare placementMonths here
          const placementNumber = placementMonths.indexOf(data.month) + 1
          ctx.fillStyle = "#10b981"
          ctx.font = "bold 12px Inter, sans-serif"
          ctx.textAlign = "center"
          ctx.fillText(`${placementNumber}. Vermittlung`, x, y - 25)
        }
      })
    }

    // Draw axes labels
    ctx.fillStyle = "#64748b"
    ctx.font = "12px Inter, sans-serif"
    ctx.textAlign = "center"

    // X-axis labels (months)
    for (let i = 1; i <= 12; i++) {
      const x = padding + (chartWidth / 12) * i
      ctx.fillText(`M${i}`, x, height - padding + 20)
    }

    // Y-axis labels (revenue)
    ctx.textAlign = "right"
    for (let i = 0; i <= 5; i++) {
      const value = (maxRevenue / 5) * i
      const y = height - padding - (chartHeight / 5) * i
      ctx.fillText(`${Math.round(value).toLocaleString("de-DE")} €`, padding - 10, y + 4)
    }

    // Current month indicator
    if (isAnimating && animatedMonth < 12) {
      const x = padding + (chartWidth / 12) * (animatedMonth + 1)
      ctx.strokeStyle = "#ef4444"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()
      ctx.setLineDash([])
    }
  }

  // Animation logic
  useEffect(() => {
    if (isAnimating) {
      const animate = (timestamp: number) => {
        if (timestamp - lastTimeRef.current >= animationSpeed) {
          setCurrentMonth((prev) => {
            if (prev >= 12) {
              setIsAnimating(false)
              return 12
            }
            return prev + 1
          })
          lastTimeRef.current = timestamp
        }

        if (currentMonth < 12) {
          animationRef.current = requestAnimationFrame(animate)
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAnimating, currentMonth, animationSpeed])

  // Draw chart when data changes
  useEffect(() => {
    drawChart(isAnimating ? currentMonth : 12)
  }, [currentMonth, projectsPerYear, isAnimating])

  const startAnimation = () => {
    setCurrentMonth(0)
    setIsAnimating(true)
    lastTimeRef.current = 0
  }

  const stopAnimation = () => {
    setIsAnimating(false)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  const resetAnimation = () => {
    stopAnimation()
    setCurrentMonth(0)
    drawChart(0)
  }

  const totalRevenue = monthlyData[11]?.cumulativeRevenue || 0
  const avgMonthlyRevenue = totalRevenue / 12

  return (
    <Card className={`border-0 shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden ${className}`}>
      <CardHeader className="bg-gradient-to-r from-custom-orange to-amber-500 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Recruiting Business Potenzial</h3>
                <p className="text-white/90 font-normal text-base">
                  Basierend auf Erfahrungswerten - {projectsPerYear} Vermittlungen im ersten Jahr
                </p>
              </div>
            </CardTitle>

            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-white/30">
                <Sparkles className="h-3 w-3 mr-1" />
                Live Simulation
              </Badge>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Euro className="h-4 w-4" />
                <span className="text-sm font-medium">Jahresumsatz</span>
              </div>
              <div className="text-2xl font-bold">{totalRevenue.toLocaleString("de-DE")} €</div>
            </div>

            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Ø Monatlich</span>
              </div>
              <div className="text-2xl font-bold">{Math.round(avgMonthlyRevenue).toLocaleString("de-DE")} €</div>
            </div>

            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Vermittlungen</span>
              </div>
              <div className="text-2xl font-bold">{projectsPerYear}</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8">
        {/* Controls */}
        <div className="mb-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                onClick={startAnimation}
                disabled={isAnimating}
                className="bg-custom-orange hover:bg-custom-orange-dark text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Animation starten
              </Button>

              <Button onClick={stopAnimation} disabled={!isAnimating} variant="outline">
                <Pause className="h-4 w-4 mr-2" />
                Pausieren
              </Button>

              <Button onClick={resetAnimation} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Zurücksetzen
              </Button>
            </div>

            {isAnimating && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700">Geschwindigkeit:</span>
                <div className="w-32">
                  <Slider
                    value={[200 - animationSpeed]}
                    onValueChange={(value) => setAnimationSpeed(200 - value[0])}
                    min={50}
                    max={150}
                    step={10}
                    className="w-full"
                  />
                </div>
              </div>
            )}
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
              <div className="space-y-4">
                <Slider
                  value={[projectsPerYear]}
                  onValueChange={(value) => setProjectsPerYear(value[0])}
                  min={1}
                  max={12}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>1</span>
                  <span>12</span>
                </div>
                <p className="text-sm text-slate-500 text-center">
                  ≈ {(projectsPerYear / 12).toFixed(1)} Vermittlungen pro Monat
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="relative bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-6 border border-slate-200/50">
          <canvas ref={canvasRef} className="w-full h-96 rounded-lg" style={{ width: "100%", height: "400px" }} />

          {/* Chart Legend */}
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-custom-orange rounded"></div>
              <span className="text-slate-700">Kumulativer Umsatz</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-slate-700">Vermittlung erfolgreich</span>
            </div>
          </div>
        </div>

        {/* Updated Insights */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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
