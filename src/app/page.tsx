"use client"

import Link from "next/link"
import { Button } from "~/components/ui/button"
import { Map, ArrowRight, Database, Shield, Layers, Globe, Zap, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

// Animated background orbs
// Map Background Pattern
function MapBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]" />
      <div className="absolute right-0 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-slate-400 opacity-10 blur-[100px]" />
    </div>
  )
}

// Stats counter component
function StatsCounter() {
  const [counts, setCounts] = useState({ datasets: 0, users: 0, layers: 0 })

  useEffect(() => {
    const targets = { datasets: 500, users: 1200, layers: 250 }
    const duration = 2000
    const steps = 60
    const stepDuration = duration / steps

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      setCounts({
        datasets: Math.floor(targets.datasets * progress),
        users: Math.floor(targets.users * progress),
        layers: Math.floor(targets.layers * progress),
      })
      if (currentStep >= steps) clearInterval(interval)
    }, stepDuration)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
      {[
        { label: "Datasets", value: counts.datasets },
        { label: "Usuarios Activos", value: counts.users },
        { label: "Capas Disponibles", value: counts.layers },
      ].map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="text-center"
        >
          <div className="text-4xl font-bold text-blue-600">
            {stat.value}+
          </div>
          <div className="text-sm text-slate-500 mt-2 font-medium">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  )
}

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
      },
    },
  }

  const features = [
    {
      icon: Layers,
      title: "Visualización Avanzada",
      desc: "Soporte para capas vectoriales, WMS y XYZ con renderizado de alto rendimiento optimizado para grandes volúmenes de datos.",
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      icon: Database,
      title: "Gestión de Datos",
      desc: "Importación directa desde QGIS (GeoJSON) y administración flexible de capas y grupos con jerarquías personalizables.",
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      icon: Shield,
      title: "Seguridad Robusta",
      desc: "Sistema de autenticación y autorización granular para proteger la información sensible y gestionar accesos.",
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      icon: Globe,
      title: "Interoperabilidad",
      desc: "Estándares OGC para asegurar la compatibilidad con otras infraestructuras de datos espaciales y herramientas GIS.",
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      icon: TrendingUp,
      title: "Análisis en Tiempo Real",
      desc: "Herramientas de filtrado y análisis espacial para obtener insights inmediatos sobre sus datos.",
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
    {
      icon: Zap,
      title: "Rendimiento Extremo",
      desc: "Optimización de velocidad y eficiencia para manejar millones de registros sin comprometer la experiencia del usuario.",
      color: "text-amber-600",
      bg: "bg-amber-100",
    }
  ]

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 overflow-hidden">
      <MapBackground />

      {/* Header */}
      <header className="px-4 lg:px-6 h-20 flex items-center border-b border-slate-200 backdrop-blur-xl sticky top-0 z-50 bg-white/80">
        <Link className="flex items-center justify-center group" href="#">
          <div className="relative bg-blue-600 px-2 py-2 rounded-lg group-hover:bg-blue-700 transition-colors">
            <Map className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight ml-3 text-slate-900">
            INDEC Visor
          </span>
        </Link>
        <nav className="ml-auto flex gap-8">
          <Link className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors relative group" href="/mapa">
            Mapa
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
          </Link>
          <Link className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors relative group" href="/admin">
            Admin
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
          </Link>
        </nav>
      </header>

      <main className="flex-1 relative">
        {/* Hero Section */}
        <section className="w-full py-24 md:py-40 lg:py-48 relative overflow-hidden bg-[url('/fondo-mapa.jpg')] bg-cover bg-center">
          <div className="absolute inset-0 bg-white/70 z-0" />
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <motion.div
              className="flex flex-col items-center space-y-10 text-center"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {/* Badge */}
              <motion.div variants={itemVariants}>
                <div className="inline-block rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 font-medium">
                  Versión Beta 1.0 - Ahora en Vivo
                </div>
              </motion.div>

              {/* Main Title */}
              <motion.div className="space-y-6 max-w-5xl" variants={itemVariants}>
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-tight text-slate-900">
                  Infraestructura
                  <br />
                  <span className="text-blue-600">
                    de Datos Espaciales
                  </span>
                </h1>
                <p className="mx-auto max-w-3xl text-lg sm:text-xl md:text-2xl text-slate-600 leading-relaxed font-light">
                  La plataforma más potente para gestionar, analizar y visualizar datos geoespaciales con precisión cartográfica de nivel profesional.
                </p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div className="flex flex-col sm:flex-row gap-6 justify-center pt-4" variants={itemVariants}>
                <Link href="/mapa">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      size="lg"
                      className="h-14 px-10 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg shadow-blue-900/20 transition-all duration-300"
                    >
                      Explorar Mapa <ArrowRight className="ml-3 h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/admin">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="secondary"
                      size="lg"
                      className="h-14 px-10 text-base font-semibold border-2 border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300"
                    >
                      Panel Admin
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-20 relative overflow-hidden border-y border-slate-200 bg-white/50">
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <StatsCounter />
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-24 md:py-32 relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-6 text-slate-900">
                Potencia y Flexibilidad
              </h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                Herramientas avanzadas diseñadas para profesionales que requieren precisión, rendimiento y escalabilidad.
              </p>
            </motion.div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {/* Icon container */}
                  <div
                    className={`mb-6 inline-block rounded-xl ${feature.bg} p-4 ${feature.color} shadow-sm`}
                  >
                    <feature.icon className="h-8 w-8" />
                  </div>

                  {/* Content */}
                  <h3 className="mb-3 text-xl font-bold text-slate-900">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-24 relative overflow-hidden border-t border-slate-200 bg-white">
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-6 text-slate-900">
                Comienza Ahora
              </h2>
              <p className="text-slate-600 text-lg mb-10">
                Accede a la plataforma y descubre el poder de los datos geoespaciales en tiempo real.
              </p>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href="/mapa">
                  <Button
                    size="lg"
                    className="h-14 px-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg shadow-blue-900/20 transition-all duration-300"
                  >
                    Acceder a la Plataforma <ArrowRight className="ml-3 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-6 sm:flex-row py-12 w-full shrink-0 items-center px-4 md:px-6 border-t border-slate-200 bg-slate-50">
        <p className="text-sm text-slate-500">
          © 2024 Dirección de Estadísticas y Censos. Todos los derechos reservados.
        </p>
        <nav className="sm:ml-auto flex gap-6">
          <Link className="text-sm text-slate-500 hover:text-blue-600 transition-colors" href="#">
            Términos de Servicio
          </Link>
          <Link className="text-sm text-slate-500 hover:text-blue-600 transition-colors" href="#">
            Privacidad
          </Link>
        </nav>
      </footer>
    </div>
  )
}