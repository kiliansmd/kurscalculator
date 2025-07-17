"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

interface ForecastChartProps {
  breakEven: number
  scenarios: {
    pessimistic: number
    realistic: number
    optimistic: number
  }
  labels: string[]
}

export function ForecastChart({ breakEven, scenarios, labels }: ForecastChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
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

    // Data
    const values = [scenarios.pessimistic, scenarios.realistic, scenarios.optimistic]
    const maxValue = Math.max(...values, breakEven) * 1.1
    const barWidth = (chartWidth / values.length) * 0.6
    const barSpacing = chartWidth / values.length

    // Colors
    const colors = ["#ef4444", "#f59e0b", "#10b981"] // red, amber, green
    const breakEvenColor = "#0891b2" // teal

    // Draw bars with animation effect
    values.forEach((value, index) => {
      const barHeight = (value / maxValue) * chartHeight
      const x = padding + index * barSpacing + (barSpacing - barWidth) / 2
      const y = height - padding - barHeight

      // Bar
      ctx.fillStyle = colors[index]
      ctx.fillRect(x, y, barWidth, barHeight)

      // Value label on top of bar
      ctx.fillStyle = "#1e293b"
      ctx.font = "14px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`${value.toLocaleString("de-DE")} €`, x + barWidth / 2, y - 10)

      // Category label
      ctx.fillText(labels[index], x + barWidth / 2, height - padding + 20)
    })

    // Draw break-even line
    const breakEvenY = height - padding - (breakEven / maxValue) * chartHeight
    ctx.strokeStyle = breakEvenColor
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(padding, breakEvenY)
    ctx.lineTo(width - padding, breakEvenY)
    ctx.stroke()
    ctx.setLineDash([])

    // Break-even label
    ctx.fillStyle = breakEvenColor
    ctx.font = "bold 12px Inter, sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(`Break-Even: ${breakEven.toLocaleString("de-DE")} €`, padding + 10, breakEvenY - 10)

    // Y-axis labels
    ctx.fillStyle = "#64748b"
    ctx.font = "12px Inter, sans-serif"
    ctx.textAlign = "right"
    for (let i = 0; i <= 5; i++) {
      const value = (maxValue / 5) * i
      const y = height - padding - (i / 5) * chartHeight
      ctx.fillText(`${Math.round(value).toLocaleString("de-DE")} €`, padding - 10, y + 4)
    }
  }, [breakEven, scenarios, labels])

  return (
    <Card className="bg-white shadow-sm border-0 rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-gray-900 text-xl">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          Szenarien-Vergleich
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <canvas ref={canvasRef} className="w-full h-80 rounded-lg" style={{ width: "100%", height: "320px" }} />
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-700">Pessimistisch</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
            <div className="w-4 h-4 bg-amber-500 rounded"></div>
            <span className="text-gray-700">Realistisch</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-700">Optimistisch</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
            <div className="w-4 h-1 bg-blue-600 border-dashed border border-blue-600"></div>
            <span className="text-gray-700">Break-Even</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
