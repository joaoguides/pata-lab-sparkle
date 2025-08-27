import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Facebook, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin,
  CreditCard,
  Shield,
  Truck
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted mt-16">
      <div className="container mx-auto px-4 py-12">
        {/* Newsletter */}
        <div className="bg-primary text-primary-foreground rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">
                Receba ofertas exclusivas
              </h3>
              <p className="text-sm opacity-90">
                Cupom de 15% OFF na primeira compra + novidades em primeira mão
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Input
                placeholder="Seu e-mail"
                className="bg-background text-foreground"
              />
              <Button variant="secondary">
                Cadastrar
              </Button>
            </div>
          </div>
        </div>

        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold text-primary">🐾 Pata Lab</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Tudo para seu melhor amigo, entregue com carinho. 
              A maior variedade de produtos pet com os melhores preços.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categorias</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Alimentos</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Brinquedos</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Acessórios</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Higiene</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Camas e Capas</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Atendimento</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Central de Ajuda</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Trocas e Devoluções</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Política de Frete</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Rastreamento</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Contato</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">(11) 99999-9999</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">contato@patalab.com.br</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">São Paulo - SP</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Compra Segura</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            <span>PIX e Cartão</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="h-4 w-4" />
            <span>Entrega Nacional</span>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>
            © 2024 Pata Lab. Todos os direitos reservados.
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">Privacidade</a>
            <a href="#" className="hover:text-foreground">Termos de Uso</a>
            <a href="#" className="hover:text-foreground">LGPD</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;