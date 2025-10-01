import { ArrowRight, Shield, Database, Globe, Users } from "lucide-react"
import { Button } from "./components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { Navigation } from "./components/navigation"

export default function App() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
            <Navigation />

            {/* Hero Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm mb-8">
                        <Database className="w-4 h-4 mr-2" />
                        Plateforme Everlake
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                        La solution complète
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              pour votre entreprise
            </span>
                    </h1>

                    <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                        Everlake vous accompagne dans votre transformation digitale avec des solutions innovantes, sécurisées et
                        évolutives adaptées à vos besoins métier.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        >
                            Découvrir nos solutions
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                        >
                            Demander une démo
                        </Button>
                    </div>
                </div>

                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Pourquoi choisir Everlake ?</h2>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Une plateforme complète qui s'adapte à votre croissance et optimise vos performances
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                            <CardHeader>
                                <Globe className="h-12 w-12 text-blue-400 mb-4" />
                                <CardTitle className="text-white">Solutions globales</CardTitle>
                                <CardDescription className="text-gray-300">
                                    Des outils intégrés pour gérer tous les aspects de votre activité depuis une seule plateforme
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                            <CardHeader>
                                <Shield className="h-12 w-12 text-blue-400 mb-4" />
                                <CardTitle className="text-white">Sécurité avancée</CardTitle>
                                <CardDescription className="text-gray-300">
                                    Protection de niveau entreprise avec chiffrement end-to-end et conformité aux standards internationaux
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                            <CardHeader>
                                <Users className="h-12 w-12 text-blue-400 mb-4" />
                                <CardTitle className="text-white">Collaboration</CardTitle>
                                <CardDescription className="text-gray-300">
                                    Outils collaboratifs avancés pour optimiser le travail d'équipe et la productivité
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-blue-400 mb-2">500+</div>
                            <div className="text-gray-300">Entreprises nous font confiance</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-400 mb-2">99.9%</div>
                            <div className="text-gray-300">Disponibilité garantie</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-400 mb-2">24/7</div>
                            <div className="text-gray-300">Support technique</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Prêt à transformer votre entreprise ?</h2>
                    <p className="text-xl text-gray-300 mb-8">
                        Rejoignez les centaines d'entreprises qui ont choisi Everlake pour accélérer leur croissance
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        >
                            Commencer gratuitement
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                        >
                            Contacter un expert
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                            <div className="h-6 w-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                                <span className="text-white font-bold text-xs">E</span>
                            </div>
                            <span className="text-lg font-semibold text-white">Everlake</span>
                        </div>
                        <div className="text-gray-400 text-sm">© 2024 Everlake. Tous droits réservés.</div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
