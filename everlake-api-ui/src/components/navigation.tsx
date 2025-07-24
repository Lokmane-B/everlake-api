"use client"

import { useState } from "react"
import { Menu, X, ChevronDown } from "lucide-react"
import { Button } from "./ui/button"

const menuItems = [
    {
        name: "Entreprise",
        href: "#entreprise",
        submenu: ["À propos", "Équipe", "Carrières", "Contact"],
    },
    {
        name: "Ressources",
        href: "#ressources",
        submenu: ["Documentation", "Guides", "API", "Support"],
    },
    {
        name: "Navigation principale",
        href: "#navigation",
        submenu: ["Accueil", "Produits", "Services", "Solutions"],
    },
    {
        name: "Nos offres",
        href: "#offres",
        submenu: ["Starter", "Professional", "Enterprise", "Custom"],
    },
    {
        name: "Actualités",
        href: "#actualites",
        submenu: ["Blog", "Communiqués", "Événements", "Newsletter"],
    },
    {
        name: "Abonnements",
        href: "#abonnements",
        submenu: ["Plans", "Tarifs", "Essai gratuit", "Comparaison"],
    },
]

export function Navigation() {
    const [isOpen, setIsOpen] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

    return (
        <nav className="border-b border-slate-800 backdrop-blur-sm bg-slate-950/95 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                            <span className="text-slate-950 font-bold text-sm">E</span>
                        </div>
                        <span className="text-xl font-bold text-white">Everlake</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center space-x-1">
                        {menuItems.map((item) => (
                            <div
                                key={item.name}
                                className="relative group"
                                onMouseEnter={() => setActiveDropdown(item.name)}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <Button variant="ghost" className="text-slate-400 hover:text-white flex items-center space-x-1">
                                    <span>{item.name}</span>
                                    <ChevronDown className="h-3 w-3" />
                                </Button>

                                {/* Dropdown */}
                                {activeDropdown === item.name && (
                                    <div className="absolute top-full left-0 mt-1 w-48 bg-slate-900 border border-slate-700 rounded-md shadow-lg py-1 z-50">
                                        {item.submenu.map((subItem) => (
                                            <a
                                                key={subItem}
                                                href="#"
                                                className="block px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                            >
                                                {subItem}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="hidden lg:flex items-center space-x-4">
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-700 text-slate-400 hover:bg-slate-800 bg-transparent"
                        >
                            Connexion
                        </Button>
                        <Button size="sm" className="bg-white text-slate-950 hover:bg-slate-100 font-semibold">
                            Commencer
                        </Button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="lg:hidden">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-slate-400 hover:text-white"
                        >
                            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="lg:hidden border-t border-slate-800 py-4">
                        <div className="space-y-2">
                            {menuItems.map((item) => (
                                <div key={item.name}>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-slate-400 hover:text-white"
                                        onClick={() => setActiveDropdown(activeDropdown === item.name ? null : item.name)}
                                    >
                                        <span>{item.name}</span>
                                        <ChevronDown
                                            className={`h-3 w-3 ml-auto transition-transform ${
                                                activeDropdown === item.name ? "rotate-180" : ""
                                            }`}
                                        />
                                    </Button>

                                    {activeDropdown === item.name && (
                                        <div className="ml-4 space-y-1">
                                            {item.submenu.map((subItem) => (
                                                <a
                                                    key={subItem}
                                                    href="#"
                                                    className="block py-2 px-4 text-sm text-slate-400 hover:text-white transition-colors"
                                                >
                                                    {subItem}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="pt-4 space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full bg-transparent border-slate-700 text-slate-400 hover:bg-slate-800"
                                >
                                    Connexion
                                </Button>
                                <Button className="w-full bg-white text-slate-950 hover:bg-slate-100 font-semibold">Commencer</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
