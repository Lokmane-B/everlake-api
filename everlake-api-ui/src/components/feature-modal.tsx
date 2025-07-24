"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "./ui/button"

interface FeatureModalProps {
    isOpen: boolean
    onClose: () => void
    icon: React.ReactNode
    title: string
    description: string
}

export function FeatureModal({ isOpen, onClose, icon, title, description }: FeatureModalProps) {
    const [isClosing, setIsClosing] = useState(false)
    const [shouldRender, setShouldRender] = useState(false)

    // Gestion de l'ouverture/fermeture
    useEffect(() => {
        if (isOpen) {
            setShouldRender(true)
            setIsClosing(false)
        }
    }, [isOpen])

    const handleClose = () => {
        setIsClosing(true)
        setTimeout(() => {
            setShouldRender(false)
            setIsClosing(false)
            onClose()
        }, 250) // Durée de l'animation de sortie
    }

    // Fermer avec Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                handleClose()
            }
        }

        if (isOpen) {
            document.addEventListener("keydown", handleEscape)
            document.body.style.overflow = "hidden"
        }

        return () => {
            document.removeEventListener("keydown", handleEscape)
            document.body.style.overflow = "unset"
        }
    }, [isOpen])

    if (!shouldRender) return null

    const getFeatureDetails = (title: string) => {
        const features = {
            "Solutions globales": [
                { title: "Gestion centralisée", desc: "Tableau de bord unifié pour tous vos outils et données" },
                { title: "Automatisation intelligente", desc: "Workflows personnalisés pour optimiser vos processus" },
                { title: "Intégrations natives", desc: "Connectez vos outils existants sans effort" },
            ],
            "Sécurité avancée": [
                { title: "Chiffrement end-to-end", desc: "Protection maximale de vos données sensibles" },
                { title: "Conformité RGPD", desc: "Respect total des réglementations européennes" },
                { title: "Authentification multi-facteurs", desc: "Sécurité renforcée pour tous vos accès" },
            ],
            Collaboration: [
                { title: "Temps réel", desc: "Collaboration instantanée avec vos équipes" },
                { title: "Commentaires contextuels", desc: "Feedback précis directement sur vos projets" },
                { title: "Gestion des permissions", desc: "Contrôle granulaire des accès et droits" },
            ],
        }
        return features[title as keyof typeof features] || []
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className={`absolute inset-0 bg-black/70 backdrop-blur-sm ${isClosing ? "overlay-exit" : "overlay-enter"}`}
                onClick={handleClose}
            />

            {/* Modal Content */}
            <div
                className={`relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full ${
                    isClosing ? "modal-exit" : "modal-enter"
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">{icon}</div>
                        <h2 className="text-2xl font-bold text-white">{title}</h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
                        className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all duration-200 hover:scale-110"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className={`p-6 ${isClosing ? "" : "content-slide-in"}`}>
                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-300 text-lg leading-relaxed mb-8">{description}</p>

                        {/* Features list */}
                        <div className="space-y-4">
                            {getFeatureDetails(title).map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-start space-x-3"
                                    style={{
                                        animationDelay: isClosing ? "0s" : `${0.2 + index * 0.1}s`,
                                    }}
                                >
                                    <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0" />
                                    <div>
                                        <h4 className="text-white font-semibold">{item.title}</h4>
                                        <p className="text-slate-400 text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTA Button */}
                        <div className="mt-8 pt-6 border-t border-slate-800">
                            <Button className="bg-white text-slate-950 hover:bg-slate-100 font-semibold hover:scale-105 transition-transform duration-200">
                                En savoir plus
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
