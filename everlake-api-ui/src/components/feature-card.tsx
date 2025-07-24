"use client"

import type React from "react"
import { useState } from "react"
import { Plus } from "lucide-react"
import { Card, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { FeatureModal } from "./feature-modal"

interface FeatureCardProps {
    icon: React.ReactNode
    title: string
    description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20 group cursor-pointer">
                <CardHeader className="relative">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="mb-4 transition-transform duration-300 group-hover:scale-110">{icon}</div>
                            <CardTitle className="text-white text-xl">{title}</CardTitle>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsModalOpen(true)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all duration-200 flex-shrink-0 ml-4 opacity-70 group-hover:opacity-100"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            <FeatureModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                icon={icon}
                title={title}
                description={description}
            />
        </>
    )
}
