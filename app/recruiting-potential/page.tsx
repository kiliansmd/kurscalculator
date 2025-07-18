"use client"

import { CompactRecruitingChart } from "@/components/compact-recruiting-chart"

export default function RecruitingPotentialPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="container mx-auto max-w-4xl">
        <CompactRecruitingChart />
      </div>
    </div>
  )
}
