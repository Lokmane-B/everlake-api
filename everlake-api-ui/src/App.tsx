import { ArrowRight, Shield, Database, Globe, Users } from "lucide-react"
import { Button } from "./components/ui/button"
import { Navigation } from "./components/navigation"
import { FeatureCard } from "./components/feature-card"
import { PartnersSection } from "./components/partners-section"

export default function App() {
    return (
        <div className="min-h-screen bg-slate-950">
            <Navigation />

            {/* Hero Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-slate-300 text-sm mb-8">
                        <Database className="w-4 h-4 mr-2" />
                        Plateforme Everlake
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                        La solution complète
                        <span className="block text-white mt-2">pour votre entreprise</span>
                    </h1>

                    <p className="text-xl text-slate-400 mb-8 max-w-3xl mx-auto">
                        Everlake vous accompagne dans votre transformation digitale avec des solutions innovantes, sécurisées et
                        évolutives adaptées à vos besoins métier.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="bg-white text-slate-950 hover:bg-slate-100 font-semibold">
                            Découvrir nos solutions
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
                        >
                            Demander une démo
                        </Button>
                    </div>
                </div>

                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-800 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-700 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Pourquoi choisir Everlake ?</h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Une plateforme complète qui s'adapte à votre croissance et optimise vos performances
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Globe className="h-12 w-12 text-white" />}
                            title="Solutions globales"
                            description="Des outils intégrés pour gérer tous les aspects de votre activité depuis une seule plateforme. Centralisez vos données, automatisez vos processus et optimisez votre productivité avec notre suite complète d'applications métier."
                        />

                        <FeatureCard
                            icon={<Shield className="h-12 w-12 text-white" />}
                            title="Sécurité avancée"
                            description="Protection de niveau entreprise avec chiffrement end-to-end et conformité aux standards internationaux. Vos données sont protégées par des protocoles de sécurité militaires et des audits réguliers garantissent votre conformité."
                        />

                        <FeatureCard
                            icon={<Users className="h-12 w-12 text-white" />}
                            title="Collaboration"
                            description="Outils collaboratifs avancés pour optimiser le travail d'équipe et la productivité. Partagez, commentez, et travaillez ensemble en temps réel avec des fonctionnalités de communication intégrées et des workflows personnalisables."
                        />
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">500+</div>
                            <div className="text-slate-400">Entreprises nous font confiance</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">99.9%</div>
                            <div className="text-slate-400">Disponibilité garantie</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">24/7</div>
                            <div className="text-slate-400">Support technique</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners Section */}
            <PartnersSection />

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Prêt à transformer votre entreprise ?</h2>
                    <p className="text-xl text-slate-400 mb-8">
                        Rejoignez les centaines d'entreprises qui ont choisi Everlake pour accélérer leur croissance
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="bg-white text-slate-950 hover:bg-slate-100 font-semibold">
                            Commencer gratuitement
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
                        >
                            Contacter un expert
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                            <div className="h-6 w-6 bg-white rounded flex items-center justify-center">
                                <span className="text-slate-950 font-bold text-xs">E</span>
                            </div>
                            <span className="text-lg font-semibold text-white">Everlake</span>
                        </div>
                        <div className="text-slate-500 text-sm">© 2024 Everlake. Tous droits réservés.</div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
