import { ArrowRight, Zap, Rocket, Shield, Code } from "lucide-react"
import { Button } from "../src/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "../src/components/ui/card"

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Navigation */}
            <nav className="border-b border-white/10 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-2">
                            <Zap className="h-8 w-8 text-purple-400" />
                            <span className="text-xl font-bold text-white">ViteApp</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                                Fonctionnalités
                            </a>
                            <a href="#about" className="text-gray-300 hover:text-white transition-colors">
                                À propos
                            </a>
                            <a href="#contact" className="text-gray-300 hover:text-white transition-colors">
                                Contact
                            </a>
                            <Button
                                variant="outline"
                                className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white bg-transparent"
                            >
                                Connexion
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-8">
                        <Rocket className="w-4 h-4 mr-2" />
                        Propulsé par Vite
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                        L'outil de build
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              pour le Web moderne
            </span>
                    </h1>

                    <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                        Créez des applications web ultra-rapides avec notre template optimisé pour Vite. Développement instantané,
                        build optimisé, expérience développeur exceptionnelle.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                            Commencer maintenant
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                        >
                            Voir la documentation
                        </Button>
                    </div>
                </div>

                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Pourquoi choisir ce template ?</h2>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Tout ce dont vous avez besoin pour créer des applications web modernes et performantes
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                            <CardHeader>
                                <Zap className="h-12 w-12 text-purple-400 mb-4" />
                                <CardTitle className="text-white">Ultra-rapide</CardTitle>
                                <CardDescription className="text-gray-300">
                                    Hot Module Replacement instantané et builds optimisés pour une expérience de développement fluide
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                            <CardHeader>
                                <Code className="h-12 w-12 text-purple-400 mb-4" />
                                <CardTitle className="text-white">TypeScript Ready</CardTitle>
                                <CardDescription className="text-gray-300">
                                    Support TypeScript natif avec auto-complétion et vérification de types en temps réel
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                            <CardHeader>
                                <Shield className="h-12 w-12 text-purple-400 mb-4" />
                                <CardTitle className="text-white">Sécurisé</CardTitle>
                                <CardDescription className="text-gray-300">
                                    Bonnes pratiques de sécurité intégrées et dépendances régulièrement mises à jour
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
                            <div className="text-4xl font-bold text-purple-400 mb-2">10x</div>
                            <div className="text-gray-300">Plus rapide que les outils traditionnels</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-purple-400 mb-2">{"<1s"}</div>
                            <div className="text-gray-300">Temps de démarrage du serveur de dev</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-purple-400 mb-2">100%</div>
                            <div className="text-gray-300">Compatible avec l'écosystème moderne</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Prêt à commencer votre projet ?</h2>
                    <p className="text-xl text-gray-300 mb-8">
                        Téléchargez ce template et lancez votre application en quelques minutes
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                            Télécharger le template
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                        >
                            Voir sur GitHub
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                            <Zap className="h-6 w-6 text-purple-400" />
                            <span className="text-lg font-semibold text-white">ViteApp</span>
                        </div>
                        <div className="text-gray-400 text-sm">© 2024 ViteApp. Créé avec ❤️ et Vite.</div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
