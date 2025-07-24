"use client"

export function PartnersSection() {
    // Liste des partenaires avec leurs logos (utilisation de placeholder pour les logos)
    const partners = [
        { name: "Microsoft", logo: "/placeholder.svg?height=60&width=120&text=Microsoft&bg=ffffff&color=000000" },
        { name: "Google", logo: "/placeholder.svg?height=60&width=120&text=Google&bg=ffffff&color=000000" },
        { name: "Amazon", logo: "/placeholder.svg?height=60&width=120&text=Amazon&bg=ffffff&color=000000" },
        { name: "Apple", logo: "/placeholder.svg?height=60&width=120&text=Apple&bg=ffffff&color=000000" },
        { name: "Meta", logo: "/placeholder.svg?height=60&width=120&text=Meta&bg=ffffff&color=000000" },
        { name: "Netflix", logo: "/placeholder.svg?height=60&width=120&text=Netflix&bg=ffffff&color=000000" },
        { name: "Spotify", logo: "/placeholder.svg?height=60&width=120&text=Spotify&bg=ffffff&color=000000" },
        { name: "Adobe", logo: "/placeholder.svg?height=60&width=120&text=Adobe&bg=ffffff&color=000000" },
        { name: "Salesforce", logo: "/placeholder.svg?height=60&width=120&text=Salesforce&bg=ffffff&color=000000" },
        { name: "IBM", logo: "/placeholder.svg?height=60&width=120&text=IBM&bg=ffffff&color=000000" },
        { name: "Oracle", logo: "/placeholder.svg?height=60&width=120&text=Oracle&bg=ffffff&color=000000" },
        { name: "Tesla", logo: "/placeholder.svg?height=60&width=120&text=Tesla&bg=ffffff&color=000000" },
    ]

    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/20 border-t border-slate-800">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Nos partenaires</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Ils nous font confiance pour accompagner leur transactions
                    </p>
                </div>

                {/* Container avec overflow hidden pour l'effet de défilement */}
                <div className="relative overflow-hidden">
                    {/* Gradients de fade sur les côtés */}
                    <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent z-10 pointer-events-none" />

                    {/* Conteneur de défilement */}
                    <div className="partners-scroll flex items-center space-x-12 py-8">
                        {/* Premier set de logos */}
                        {partners.map((partner, index) => (
                            <div
                                key={`first-${index}`}
                                className="flex-shrink-0 flex items-center justify-center w-32 h-16 bg-white/5 rounded-lg border border-slate-800 hover:bg-white/10 transition-all duration-300 group"
                            >
                                <img
                                    src={partner.logo || "/placeholder.svg"}
                                    alt={`Logo ${partner.name}`}
                                    className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100"
                                />
                            </div>
                        ))}

                        {/* Duplication pour l'effet de boucle infinie */}
                        {partners.map((partner, index) => (
                            <div
                                key={`second-${index}`}
                                className="flex-shrink-0 flex items-center justify-center w-32 h-16 bg-white/5 rounded-lg border border-slate-800 hover:bg-white/10 transition-all duration-300 group"
                            >
                                <img
                                    src={partner.logo || "/placeholder.svg"}
                                    alt={`Logo ${partner.name}`}
                                    className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
