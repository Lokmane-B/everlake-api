"use client"

import type React from "react"
import { useEffect } from "react"
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
    // Fermer avec Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener("keydown", handleEscape)
            // Empêcher le scroll du body
            document.body.style.overflow = "hidden"
        }

        return () => {
            document.removeEventListener("keydown", handleEscape)
            document.body.style.overflow = "unset"
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">{icon}</div>
                        <h2 className="text-2xl font-bold text-white">{title}</h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="prose prose-invert max-w-none">
                        <p className="text-gray-300 text-lg leading-relaxed">{description}</p>

                        {/* Features list based on the title */}
                        <div className="mt-8 space-y-4">
                            {title === "Solutions globales" && (
                                <div className="grid gap-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-white font-semibold">Gestion centralisée</h4>
                                            <p className="text-gray-400 text-sm">Tableau de bord unifié pour tous vos outils et données</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-white font-semibold">Automatisation intelligente</h4>
                                            <p className="text-gray-400 text-sm">Workflows personnalisés pour optimiser vos processus</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-white font-semibold">Intégrations natives</h4>
                                            <p className="text-gray-400 text-sm">Connectez vos outils existants sans effort</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {title === "Sécurité avancée" && (
                                <div className="grid gap-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-white font-semibold">Chiffrement end-to-end</h4>
                                            <p className="text-gray-400 text-sm">Protection maximale de vos données sensibles</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-white font-semibold">Conformité RGPD</h4>
                                            <p className="text-gray-400 text-sm">Respect total des réglementations européennes</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-white font-semibold">Authentification multi-facteurs</h4>
                                            <p className="text-gray-400 text-sm">Sécurité renforcée pour tous vos accès</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {title === "Collaboration" && (
                                <div className="grid gap-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-white font-semibold">Temps réel</h4>
                                            <p className="text-gray-400 text-sm">Collaboration instantanée avec vos équipes</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-white font-semibold">Commentaires contextuels</h4>
                                            <p className="text-gray-400 text-sm">Feedback précis directement sur vos projets</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-white font-semibold">Gestion des permissions</h4>
                                            <p className="text-gray-400 text-sm">Contrôle granulaire des accès et droits</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* CTA Button */}
                        <div className="mt-8 pt-6 border-t border-white/10">
                            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                                En savoir plus
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
