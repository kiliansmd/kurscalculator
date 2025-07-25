"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Calculator,
  Lightbulb,
} from "lucide-react"

interface ScenarioResultsProps {
  breakEvenGross: number
  totalMonthlyCosts: number
  scenarios: {
    pessimistic: number
    realistic: number
    optimistic: number
  }
  monthsOfReserves: number
  desiredBuffer: number
  projectsPerYear: number
  projectFee: number
  taxRate: number
}

export function ScenarioResults({
  breakEvenGross,
  totalMonthlyCosts,
  scenarios,
  monthsOfReserves,
  desiredBuffer,
  projectsPerYear,
  projectFee,
  taxRate,
}: ScenarioResultsProps) {
  const getScenarioStatus = (revenue: number) => {
    if (revenue >= totalMonthlyCosts * 1.2) return "excellent"
    if (revenue >= totalMonthlyCosts) return "good"
    if (revenue >= totalMonthlyCosts * 0.8) return "warning"
    return "danger"
  }

  const getReserveStatus = () => {
    if (monthsOfReserves >= desiredBuffer) return "good"
    if (monthsOfReserves >= desiredBuffer * 0.5) return "warning"
    return "danger"
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
  }

  const getRecommendations = () => {
    const recommendations = []

    if (scenarios.realistic < totalMonthlyCosts) {
      recommendations.push("🎯 Erhöhe deine Projektanzahl oder dein Honorar pro Projekt")
      recommendations.push("💰 Reduziere deine Fixkosten wo möglich")
    }

    if (monthsOfReserves < desiredBuffer) {
      recommendations.push("🛡️ Baue deine Liquiditätsreserven weiter aus")
    }

    if (scenarios.pessimistic < totalMonthlyCosts * 0.5) {
      recommendations.push("⚠️ Entwickle einen Plan B für schwierige Zeiten")
      recommendations.push("🔄 Diversifiziere deine Einnahmequellen")
    }

    if (taxRate > 40) {
      recommendations.push("📊 Prüfe steuerliche Optimierungsmöglichkeiten")
    }

    if (recommendations.length === 0) {
      recommendations.push("✅ Deine Finanzplanung sieht solide aus!")
      recommendations.push("📈 Fokussiere dich auf nachhaltiges Wachstum")
    }

    return recommendations
  }

  return (
    <div className="space-y-6">
      {/* Break-Even Analysis */}
      <Card className="bg-white shadow-sm border-0 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-gray-900 text-xl">
            <div className="w-10 h-10 bg-custom-orange-light rounded-lg flex items-center justify-center">
              <Calculator className="h-5 w-5 text-custom-orange" />
            </div>
            Break-Even-Analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-custom-orange-lightest border border-custom-orange-border rounded-xl p-8">
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-3">
                Damit du alle Kosten deckst und Rücklagen bilden kannst, solltest du mindestens
              </p>
              <p className="text-4xl font-bold text-custom-orange mb-2">{formatCurrency(breakEvenGross)}</p>
              <p className="text-lg text-gray-700">pro Monat erwirtschaften.</p>
            </div>
          </div>

          {/* Detailed Calculation */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Rechenweg:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Monatliche Gesamtkosten:</span>
                <span className="font-medium">{formatCurrency(totalMonthlyCosts)}</span>
              </div>
              <div className="flex justify-between">
                <span>Steuersatz (gesamt):</span>
                <span className="font-medium">{taxRate}%</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Benötigter Brutto-Umsatz:</span>
                <span className="font-bold">{formatCurrency(breakEvenGross)}</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Formel: Kosten ÷ (1 - Steuersatz) = {formatCurrency(totalMonthlyCosts)} ÷{" "}
                {((100 - taxRate) / 100).toFixed(2)} = {formatCurrency(breakEvenGross)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="font-medium text-slate-700">Gesamte Monatskosten</p>
              <p className="text-xl font-bold text-slate-800">{formatCurrency(totalMonthlyCosts)}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="font-medium text-slate-700">Brutto-Umsatz erforderlich</p>
              <p className="text-xl font-bold text-slate-800">{formatCurrency(breakEvenGross)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Analysis */}
      <Card className="bg-white shadow-sm border-0 rounded-xl">
        <CardHeader>
          <CardTitle className="text-slate-800">Szenarien-Analyse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pessimistic */}
          <div className="border border-gray-200 rounded-xl p-6 bg-white">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                Pessimistisches Szenario
              </h4>
              <Badge variant={getScenarioStatus(scenarios.pessimistic) === "danger" ? "destructive" : "secondary"}>
                {formatCurrency(scenarios.pessimistic)}
              </Badge>
            </div>
            <div className="text-xs text-gray-500 mb-2">
              Rechnung: {projectFee.toLocaleString("de-DE")} € × {Math.round((projectsPerYear * 30) / 100)}{" "}
              Vermittlungen/Jahr ÷ 12 Monate × (1 - {(taxRate / 100).toFixed(2)})
            </div>
            <p className="text-slate-600">
              {scenarios.pessimistic < totalMonthlyCosts
                ? `⚠️ Dein erwarteter Umsatz liegt bei ${formatCurrency(scenarios.pessimistic)} – das deckt nicht deine Kosten von ${formatCurrency(totalMonthlyCosts)}.`
                : `✅ Dein erwarteter Umsatz von ${formatCurrency(scenarios.pessimistic)} deckt deine Grundkosten ab.`}
            </p>
          </div>

          {/* Realistic */}
          <div className="border border-gray-200 rounded-xl p-6 bg-white">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                <Minus className="h-4 w-4 text-amber-500" />
                Realistisches Szenario
              </h4>
              <Badge variant={getScenarioStatus(scenarios.realistic) === "good" ? "default" : "secondary"}>
                {formatCurrency(scenarios.realistic)}
              </Badge>
            </div>
            <div className="text-xs text-gray-500 mb-2">
              Rechnung: {projectFee.toLocaleString("de-DE")} € × {Math.round((projectsPerYear * 60) / 100)}{" "}
              Vermittlungen/Jahr ÷ 12 Monate × (1 - {(taxRate / 100).toFixed(2)})
            </div>
            <p className="text-slate-600">
              {scenarios.realistic >= totalMonthlyCosts
                ? `✅ Du hast ein Polster von ${formatCurrency(scenarios.realistic - totalMonthlyCosts)} pro Monat.`
                : `⚠️ Es fehlen noch ${formatCurrency(totalMonthlyCosts - scenarios.realistic)} zum Break-Even.`}
            </p>
          </div>

          {/* Optimistic */}
          <div className="border border-gray-200 rounded-xl p-6 bg-white">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Optimistisches Szenario
              </h4>
              <Badge variant="default" className="bg-green-600">
                {formatCurrency(scenarios.optimistic)}
              </Badge>
            </div>
            <div className="text-xs text-gray-500 mb-2">
              Rechnung: {projectFee.toLocaleString("de-DE")} € × {Math.round((projectsPerYear * 90) / 100)}{" "}
              Vermittlungen/Jahr ÷ 12 Monate × (1 - {(taxRate / 100).toFixed(2)})
            </div>
            <p className="text-slate-600">
              🚀 Du erzielst einen Überschuss von {formatCurrency(scenarios.optimistic - totalMonthlyCosts)} pro Monat.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-white shadow-sm border-0 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-gray-900 text-xl">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
            </div>
            Empfohlene Maßnahmen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getRecommendations().map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-custom-orange text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Analysis */}
      <Card className="bg-white shadow-sm border-0 rounded-xl">
        <CardHeader>
          <CardTitle className="text-slate-800">Sicherheits-Analyse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-800">Finanzielle Reichweite</p>
                <p className="text-sm text-slate-600">Bei null Einnahmen</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-800">{monthsOfReserves.toFixed(1)} Monate</p>
              </div>
            </div>

            <Alert
              className={`${
                getReserveStatus() === "good"
                  ? "bg-green-50 border-green-200"
                  : getReserveStatus() === "warning"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-red-50 border-red-200"
              }`}
            >
              {getReserveStatus() === "good" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : getReserveStatus() === "warning" ? (
                <AlertCircle className="h-4 w-4 text-amber-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                <strong>
                  {getReserveStatus() === "good"
                    ? "Alles gut! "
                    : getReserveStatus() === "warning"
                      ? "Knapp! "
                      : "Hohe Gefahr! "}
                </strong>
                {getReserveStatus() === "good"
                  ? `Deine Rücklagen reichen für ${monthsOfReserves.toFixed(1)} Monate. Das ist mehr als dein gewünschtes Polster von ${desiredBuffer} Monaten.`
                  : getReserveStatus() === "warning"
                    ? `Deine Rücklagen reichen nur für ${monthsOfReserves.toFixed(1)} Monate. Du solltest ${desiredBuffer} Monate anstreben.`
                    : `Deine Rücklagen reichen nur für ${monthsOfReserves.toFixed(1)} Monate. Das ist deutlich unter deinem Ziel von ${desiredBuffer} Monaten.`}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div
                className={`p-4 rounded-lg border-2 ${
                  getReserveStatus() === "good" ? "border-green-200 bg-green-50" : "border-slate-200 bg-slate-50"
                }`}
              >
                <CheckCircle
                  className={`h-8 w-8 mx-auto mb-2 ${
                    getReserveStatus() === "good" ? "text-green-600" : "text-slate-400"
                  }`}
                />
                <p className="font-medium text-slate-800">Grün</p>
                <p className="text-sm text-slate-600">Alles gut</p>
              </div>

              <div
                className={`p-4 rounded-lg border-2 ${
                  getReserveStatus() === "warning" ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50"
                }`}
              >
                <AlertCircle
                  className={`h-8 w-8 mx-auto mb-2 ${
                    getReserveStatus() === "warning" ? "text-amber-600" : "text-slate-400"
                  }`}
                />
                <p className="font-medium text-slate-800">Gelb</p>
                <p className="text-sm text-slate-600">Knapp</p>
              </div>

              <div
                className={`p-4 rounded-lg border-2 ${
                  getReserveStatus() === "danger" ? "border-red-200 bg-red-50" : "border-slate-200 bg-slate-50"
                }`}
              >
                <AlertTriangle
                  className={`h-8 w-8 mx-auto mb-2 ${
                    getReserveStatus() === "danger" ? "text-red-600" : "text-slate-400"
                  }`}
                />
                <p className="font-medium text-slate-800">Rot</p>
                <p className="text-sm text-slate-600">Hohe Gefahr</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
