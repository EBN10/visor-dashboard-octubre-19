"use client"
import ArbolCapas from "~/components/comp-598"
import { Mapa } from "~/components/mapa/mapa"
import MenuUsuario from "~/components/side/menu-usuario"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar"
import "leaflet/dist/leaflet.css"
import { LayersProvider } from "~/components/layers/provider"
import { QueryProvider } from "~/components/query/QueryProvider"

function App() {
  return (
    <SidebarProvider>
      <QueryProvider>
        <LayersProvider>
          <Sidebar>
          <SidebarHeader>
            <div className="flex w-full gap-1.5 hover:bg-gray-400/10 rounded-2xl items-center p-3">
              <img
                src="/logo-dir.estadisticasycensos.png"
                alt="logo direccion general de estadisticas y censo"
                className="w-10"
              />
              <p className="text-sm">
                SIG Dirección de Estadísticas y Censos
              </p>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <ArbolCapas />
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <MenuUsuario />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
          <SidebarInset>
          <div className="flex gap-2 p-3">
            <SidebarTrigger />
            <h1 className="text-lg font-bold w-full text-center">
              Infraestrucutras de Datos Espaciales
            </h1>
          </div>
          <Mapa />
          </SidebarInset>
        </LayersProvider>
      </QueryProvider>
    </SidebarProvider>
  )
}

export default App