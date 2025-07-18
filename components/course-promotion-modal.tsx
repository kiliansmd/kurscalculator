"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Rocket, Star, Users, CheckCircle, Shield, ExternalLink, Gift } from "lucide-react"

interface CoursePromotionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CoursePromotionModal({ isOpen, onClose }: CoursePromotionModalProps) {
  const benefits = [
    "Schritt-für-Schritt Anleitung zum erfolgreichen Recruiting-Business",
    "Bewährte Strategien zur Kundengewinnung und -bindung",
    "Finanzplanung und Risikomanagement für Selbstständige",
    "Persönliche Betreuung und Community-Support",
    "Praxiserprobte Templates und Tools",
    "Lebenslanger Zugang zu allen Kursinhalten",
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-gradient-to-br from-white to-gray-50">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-custom-orange to-amber-500 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

          <DialogHeader className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <div>
                <Badge className="bg-white/20 text-white border-white/30 mb-2">🎯 Exklusives Angebot</Badge>
                <DialogTitle className="text-2xl font-bold text-white">Bereit für den nächsten Schritt?</DialogTitle>
              </div>
            </div>
            <p className="text-white/90 text-lg">
              Du hast deine Zahlen – jetzt lass uns dein Recruiting-Business zum Erfolg führen!
            </p>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Social Proof */}
          <div className="flex items-center justify-center gap-8 py-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm font-medium">4.9/5 Bewertung</p>
            </div>
          </div>

          {/* Benefits */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Gift className="h-5 w-5 text-custom-orange" />
              Das bekommst du im Kurs:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <a href="https://getexperts.academy/" target="_blank" rel="noopener noreferrer" className="block">
              <Button
                size="lg"
                className="w-full bg-custom-orange hover:bg-custom-orange-dark text-white text-lg py-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Rocket className="mr-2 h-5 w-5" />
                Jetzt Kurs starten & durchstarten!
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>

            <Button
              variant="outline"
              size="lg"
              onClick={onClose}
              className="w-full text-gray-600 hover:text-gray-800 border-gray-300 py-3 bg-transparent"
            >
              Später entscheiden
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex justify-center items-center gap-4 text-xs text-gray-500 pt-4 border-t">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>SSL-verschlüsselt</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              <span>Sofortiger Zugang</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>Persönlicher Support</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
