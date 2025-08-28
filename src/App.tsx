import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { CartProvider } from "./context/CartContext";
import CartDrawer from "./components/cart/CartDrawer";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Entrar from "./pages/Entrar";
import CriarConta from "./pages/CriarConta";
import Produto from "./pages/Produto";
import Checkout from "./pages/Checkout";
import MeusPedidos from "./pages/MeusPedidos";
import Enderecos from "./pages/Enderecos";
import RequireAuth from "./components/auth/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CartProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/entrar" element={<Entrar />} />
              <Route path="/criar-conta" element={<CriarConta />} />
              <Route path="/produto/:slug" element={<Produto />} />
              <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
              <Route path="/meus-pedidos" element={<RequireAuth><MeusPedidos /></RequireAuth>} />
              <Route path="/enderecos" element={<RequireAuth><Enderecos /></RequireAuth>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <CartDrawer />
          </CartProvider>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
