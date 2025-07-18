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
  Shield,
  RotateCcw,
  CheckCircle,
  Euro,
  HelpCircle,
  Share2,
  ArrowRight,
  ArrowLeft,
  Check,
  Home,
  Building2,
  Receipt,
  Wallet,
  Target,
  Lock,
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

  // Revenue planning - Fixe Werte basierend auf Erfahrung
  projectFee: number // Fest: 60k * 20% = 12.000€
  projectsPerYear: number // Variable: Anzahl Vermittlungen
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
  projectFee: 12000, // Fest: 60k€ * 20% = 12.000€ pro Vermittlung
  projectsPerYear: 6, // Variable: Anzahl Vermittlungen
  pessimisticRate: 30,
  realisticRate: 60,
  optimisticRate: 90,
}

const steps = [
  {
    id: 1,
    title: "Privat",
    subtitle: "Lebenshaltungskosten",
    icon: Home,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: 2,
    title: "Business",
    subtitle: "Geschäftskosten",
    icon: Building2,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    id: 3,
    title: "Steuern",
    subtitle: "Rücklagen",
    icon: Receipt,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
  },
  {
    id: 4,
    title: "Sicherheit",
    subtitle: "Liquidität",
    icon: Wallet,
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    id: 5,
    title: "Vermittlungen",
    subtitle: "Deine Ziele",
    icon: Target,
    color: "from-teal-500 to-teal-600",
    bgColor: "bg-teal-50",
  },
]

export default function ForecastTool() {
  const [data, setData] = useState<FormData>(defaultData)
  const [showResults, setShowResults] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  // Fixe Werte basierend auf Erfahrung
  const salaryBase = 60000 // 60k€ brutto
  const commissionRate = 20 // 20% Provision

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("recruiting-forecast-data")
    if (saved) {
      try {
        const savedData = JSON.parse(saved)
        // Stelle sicher, dass die fixen Werte korrekt sind
        savedData.projectFee = 12000
        setData(savedData)
      } catch (e) {
        console.error("Error loading saved data:", e)
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
      setTimeout(() => {
        const resultsElement = document.getElementById("forecast-results")
        if (resultsElement) {
          resultsElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          })
        }
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
      navigator.clipboard.writeText(window.location.href)
      alert("Link wurde in die Zwischenablage kopiert!")
    }
  }

  // Validation
  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return (
          data.rent > 0 ||
          data.food > 0 ||
          data.insurance > 0 ||
          data.mobility > 0 ||
          data.communication > 0 ||
          data.leisure > 0 ||
          data.healthInsurance > 0 ||
          data.personalOther > 0
        )
      case 2:
        return true
      case 3:
        return data.incomeTaxRate >= 0 && data.businessTaxRate >= 0
      case 4:
        return data.desiredBuffer > 0
      case 5:
        return data.projectsPerYear > 0
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
      taxRate += 0.19
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

  const currentStepData = steps[currentStep - 1]

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Modern Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-slate-600 px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-sm border border-slate-200">
              <Calculator className="h-4 w-4 text-custom-orange" />
              Kostenloser Business-Rechner
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
              Recruiting Business
              <span className="bg-gradient-to-r from-custom-orange to-amber-500 bg-clip-text text-transparent">
                {" "}
                Forecast
              </span>
            </h1>

            <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Berechne dein persönliches Sicherheitsnetz & Umsatz-Ziel in wenigen Minuten.
              <br />
              <span className="text-slate-900 font-semibold">Sicher, anonym und ohne Anmeldung.</span>
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 mb-12">
              <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-200">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-slate-700">100% Datenschutz</span>
              </div>
              <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-200">
                <CheckCircle className="h-5 w-5 text-custom-orange" />
                <span className="text-sm font-medium text-slate-700">Sofort einsatzbereit</span>
              </div>
            </div>
          </div>

          {/* Modern Step Navigation */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{currentStepData.title}</h2>
                <p className="text-slate-600">{currentStepData.subtitle}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-slate-700">Schritt {currentStep} von 5</div>
                <div className="text-xs text-slate-500">{Math.round((currentStep / 5) * 100)}% abgeschlossen</div>
              </div>
            </div>

            {/* Step Progress */}
            <div className="flex items-center gap-4 mb-6">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id
                const isCompleted = currentStep > step.id
                const IconComponent = step.icon

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isActive
                            ? `bg-gradient-to-r ${step.color} text-white shadow-lg scale-110`
                            : isCompleted
                              ? "bg-green-100 text-green-600"
                              : "bg-white text-slate-400 border border-slate-200"
                        }`}
                      >
                        {isCompleted ? <Check className="h-5 w-5" /> : <IconComponent className="h-5 w-5" />}
                      </div>
                      <div className="hidden md:block">
                        <div className={`text-sm font-medium ${isActive ? "text-slate-900" : "text-slate-600"}`}>
                          {step.title}
                        </div>
                        <div className="text-xs text-slate-500">{step.subtitle}</div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-0.5 w-full mx-4 transition-all duration-300 ${
                          isCompleted ? "bg-green-300" : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-custom-orange to-amber-500 transition-all duration-700 ease-out rounded-full"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Steps */}
          <div className="mb-12">
            {/* Step 1: Personal Costs */}
            {currentStep === 1 && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className={`${currentStepData.bgColor} border-b border-slate-200/50`}>
                  <CardTitle className="flex items-center gap-4 text-slate-900 text-2xl">
                    <div
                      className={`w-14 h-14 bg-gradient-to-r ${currentStepData.color} rounded-2xl flex items-center justify-center shadow-lg`}
                    >
                      <Home className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Persönliche Lebenshaltungskosten</h3>
                      <p className="text-slate-600 font-normal text-base">
                        Trage deine monatlichen privaten Ausgaben ein
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      {
                        key: "rent",
                        label: "Miete & Wohnkosten",
                        tooltip: "Warmmiete inklusive Nebenkosten wie Heizung, Wasser und Strom",
                        placeholder: "z.B. 1.200",
                      },
                      { key: "food", label: "Lebensmittel", placeholder: "z.B. 400" },
                      { key: "insurance", label: "Versicherungen (privat)", placeholder: "z.B. 150" },
                      { key: "mobility", label: "Mobilität", placeholder: "z.B. 200" },
                      { key: "communication", label: "Kommunikation", placeholder: "z.B. 80" },
                      { key: "leisure", label: "Freizeit & Konsum", placeholder: "z.B. 300" },
                      { key: "healthInsurance", label: "Private Krankenversicherung", placeholder: "z.B. 450" },
                      { key: "personalOther", label: "Sonstiges", placeholder: "z.B. 100" },
                    ].map((field) => (
                      <div key={field.key} className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          {field.label}
                          {field.tooltip && (
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{field.tooltip}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </Label>
                        <div className="relative">
                          <Input
                            type="number"
                            value={data[field.key as keyof FormData] || ""}
                            onChange={(e) => updateField(field.key as keyof FormData, Number(e.target.value))}
                            placeholder={field.placeholder}
                            className="pl-12 h-14 text-lg border-2 border-slate-200 focus:border-blue-500 rounded-xl bg-white/50 transition-all duration-200"
                          />
                          <Euro className="absolute left-4 top-4 h-6 w-6 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-semibold text-slate-700 mb-1">Monatliche Burnrate</div>
                        <div className="text-xs text-slate-500">Deine gesamten privaten Ausgaben</div>
                      </div>
                      <div className="text-3xl font-bold text-slate-900">
                        {personalBurnRate.toLocaleString("de-DE")} €
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Business Costs */}
            {currentStep === 2 && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className={`${currentStepData.bgColor} border-b border-slate-200/50`}>
                  <CardTitle className="flex items-center gap-4 text-slate-900 text-2xl">
                    <div
                      className={`w-14 h-14 bg-gradient-to-r ${currentStepData.color} rounded-2xl flex items-center justify-center shadow-lg`}
                    >
                      <Building2 className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Geschäftliche Fixkosten</h3>
                      <p className="text-slate-600 font-normal text-base">Deine monatlichen Business-Ausgaben</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      { key: "software", label: "Software & Tools", placeholder: "z.B. 120" },
                      { key: "internet", label: "Internet & Telefon", placeholder: "z.B. 60" },
                      { key: "hosting", label: "Website & Hosting", placeholder: "z.B. 30" },
                      { key: "taxAdvisor", label: "Steuerberater", placeholder: "z.B. 150" },
                      { key: "businessInsurance", label: "Versicherungen (beruflich)", placeholder: "z.B. 80" },
                      { key: "marketing", label: "Marketing & Werbung", placeholder: "z.B. 200" },
                    ].map((field) => (
                      <div key={field.key} className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700">{field.label}</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            value={data[field.key as keyof FormData] || ""}
                            onChange={(e) => updateField(field.key as keyof FormData, Number(e.target.value))}
                            placeholder={field.placeholder}
                            className="pl-12 h-14 text-lg border-2 border-slate-200 focus:border-purple-500 rounded-xl bg-white/50 transition-all duration-200"
                          />
                          <Euro className="absolute left-4 top-4 h-6 w-6 text-slate-400" />
                        </div>
                      </div>
                    ))}

                    <div className="space-y-3 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">Sonstige Kosten</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={data.businessOther || ""}
                          onChange={(e) => updateField("businessOther", Number(e.target.value))}
                          placeholder="z.B. 100"
                          className="pl-12 h-14 text-lg border-2 border-slate-200 focus:border-purple-500 rounded-xl bg-white/50 transition-all duration-200"
                        />
                        <Euro className="absolute left-4 top-4 h-6 w-6 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-semibold text-slate-700 mb-1">Business-Fixkosten</div>
                        <div className="text-xs text-slate-500">Deine monatlichen Geschäftsausgaben</div>
                      </div>
                      <div className="text-3xl font-bold text-slate-900">
                        {businessFixedCosts.toLocaleString("de-DE")} €
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Tax Settings */}
            {currentStep === 3 && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className={`${currentStepData.bgColor} border-b border-slate-200/50`}>
                  <CardTitle className="flex items-center gap-4 text-slate-900 text-2xl">
                    <div
                      className={`w-14 h-14 bg-gradient-to-r ${currentStepData.color} rounded-2xl flex items-center justify-center shadow-lg`}
                    >
                      <Receipt className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Steuerliche Rücklagen</h3>
                      <p className="text-slate-600 font-normal text-base">Plane deine Steuerlast richtig ein</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-10">
                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-5 w-5 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Wichtiger Hinweis:</strong> Als Selbstständiger zahlst du Einkommensteuer, Gewerbesteuer
                      und ggf. Umsatzsteuer. Die Höhe hängt von deinem Einkommen und Wohnort ab.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-8">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold text-slate-700 flex items-center gap-2">
                          Einkommenssteuersatz
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="mb-2">Abhängig vom Jahreseinkommen:</p>
                              <ul className="text-xs space-y-1">
                                <li>• bis 10.908 €: 0%</li>
                                <li>• 10.909 - 62.809 €: 14-42%</li>
                                <li>• über 62.810 €: 42-45%</li>
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <div className="text-2xl font-bold text-green-600">{data.incomeTaxRate}%</div>
                      </div>
                      <Slider
                        value={[data.incomeTaxRate]}
                        onValueChange={(value) => updateField("incomeTaxRate", value[0])}
                        max={50}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>0%</span>
                        <span>50%</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold text-slate-700 flex items-center gap-2">
                          Gewerbesteuersatz
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>
                                Variiert je nach Gemeinde. Durchschnittlich 14-17%. Der Grundsatz beträgt 3,5%, wird
                                aber mit dem Hebesatz multipliziert.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <div className="text-2xl font-bold text-green-600">{data.businessTaxRate}%</div>
                      </div>
                      <Slider
                        value={[data.businessTaxRate]}
                        onValueChange={(value) => updateField("businessTaxRate", value[0])}
                        max={20}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>0%</span>
                        <span>20%</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-base font-semibold text-slate-700">Umsatzsteuerpflicht</Label>
                      <Select
                        value={data.vatRequired ? "yes" : "no"}
                        onValueChange={(value) => updateField("vatRequired", value === "yes")}
                      >
                        <SelectTrigger className="h-14 text-lg border-2 border-slate-200 focus:border-green-500 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">Nein (Kleinunternehmer)</SelectItem>
                          <SelectItem value="yes">Ja (19% Umsatzsteuer)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-slate-500 flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Bei über 22.000 € Jahresumsatz bist du meist umsatzsteuerpflichtig und musst 19% Umsatzsteuer
                          abführen.
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Reserves */}
            {currentStep === 4 && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className={`${currentStepData.bgColor} border-b border-slate-200/50`}>
                  <CardTitle className="flex items-center gap-4 text-slate-900 text-2xl">
                    <div
                      className={`w-14 h-14 bg-gradient-to-r ${currentStepData.color} rounded-2xl flex items-center justify-center shadow-lg`}
                    >
                      <Wallet className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Liquiditätsreserve</h3>
                      <p className="text-slate-600 font-normal text-base">
                        Dein Sicherheitspolster für schwierige Zeiten
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-10">
                  <div className="space-y-6">
                    <Label className="text-base font-semibold text-slate-700 flex items-center gap-2">
                      Vorhandene Rücklagen
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>
                            Nur liquide Mittel (verfügbar in 1-2 Wochen): Giro-, Tagesgeld-, kurzfristige
                            Festgeldkonten. Keine Aktien, ETFs oder Immobilien.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={data.currentReserves || ""}
                        onChange={(e) => updateField("currentReserves", Number(e.target.value))}
                        placeholder="z.B. 15.000"
                        className="pl-12 h-14 text-lg border-2 border-slate-200 focus:border-amber-500 rounded-xl bg-white/50"
                      />
                      <Euro className="absolute left-4 top-4 h-6 w-6 text-slate-400" />
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Nur liquide Mittel:</strong> Giro-, Tagesgeld-, kurzfristige Festgeldkonten
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold text-slate-700">Gewünschtes Sicherheitspolster</Label>
                      <div className="text-2xl font-bold text-amber-600">{data.desiredBuffer} Monate</div>
                    </div>
                    <Slider
                      value={[data.desiredBuffer]}
                      onValueChange={(value) => updateField("desiredBuffer", value[0])}
                      min={1}
                      max={24}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>1 Monat</span>
                      <span>24 Monate</span>
                    </div>
                  </div>

                  {data.currentReserves > 0 && (
                    <Alert className="border-blue-200 bg-blue-50">
                      <Info className="h-5 w-5 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <strong>Deine aktuelle Situation:</strong> Du könntest {monthsOfReserves.toFixed(1)} Monate ohne
                        Einnahmen überstehen.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 5: Revenue Planning - Nur Vermittlungen variabel */}
            {currentStep === 5 && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className={`${currentStepData.bgColor} border-b border-slate-200/50`}>
                  <CardTitle className="flex items-center gap-4 text-slate-900 text-2xl">
                    <div
                      className={`w-14 h-14 bg-gradient-to-r ${currentStepData.color} rounded-2xl flex items-center justify-center shadow-lg`}
                    >
                      <Target className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Vermittlungs-Prognose</h3>
                      <p className="text-slate-600 font-normal text-base">
                        Basierend auf Erfahrungswerten - nur Anzahl ist variabel
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-10">
                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-5 w-5 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Realistische Basis:</strong> 60.000€ Durchschnittsgehalt und 20% Provision basieren auf
                      unseren Erfahrungswerten. Nur die Anzahl der Vermittlungen kannst du beeinflussen - sei
                      realistisch!
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Fixe Werte - nur zur Anzeige */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold text-slate-700 flex items-center gap-2">
                          Durchschnittsgehalt
                          <Lock className="h-4 w-4 text-slate-400" />
                        </Label>
                        <span className="text-2xl font-bold text-slate-600">
                          {salaryBase.toLocaleString("de-DE")} €
                        </span>
                      </div>
                      <div className="bg-slate-100 rounded-lg p-4 text-center">
                        <p className="text-sm text-slate-600 font-medium">Basierend auf Erfahrungswerten</p>
                        <p className="text-xs text-slate-500 mt-1">Brutto-Jahresgehalt der Kandidaten</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold text-slate-700 flex items-center gap-2">
                          Provision
                          <Lock className="h-4 w-4 text-slate-400" />
                        </Label>
                        <span className="text-2xl font-bold text-slate-600">{commissionRate}%</span>
                      </div>
                      <div className="bg-slate-100 rounded-lg p-4 text-center">
                        <p className="text-sm text-slate-600 font-medium">Realistischer Branchendurchschnitt</p>
                        <p className="text-xs text-slate-500 mt-1">
                          = {formatCurrency(salaryBase * (commissionRate / 100))} pro Vermittlung
                        </p>
                      </div>
                    </div>

                    {/* Variable Vermittlungen */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold text-slate-700">Vermittlungen pro Jahr</Label>
                        <span className="text-2xl font-bold text-teal-600">{data.projectsPerYear}</span>
                      </div>
                      <div className="space-y-4">
                        <Slider
                          value={[data.projectsPerYear]}
                          onValueChange={(value) => updateField("projectsPerYear", value[0])}
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
                          ≈ {(data.projectsPerYear / 12).toFixed(1)} Vermittlungen pro Monat
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-2xl p-6 border border-teal-200">
                    <div className="text-center">
                      <h4 className="text-lg font-semibold text-teal-900 mb-2">Dein Umsatzpotenzial</h4>
                      <div className="text-3xl font-bold text-teal-800 mb-2">
                        {formatCurrency(data.projectsPerYear * salaryBase * (commissionRate / 100))} / Jahr
                      </div>
                      <p className="text-sm text-teal-700">
                        {data.projectsPerYear} Vermittlungen × {formatCurrency(salaryBase * (commissionRate / 100))}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <Label className="text-base font-semibold text-slate-700">Pessimistisch</Label>
                        <div className="text-xl font-bold text-red-600">{data.pessimisticRate}%</div>
                      </div>
                      <Slider
                        value={[data.pessimisticRate]}
                        onValueChange={(value) => updateField("pessimisticRate", value[0])}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-sm text-slate-500">
                        {Math.round((data.projectsPerYear * data.pessimisticRate) / 100)} Vermittlungen/Jahr
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                        <Label className="text-base font-semibold text-slate-700">Realistisch</Label>
                        <div className="text-xl font-bold text-amber-600">{data.realisticRate}%</div>
                      </div>
                      <Slider
                        value={[data.realisticRate]}
                        onValueChange={(value) => updateField("realisticRate", value[0])}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-sm text-slate-500">
                        {Math.round((data.projectsPerYear * data.realisticRate) / 100)} Vermittlungen/Jahr
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <Label className="text-base font-semibold text-slate-700">Optimistisch</Label>
                        <div className="text-xl font-bold text-green-600">{data.optimisticRate}%</div>
                      </div>
                      <Slider
                        value={[data.optimisticRate]}
                        onValueChange={(value) => updateField("optimisticRate", value[0])}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-sm text-slate-500">
                        {Math.round((data.projectsPerYear * data.optimisticRate) / 100)} Vermittlungen/Jahr
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Modern Navigation */}
          <div className="flex items-center justify-between gap-6">
            <Button
              onClick={prevStep}
              variant="outline"
              size="lg"
              disabled={currentStep === 1}
              className="bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 px-6 py-3 h-auto"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Zurück
            </Button>

            <div className="flex items-center gap-4">
              {currentStep < 5 ? (
                <Button
                  onClick={nextStep}
                  size="lg"
                  disabled={!validateStep(currentStep)}
                  className="bg-gradient-to-r from-custom-orange to-amber-500 hover:from-custom-orange-dark hover:to-amber-600 text-white px-8 py-3 h-auto font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  Weiter
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button
                  onClick={handleCalculate}
                  size="lg"
                  disabled={isCalculating || !validateStep(currentStep)}
                  className="bg-gradient-to-r from-custom-orange to-amber-500 hover:from-custom-orange-dark hover:to-amber-600 text-white px-8 py-3 h-auto font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  {isCalculating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
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
                className="bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 px-6 py-3 h-auto"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          {/* Results */}
          {showResults && (
            <div id="forecast-results" className="mt-16 space-y-8 animate-slide-in">
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
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <p className="text-slate-600 text-center sm:text-left text-lg">Teile deine Ergebnisse:</p>
                    <Button
                      onClick={shareResults}
                      variant="outline"
                      size="lg"
                      className="bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-6 py-3 h-auto"
                    >
                      <Share2 className="h-5 w-5 mr-2" />
                      Ergebnisse teilen
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <Card className="border-0 shadow-2xl bg-gradient-to-r from-custom-orange to-amber-500 text-white overflow-hidden">
                <CardContent className="p-12 text-center relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-bold mb-6">Bereit für den nächsten Schritt? 🚀</h3>
                    <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
                      In unserem Recruiting-Kurs lernst du, wie du Kunden gewinnst, dein Business absicherst und
                      nachhaltig aufbaust – mit praxiserprobten Strategien und persönlicher Betreuung.
                    </p>
                    <a href="https://getexperts.academy/" target="_blank" rel="noopener noreferrer">
                      <Button
                        size="lg"
                        className="bg-white text-custom-orange hover:bg-slate-50 px-10 py-4 text-xl font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 h-auto"
                      >
                        Jetzt starten →
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="mt-20 text-center">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm text-slate-700 px-6 py-4 rounded-2xl border border-slate-200 shadow-sm">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="font-medium">
                <strong>100% Datenschutz:</strong> Alle Daten bleiben sicher auf deinem Gerät
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
