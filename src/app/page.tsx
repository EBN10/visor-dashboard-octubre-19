import Link from "next/link"
import { Button } from "~/components/ui/button"
import { Map, ArrowRight, Database, Shield } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="#">
          <Map className="h-6 w-6 mr-2" />
          <span className="font-bold">INDEC Visor</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/mapa">
            Mapa
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/admin">
            Admin
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Infraestructura de Datos Espaciales
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Plataforma integral para la gestión, análisis y visualización de datos geoespaciales.
                  Actualmente en versión Beta.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/mapa">
                  <Button className="h-11 px-8">
                    Explorar Mapa <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button variant="outline" className="h-11 px-8">
                    Panel de Administración
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:px-10 md:gap-16 md:grid-cols-3">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
                  <Map className="h-8 w-8 mb-2 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Visualización Avanzada</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Soporte para capas vectoriales, WMS y XYZ con renderizado de alto rendimiento.
                </p>
              </div>
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
                  <Database className="h-8 w-8 mb-2 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Gestión de Datos</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Importación directa desde QGIS (GeoJSON) y administración flexible de capas y grupos.
                </p>
              </div>
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
                  <Shield className="h-8 w-8 mb-2 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Seguro y Escalable</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Autenticación robusta y arquitectura diseñada para crecer con sus datos.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 Dirección de Estadísticas y Censos. Todos los derechos reservados.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Términos de Servicio
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacidad
          </Link>
        </nav>
      </footer>
    </div>
  )
}