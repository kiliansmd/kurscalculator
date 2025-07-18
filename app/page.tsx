"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Info,
  Calculator,
  TrendingUp,
  Shield,
  RotateCcw,
  CheckCircle,
  Euro,
  HelpCircle,
  ExternalLink,
  Save,
  Download,
  Share2,
} from "lucide-react"
import { ForecastChart } from "@/components/forecast-chart"
import { ScenarioResults } from "@/components/scenario-results"
import { CoursePromotionModal } from "@/components/course-promotion-modal"

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
  projectsPerYear: number
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
  projectFee: 10000,
  projectsPerYear: 6,
  pessimisticRate: 30,
  realisticRate: 60,
  optimisticRate: 90,
}

export default function ForecastTool() {
  const [data, setData] = useState<FormData>(defaultData)
  const [showResults, setShowResults] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [savedData, setSavedData] = useState<FormData[]>([])

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

    const savedScenarios = localStorage.getItem("recruiting-forecast-saved")
    if (savedScenarios) {
      try {
        setSavedData(JSON.parse(savedScenarios))
      } catch (e) {
        console.error("Error loading saved scenarios:", e)
      }
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("recruiting-forecast-data", JSON.stringify(data))
  }, [data])

  // Auto-scroll to results when they are shown
  useEffect(() => {
    if (showResults) {
      // Small delay to ensure the results are rendered
      setTimeout(() => {
        const resultsElement = document.getElementById("forecast-results")
        if (resultsElement) {
          resultsElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          })
        }
        // Show promotion modal after scrolling
        setTimeout(() => {
          setShowPromoModal(true)
        }, 1500)
      }, 100)
    }
  }, [showResults])

  const updateField = useCallback((field: keyof FormData, value: number | boolean) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const resetData = () => {
    setData(defaultData)
    localStorage.removeItem("recruiting-forecast-data")
    setShowResults(false)
    setCurrentStep(1)
    setShowPromoModal(false)
  }

  const saveCurrentScenario = () => {
    const timestamp = new Date().toISOString()
    const scenarioName = `Szenario ${new Date().toLocaleDateString("de-DE")}`
    const newScenario = { ...data, timestamp, name: scenarioName }
    const updated = [...savedData, newScenario]
    setSavedData(updated)
    localStorage.setItem("recruiting-forecast-saved", JSON.stringify(updated))
  }

  const exportData = () => {
    const dataStr = JSON.stringify(data, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `recruiting-forecast-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const shareResults = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Recruiting Business Forecast",
          text: `Mein Break-Even liegt bei ${formatCurrency(breakEvenGross)} pro Monat. Berechne deinen eigenen Forecast!`,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Link wurde in die Zwischenablage kopiert!")
    }
  }

  // Validation
  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return data.rent > 0 || data.food > 0 || data.insurance > 0
      case 2:
        return true // Business costs are optional
      case 3:
        return data.incomeTaxRate >= 0 && data.businessTaxRate >= 0
      case 4:
        return data.desiredBuffer > 0
      case 5:
        return data.projectFee > 0 && data.projectsPerYear > 0
      default:
        return true
    }
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

  const projectsPerMonth = data.projectsPerYear / 12

  const scenarios = {
    pessimistic: calculateNetRevenue((data.projectFee * projectsPerMonth * data.pessimisticRate) / 100),
    realistic: calculateNetRevenue((data.projectFee * projectsPerMonth * data.realisticRate) / 100),
    optimistic: calculateNetRevenue((data.projectFee * projectsPerMonth * data.optimisticRate) / 100),
  }

  const monthsOfReserves = data.currentReserves > 0 ? data.currentReserves / totalMonthlyCosts : 0

  const handleCalculate = async () => {
    setIsCalculating(true)
    // Simulate calculation time for better UX
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsCalculating(false)
    setShowResults(true)
  }

  const nextStep = () => {
    if (currentStep < 5 && validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
  }

  const getStepProgress = () => {
    let completedSteps = 0
    for (let i = 1; i <= 5; i++) {
      if (validateStep(i)) completedSteps++
    }
    return (completedSteps / 5) * 100
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
                <CheckCircle className="h-4 w-4 text-custom-orange" />
                <span>Sofort einsatzbereit</span>
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-700">Schritt {currentStep} von 5</span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">{Math.round(getStepProgress())}% vollständig</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={saveCurrentScenario} className="text-xs bg-transparent">
                    <Save className="h-3 w-3 mr-1" />
                    Speichern
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportData} className="text-xs bg-transparent">
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
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
                      <Label htmlFor="rent" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        Miete/Wohnkosten
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Trage hier deine Warmmiete ein, inklusive Nebenkosten wie Heizung, Wasser und Strom.</p>
                          </TooltipContent>
                        </Tooltip>
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
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      Erwarteter Einkommenssteuersatz:{" "}
                      <span className="font-bold text-custom-orange">{data.incomeTaxRate}%</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="mb-2">Der Einkommenssteuersatz hängt von deinem Jahreseinkommen ab:</p>
                          <ul className="text-xs space-y-1">
                            <li>• bis 10.908 €: 0%</li>
                            <li>• 10.909 - 62.809 €: 14-42%</li>
                            <li>• 62.810 - 277.825 €: 42%</li>
                            <li>• über 277.826 €: 45%</li>
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                      <a
                        href="https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/Steuerarten/Einkommensteuer/einkommensteuer.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
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
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      Erwarteter Gewerbesteuersatz:{" "}
                      <span className="font-bold text-custom-orange">{data.businessTaxRate}%</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>
                            Die Gewerbesteuer variiert je nach Gemeinde. Der Grundsteuersatz beträgt 3,5%, wird aber mit
                            dem Hebesatz der Gemeinde multipliziert. Durchschnittlich liegt der effektive Satz bei
                            14-17%.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      <a
                        href="https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/Steuerarten/Gewerbesteuer/gewerbesteuer.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
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
                    <p className="text-sm text-gray-500 flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Tipp: Wenn du über 22.000 € Jahresumsatz liegst, bist du meist nicht mehr Kleinunternehmer und
                        musst 19% Umsatzsteuer abführen.
                        <a
                          href="https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/Steuerarten/Umsatzsteuer/umsatzsteuer.html"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 ml-1"
                        >
                          Mehr erfahren <ExternalLink className="h-3 w-3 inline" />
                        </a>
                      </span>
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
                    <Label
                      htmlFor="currentReserves"
                      className="text-sm font-medium text-gray-700 flex items-center gap-2"
                    >
                      Aktuell vorhandene Rücklagen
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>
                            Hier sollten nur liquide Mittel eingetragen werden, die innerhalb von 1-2 Wochen verfügbar
                            sind. Dazu gehören: Giro-/Tagesgeldkonten, kurzfristige Festgelder. Nicht: Aktien, ETFs,
                            Immobilien oder langfristige Anlagen.
                          </p>
                        </TooltipContent>
                      </Tooltip>
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
                    <p className="text-xs text-gray-500">
                      💡 Nur liquide Mittel (verfügbar in 1-2 Wochen): Giro-, Tagesgeld-, kurzfristige Festgeldkonten
                    </p>
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
                        Durchschnittlicher Umsatz pro Vermittlung
                      </Label>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>1.000 €</span>
                          <span className="font-medium">{data.projectFee.toLocaleString("de-DE")} €</span>
                          <span>50.000 €</span>
                        </div>
                        <Slider
                          value={[data.projectFee]}
                          onValueChange={(value) => updateField("projectFee", value[0])}
                          min={1000}
                          max={50000}
                          step={500}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="projectsPerYear" className="text-sm font-medium text-gray-700">
                        Erwartete Vermittlungen im ersten Jahr
                      </Label>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>1</span>
                          <span className="font-medium">{data.projectsPerYear} Vermittlungen</span>
                          <span>12</span>
                        </div>
                        <Slider
                          value={[data.projectsPerYear]}
                          onValueChange={(value) => updateField("projectsPerYear", value[0])}
                          min={1}
                          max={12}
                          step={1}
                          className="mt-2"
                        />
                        <p className="text-xs text-gray-500">
                          Das entspricht {(data.projectsPerYear / 12).toFixed(1)} Vermittlungen pro Monat
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-600" />
                        Auftragswahrscheinlichkeit - Was bedeutet das?
                      </h4>
                      <p className="text-sm text-gray-700 mb-3">
                        Die Prozentsätze geben an, mit welcher Wahrscheinlichkeit du deine geplanten{" "}
                        {data.projectsPerYear} Vermittlungen pro Jahr tatsächlich realisierst:
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>• Pessimistisch ({data.pessimisticRate}%):</span>
                          <span className="font-medium">
                            {Math.round((data.projectsPerYear * data.pessimisticRate) / 100)} Vermittlungen/Jahr
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Realistisch ({data.realisticRate}%):</span>
                          <span className="font-medium">
                            {Math.round((data.projectsPerYear * data.realisticRate) / 100)} Vermittlungen/Jahr
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Optimistisch ({data.optimisticRate}%):</span>
                          <span className="font-medium">
                            {Math.round((data.projectsPerYear * data.optimisticRate) / 100)} Vermittlungen/Jahr
                          </span>
                        </div>
                      </div>
                    </div>

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
                    disabled={!validateStep(currentStep)}
                    className="bg-custom-orange hover:bg-custom-orange-dark text-white px-8 flex-1 sm:flex-none disabled:opacity-50"
                  >
                    Weiter
                  </Button>
                ) : (
                  <Button
                    onClick={handleCalculate}
                    size="lg"
                    disabled={isCalculating || !validateStep(currentStep)}
                    className="bg-custom-orange hover:bg-custom-orange-dark text-white px-8 flex-1 sm:flex-none disabled:opacity-50"
                  >
                    {isCalculating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Berechne...
                      </>
                    ) : (
                      <>
                        <Calculator className="mr-2 h-5 w-5" />
                        Jetzt berechnen
                      </>
                    )}
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
              <div id="forecast-results" className="space-y-8 animate-slide-in">
                <ScenarioResults
                  breakEvenGross={breakEvenGross}
                  totalMonthlyCosts={totalMonthlyCosts}
                  scenarios={scenarios}
                  monthsOfReserves={monthsOfReserves}
                  desiredBuffer={data.desiredBuffer}
                  projectsPerYear={data.projectsPerYear}
                  projectFee={data.projectFee}
                  taxRate={data.incomeTaxRate + data.businessTaxRate + (data.vatRequired ? 19 : 0)}
                />

                <ForecastChart
                  breakEven={breakEvenGross}
                  scenarios={scenarios}
                  labels={["Pessimistisch", "Realistisch", "Optimistisch"]}
                />

                {/* Share Results */}
                <Card className="bg-white shadow-sm border-0 rounded-xl">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <p className="text-gray-600 text-center sm:text-left">
                        Teile deine Ergebnisse oder speichere sie für später:
                      </p>
                      <div className="flex gap-3">
                        <Button
                          onClick={shareResults}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 bg-transparent"
                        >
                          <Share2 className="h-4 w-4" />
                          Teilen
                        </Button>
                        <Button
                          onClick={exportData}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 bg-transparent"
                        >
                          <Download className="h-4 w-4" />
                          Exportieren
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* CTA */}
                <Card className="bg-gradient-to-r from-custom-orange to-amber-500 text-white border-0 rounded-xl">
                  <CardContent className="pt-8 pb-8 text-center">
                    <h3 className="text-2xl font-bold mb-4">Willst du tiefer einsteigen? 📈</h3>
                    <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
                      In unserem Recruiting-Kurs lernst du, wie du Kunden gewinnst, dein Business absicherst und
                      nachhaltig aufbaust – mit praxiserprobten Strategien und persönlicher Betreuung.
                    </p>
                    <a href="https://getexperts.academy/" target="_blank" rel="noopener noreferrer">
                      <Button
                        size="lg"
                        className="bg-white text-custom-orange hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-lg"
                      >
                        Jetzt starten →
                      </Button>
                    </a>
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

        {/* Course Promotion Modal */}
        <CoursePromotionModal isOpen={showPromoModal} onClose={() => setShowPromoModal(false)} />
      </div>
    </TooltipProvider>
  )
}
