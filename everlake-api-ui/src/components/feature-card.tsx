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
    const [isPressed, setIsPressed] = useState(false)

    const handleCardClick = () => {
        setIsPressed(true)
        setTimeout(() => {
            setIsPressed(false)
            setIsModalOpen(true)
        }, 150)
    }

    const handleButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        handleCardClick()
    }

    return (
        <>
            <Card
                className={`bg-slate-900/50 border-slate-800 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800/50 hover:border-slate-700 group cursor-pointer hover:scale-105 ${
                    isPressed ? "scale-110" : ""
                }`}
                onClick={handleCardClick}
                style={{
                    transform: isPressed ? "scale(1.1)" : "",
                    transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                <CardHeader className="relative">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div
                                className={`mb-4 transition-all duration-300 group-hover:scale-110 ${isPressed ? "icon-pulse" : ""}`}
                            >
                                {icon}
                            </div>
                            <CardTitle className="text-white text-xl group-hover:text-slate-100 transition-colors duration-300">
                                {title}
                            </CardTitle>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleButtonClick}
                            className="text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200 flex-shrink-0 ml-4 opacity-70 group-hover:opacity-100 hover:scale-110 active:scale-95"
                        >
                            <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
                        </Button>
                    </div>

                    {/* Indicateur visuel */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-800/0 via-slate-700/0 to-slate-800/0 group-hover:from-slate-800/20 group-hover:via-slate-700/20 group-hover:to-slate-800/20 transition-all duration-500" />
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
