"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Info, Calculator, TrendingUp, Shield, RotateCcw, CheckCircle, Users, Euro } from "lucide-react"
import { ForecastChart } from "@/components/forecast-chart"
import { ScenarioResults } from "@/components/scenario-results"

interface FormData {
  // Personal costs
  rent: number
  food: number
  insurance: number
  mobility: number
  communication: number
  leisure: number
  healthInsurance: number
  personalOther: number

  // Business costs
  software: number
  internet: number
  hosting: number
  taxAdvisor: number
  businessInsurance: number
  marketing: number
  businessOther: number

  // Tax settings
  incomeTaxRate: number
  businessTaxRate: number
  vatRequired: boolean

  // Reserves
  currentReserves: number
  desiredBuffer: number

  // Revenue planning
  projectFee: number
  projectsPerMonth: number
  pessimisticRate: number
  realisticRate: number
  optimisticRate: number
}

const defaultData: FormData = {
  rent: 0,
  food: 0,
  insurance: 0,
  mobility: 0,
  communication: 0,
  leisure: 0,
  healthInsurance: 0,
  personalOther: 0,
  software: 0,
  internet: 0,
  hosting: 0,
  taxAdvisor: 0,
  businessInsurance: 0,
  marketing: 0,
  businessOther: 0,
  incomeTaxRate: 25,
  businessTaxRate: 15,
  vatRequired: false,
  currentReserves: 0,
  desiredBuffer: 6,
  projectFee: 0,
  projectsPerMonth: 0,
  pessimisticRate: 30,
  realisticRate: 60,
  optimisticRate: 90,
}

export default function ForecastTool() {
  const [data, setData] = useState<FormData>(defaultData)
  const [showResults, setShowResults] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("recruiting-forecast-data")
    if (saved) {
      try {
        setData(JSON.parse(saved))
      } catch (e) {
        console.error("Error loading saved data:", e)
      }
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("recruiting-forecast-data", JSON.stringify(data))
  }, [data])

  const updateField = (field: keyof FormData, value: number | boolean) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  const resetData = () => {
    setData(defaultData)
    localStorage.removeItem("recruiting-forecast-data")
    setShowResults(false)
    setCurrentStep(1)
  }

  // Calculations
  const personalBurnRate =
    data.rent +
    data.food +
    data.insurance +
    data.mobility +
    data.communication +
    data.leisure +
    data.healthInsurance +
    data.personalOther

  const businessFixedCosts =
    data.software +
    data.internet +
    data.hosting +
    data.taxAdvisor +
    data.businessInsurance +
    data.marketing +
    data.businessOther

  const totalMonthlyCosts = personalBurnRate + businessFixedCosts

  const calculateNetRevenue = (grossRevenue: number) => {
    let taxRate = (data.incomeTaxRate + data.businessTaxRate) / 100
    if (data.vatRequired) {
      taxRate += 0.19 // 19% VAT
    }
    return grossRevenue * (1 - taxRate)
  }

  const breakEvenGross =
    totalMonthlyCosts / (1 - (data.incomeTaxRate + data.businessTaxRate + (data.vatRequired ? 19 : 0)) / 100)

  const scenarios = {
    pessimistic: calculateNetRevenue((data.projectFee * data.projectsPerMonth * data.pessimisticRate) / 100),
    realistic: calculateNetRevenue((data.projectFee * data.projectsPerMonth * data.realisticRate) / 100),
    optimistic: calculateNetRevenue((data.projectFee * data.projectsPerMonth * data.optimisticRate) / 100),
  }

  const monthsOfReserves = data.currentReserves > 0 ? data.currentReserves / totalMonthlyCosts : 0

  const handleCalculate = () => {
    setShowResults(true)
  }

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  return (
    <TooltipProvider>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-custom-orange-light text-custom-orange-text px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Calculator className="h-4 w-4" />
              Kostenloser Business-Rechner
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Recruiting Business Forecast
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Berechne dein persönliches Sicherheitsnetz & Umsatz-Ziel in wenigen Minuten –
              <strong className="text-gray-900"> sicher, anonym und ohne Anmeldung</strong>
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500 mb-8">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span>100% Datenschutz</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span>Über 1.000 Nutzer</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-custom-orange" />
                <span>Sofort einsatzbereit</span>
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-700">Schritt {currentStep} von 5</span>
              <span className="text-sm text-gray-500">{Math.round((currentStep / 5) * 100)}% abgeschlossen</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-custom-orange h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Form Steps */}
          <div className="space-y-8">
            {/* Step 1: Personal Costs */}
            {currentStep === 1 && (
              <Card className="bg-white shadow-sm border-0 rounded-xl">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-gray-900 text-xl">
                    <div className="w-10 h-10 bg-custom-orange-light rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-custom-orange" />
                    </div>
                    Persönliche Lebenshaltungskosten
                  </CardTitle>
                  <p className="text-gray-600">Trage deine monatlichen privaten Ausgaben ein</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="rent" className="text-sm font-medium text-gray-700">
                        Miete/Wohnkosten
                      </Label>
                      <div className="relative">
                        <Input
                          id="rent"
                          type="number"
                          value={data.rent || ""}
                          onChange={(e) => updateField("rent", Number(e.target.value))}
                          placeholder="0"
                          className="pl-8"
                        />
                        <Euro className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="food" className="text-sm font-medium text-gray-700">
                        Lebensmittel
                      </Label>
                      <div className="relative">
                        <Input
                          id="food"
                          type="number"
                          value={data.food || ""}
                          onChange={(e) => updateField("food", Number(e.target.value))}
                          placeholder="0"
                          className="pl-8"
                        />
                        <Euro className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="insurance" className="text-sm font-medium text-gray-700">
                        Versicherungen (privat)
                      </Label>
                      <div className="relative">
                        <Input
                          id="insurance"
                          type="number"
                          value={data.insurance || ""}
                          onChange={(e) => updateField("insurance", Number(e.target.value))}
                          placeholder="0"
                          className="pl-8"
                        />
                        <Euro className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobility" className="text-sm font-medium text-gray-700">
                        Mobilität
                      </Label>
                      <div className="relative">
                        <Input
                          id="mobility"
                          type="number"
                          value={data.mobility || ""}
                          onChange={(e) => updateField("mobility", Number(e.target.value))}
                          placeholder="0"
                          className="pl-8"
                        />
                        <Euro className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="communication" className="text-sm font-medium text-gray-700">
                        Kommunikation
                      </Label>
                      <div className="relative">
                        <Input
                          id="communication"
                          type="number"
                          value={data.communication || ""}
                          onChange={(e) => updateField("communication", Number(e.target.value))}
                          placeholder="0"
                          className="pl-8"
                        />
                        <Euro className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="leisure" className="text-sm font-medium text-gray-700">
                        Freizeit/Konsum
                      </Label>
                      <div className="relative">
                        <Input
                          id="leisure"
                          type="number"
                          value={data.leisure || ""}
                          onChange={(e) => updateField("leisure", Number(e.target.value))}
                          placeholder="0"
                          className="pl-8"
                        />
                        <Euro className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="healthInsurance" className="text-sm font-medium text-gray-700">
                        Private Krankenversicherung
                      </Label>
                      <div className="relative">
                        <Input
                          id="healthInsurance"
                          type="number"
                          value={data.healthInsurance || ""}
                          onChange={(e) => updateField("healthInsurance", Number(e.target.value))}
                          placeholder="0"
                          className="pl-8"
                        />
                        <Euro className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="personalOther" className="text-sm font-medium text-gray-700">
                        Sonstiges
                      </Label>
                      <div className="relative">
                        <Input
                          id="personalOther"
                          type="number"
                          value={data.personalOther || ""}
                          onChange={(e) => updateField("personalOther", Number(e.target.value))}
                          placeholder="0"
                          className="pl-8"
                        />
                        <Euro className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Monatliche Burnrate:</span>
                      <span className="text-xl font-bold text-gray-900">
                        {personalBurnRate.toLocaleString("de-DE")} €
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Business Costs */}
            {currentStep === 2 && (
              <Card className="bg-white shadow-sm border-0 rounded-xl">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-gray-900 text-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calculator className="h-5 w-5 text-blue-600" />
                    </div>
                    Geschäftliche Fixkosten
                  </CardTitle>
                  <p className="text-gray-600">Deine monatlichen Business-Ausgaben</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="software" className="text-sm font-medium text-gray-700">
                        Software-Abos
                      </Label>
                      <div className="relative">
                        <Input
                          id="software"
                          type="number"
                          value={data.software || ""}
                          onChange={(e) => updateField("software", Number(e.target.value))}
                          placeholder="0"
                          className="pl-8"
                        />
                        <Euro className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="internet" className="text-sm font-medium text-gray-700">
                        Internet/Telefon
                      </Label>
                      <div className="relative">
                        <Input
                          id="internet"
                          type="number"
                          value={data.internet || ""}
                          onChange={(e) => updateField("internet", Number(e.target.value))}
                          placeholder="0"
                          className="pl-8"
                        />
                        <Euro className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hosting" className="text-sm font-medium text-gray-700">
                        Hosting & Website
                      </Label>
                      <div className="relative">
                        <Input
                          id="hosting"
                          type="number"
                          value={data.hosting || ""}
                          onChange={(e) => updateField("hosting", Number(e.target.value))}
                          placeholder="0"
                          className="pl-8"
                        />
                        <Euro className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taxAdvisor" className="text-sm font-medium text-gray-700">
                        Steuerberatung
                      </Label>
                      <div className="relative">
                        <Input
                          id="taxAdvisor"
                          type="number"
                          value={data.taxAdvisor || ""}
                          onChange={(e) => updateField("taxAdvisor", Number(e.target.value))}
                          placeholder="0"
                          className="pl-8"
                        />
                        <Euro className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessInsurance" className="text-sm font-medium text-gray-700">
                        Versicherungen (beruflich)
                      </Label>
                      <div className="relative">
                        <Input
                          id="businessInsurance"
                          type="number"
                          value={data.businessInsurance || ""}
                          onChange={(e) => updateField("businessInsurance", Number(e.target.value))}
                          placeholder="0"
                          className="pl-8"
                        />
                        <Euro className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="marketing" className="text-sm font-medium text-gray-700">
                        Marketingbudget
                      </Label>
                      <div className="relative">
                        <Input
                          id="marketing"
                          type="number"
                          value={data.marketing || ""}
                          onChange={(e) => updateField("marketing", Number(e.target.value))}
                          placeholder="0"
                          className="pl-8"
                        />
                        <Euro className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="businessOther" className="text-sm font-medium text-gray-700">
                        Sonstige Kosten
                      </Label>
                      <div className="relative">
                        <Input
                          id="businessOther"
                          type="number"
                          value={data.businessOther || ""}
                          onChange={(e) => updateField("businessOther", Number(e.target.value))}
                          placeholder="0"
                          className="pl-8"
                        />
                        <Euro className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Monatliche Business-Fixkosten:</span>
                      <span className="text-xl font-bold text-gray-900">
                        {businessFixedCosts.toLocaleString("de-DE")} €
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Tax Settings */}
            {currentStep === 3 && (
              <Card className="bg-white shadow-sm border-0 rounded-xl">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-gray-900 text-xl">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    Steuerliche Rücklagen
                  </CardTitle>
                  <p className="text-gray-600">Plane deine Steuerlast richtig ein</p>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700">
                      Erwarteter Einkommenssteuersatz:{" "}
                      <span className="font-bold text-custom-orange">{data.incomeTaxRate}%</span>
                    </Label>
                    <Slider
                      value={[data.incomeTaxRate]}
                      onValueChange={(value) => updateField("incomeTaxRate", value[0])}
                      max={50}
                      step={1}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0%</span>
                      <span>50%</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700">
                      Erwarteter Gewerbesteuersatz:{" "}
                      <span className="font-bold text-custom-orange">{data.businessTaxRate}%</span>
                    </Label>
                    <Slider
                      value={[data.businessTaxRate]}
                      onValueChange={(value) => updateField("businessTaxRate", value[0])}
                      max={20}
                      step={1}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0%</span>
                      <span>20%</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="vat" className="text-sm font-medium text-gray-700">
                      Umsatzsteuerpflicht
                    </Label>
                    <Select
                      value={data.vatRequired ? "yes" : "no"}
                      onValueChange={(value) => updateField("vatRequired", value === "yes")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">Nein (Kleinunternehmer)</SelectItem>
                        <SelectItem value="yes">Ja (Umsatzsteuerpflichtig)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500">
                      💡 Tipp: Wenn du über 22.000 € Jahresumsatz liegst, bist du meist nicht mehr Kleinunternehmer
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Reserves */}
            {currentStep === 4 && (
              <Card className="bg-white shadow-sm border-0 rounded-xl">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-gray-900 text-xl">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-purple-600" />
                    </div>
                    Liquiditätsreserve & Sicherheitspolster
                  </CardTitle>
                  <p className="text-gray-600">Wie gut bist du für schwierige Zeiten gerüstet?</p>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-3">
                    <Label htmlFor="currentReserves" className="text-sm font-medium text-gray-700">
                      Aktuell vorhandene Rücklagen
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentReserves"
                        type="number"
                        value={data.currentReserves || ""}
                        onChange={(e) => updateField("currentReserves", Number(e.target.value))}
                        placeholder="0"
                        className="pl-8"
                      />
                      <Euro className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700">
                      Gewünschtes Sicherheits-Polster:{" "}
                      <span className="font-bold text-custom-orange">{data.desiredBuffer} Monate</span>
                    </Label>
                    <Slider
                      value={[data.desiredBuffer]}
                      onValueChange={(value) => updateField("desiredBuffer", value[0])}
                      min={1}
                      max={24}
                      step={1}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1 Monat</span>
                      <span>24 Monate</span>
                    </div>
                  </div>

                  {data.currentReserves > 0 && (
                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <strong>Deine aktuelle Situation:</strong> Du könntest {monthsOfReserves.toFixed(1)} Monate ohne
                        Einnahmen überstehen.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 5: Revenue Planning */}
            {currentStep === 5 && (
              <Card className="bg-white shadow-sm border-0 rounded-xl">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-gray-900 text-xl">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-teal-600" />
                    </div>
                    Geplante Einnahmen (Forecast)
                  </CardTitle>
                  <p className="text-gray-600">Wie viel kannst du realistisch verdienen?</p>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="projectFee" className="text-sm font-medium text-gray-700">
                        Erwartetes Honorar pro Projekt
                      </Label>
                      <div className="relative">
                        <Input
                          id="projectFee"
                          type="number"
                          value={data.projectFee || ""}
                          onChange={(e) => updateField("projectFee", Number(e.target.value))}
                          placeholder="0"
                          className="pl-8"
                        />
                        <Euro className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="projectsPerMonth" className="text-sm font-medium text-gray-700">
                        Erwartete Anzahl Projekte pro Monat
                      </Label>
                      <Input
                        id="projectsPerMonth"
                        type="number"
                        value={data.projectsPerMonth || ""}
                        onChange={(e) => updateField("projectsPerMonth", Number(e.target.value))}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="font-semibold text-gray-900">
                      Auftragswahrscheinlichkeit in verschiedenen Szenarien:
                    </h4>

                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-gray-700">
                        Pessimistisch: <span className="font-bold text-red-600">{data.pessimisticRate}%</span>
                      </Label>
                      <Slider
                        value={[data.pessimisticRate]}
                        onValueChange={(value) => updateField("pessimisticRate", value[0])}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-gray-700">
                        Realistisch: <span className="font-bold text-amber-600">{data.realisticRate}%</span>
                      </Label>
                      <Slider
                        value={[data.realisticRate]}
                        onValueChange={(value) => updateField("realisticRate", value[0])}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-gray-700">
                        Optimistisch: <span className="font-bold text-green-600">{data.optimisticRate}%</span>
                      </Label>
                      <Slider
                        value={[data.optimisticRate]}
                        onValueChange={(value) => updateField("optimisticRate", value[0])}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <Button
                onClick={prevStep}
                variant="outline"
                size="lg"
                disabled={currentStep === 1}
                className="order-2 sm:order-1 bg-transparent"
              >
                Zurück
              </Button>

              <div className="flex gap-4 order-1 sm:order-2">
                {currentStep < 5 ? (
                  <Button
                    onClick={nextStep}
                    size="lg"
                    className="bg-custom-orange hover:bg-custom-orange-dark text-white px-8 flex-1 sm:flex-none"
                  >
                    Weiter
                  </Button>
                ) : (
                  <Button
                    onClick={handleCalculate}
                    size="lg"
                    className="bg-custom-orange hover:bg-custom-orange-dark text-white px-8 flex-1 sm:flex-none"
                  >
                    <Calculator className="mr-2 h-5 w-5" />
                    Jetzt berechnen
                  </Button>
                )}

                <Button
                  onClick={resetData}
                  variant="outline"
                  size="lg"
                  className="text-gray-600 hover:text-gray-800 bg-transparent"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Results */}
            {showResults && (
              <div className="space-y-8 animate-slide-in">
                <ScenarioResults
                  breakEvenGross={breakEvenGross}
                  totalMonthlyCosts={totalMonthlyCosts}
                  scenarios={scenarios}
                  monthsOfReserves={monthsOfReserves}
                  desiredBuffer={data.desiredBuffer}
                />

                <ForecastChart
                  breakEven={breakEvenGross}
                  scenarios={scenarios}
                  labels={["Pessimistisch", "Realistisch", "Optimistisch"]}
                />

                {/* CTA */}
                <Card className="bg-gradient-to-r from-custom-orange to-amber-500 text-white border-0 rounded-xl">
                  <CardContent className="pt-8 pb-8 text-center">
                    <h3 className="text-2xl font-bold mb-4">Willst du tiefer einsteigen? 📈</h3>
                    <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
                      In unserem Recruiting-Kurs lernst du, wie du Kunden gewinnst, dein Business absicherst und
                      nachhaltig aufbaust – mit praxiserprobten Strategien und persönlicher Betreuung.
                    </p>
                    <Button
                      size="lg"
                      className="bg-white text-custom-orange hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-lg"
                    >
                      Jetzt starten →
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-800 px-4 py-2 rounded-lg text-sm">
              <Shield className="h-4 w-4" />
              <span>
                <strong>100% Datenschutz:</strong> Alle Daten bleiben auf deinem Gerät
              </span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
