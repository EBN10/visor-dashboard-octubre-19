"use client";
import ArbolCapas from "~/components/comp-598";
import { Mapa } from "~/components/mapa/mapa";
import Image from "next/image";
import MenuUsuario from "~/components/side/menu-usuario";
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
} from "~/components/ui/sidebar";
import "leaflet/dist/leaflet.css";
import { LayersProvider } from "~/components/layers/provider";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

function App() {
  return (
    <SidebarProvider>
      <LayersProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex w-full items-center gap-1.5 rounded-2xl p-3 hover:bg-gray-400/10">
              <Image
                src="/logo-dir.estadisticasycensos.png"
                alt="logo direccion general de estadisticas y censo"
                width={300}
                height={100}
                className="w-10"
              />
              <p className="text-sm">SIG Dirección de Estadísticas y Censos</p>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <ArbolCapas />
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SignedOut>
                  <div className="flex items-center gap-7">
                    <SignInButton>
                      <button className="text-ceramic-white h-5 cursor-pointer rounded-full bg-[#503987] px-4 text-sm font-medium sm:h-12 sm:px-5 sm:text-base">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton>
                      <button className="text-ceramic-white h-5 cursor-pointer rounded-full bg-[#503987] px-4 text-sm font-medium sm:h-12 sm:px-5 sm:text-base">
                        Sign Up
                      </button>
                    </SignUpButton>
                  </div>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="flex gap-2 p-3">
            <SidebarTrigger />
            <h1 className="w-full text-center text-lg font-bold">
              Infraestrucutras de Datos Espaciales
            </h1>
          </div>
          <Mapa />
        </SidebarInset>
      </LayersProvider>
    </SidebarProvider>
  );
}

export default App;
