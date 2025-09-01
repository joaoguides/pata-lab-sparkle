import { Link } from "react-router-dom";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Facebook, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin,
  CreditCard,
  Shield,
  Truck,
  Youtube
} from "lucide-react";
import { siteConfig } from "@/config/site";

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
          {/* Loja */}
          <div>
            <h4 className="font-semibold mb-4">Loja</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/categoria/caes" className="text-muted-foreground hover:text-foreground">Cães</Link></li>
              <li><Link to="/categoria/gatos" className="text-muted-foreground hover:text-foreground">Gatos</Link></li>
              <li><Link to="/categoria/brinquedos" className="text-muted-foreground hover:text-foreground">Brinquedos</Link></li>
              <li><Link to="/categoria/higiene" className="text-muted-foreground hover:text-foreground">Higiene</Link></li>
              <li><Link to="/categoria/camas" className="text-muted-foreground hover:text-foreground">Camas</Link></li>
            </ul>
          </div>

          {/* Ajuda */}
          <div>
            <h4 className="font-semibold mb-4">Ajuda</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Entrega</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Trocas e Devoluções</a></li>
              <li><a href={`https://wa.me/${siteConfig.company.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">Suporte WhatsApp</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Rastreamento</a></li>
            </ul>
          </div>

          {/* Institucional */}
          <div>
            <h4 className="font-semibold mb-4">Institucional</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Sobre</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Contato</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Carreiras</a></li>
            </ul>
          </div>

          {/* Siga-nos */}
          <div>
            <h4 className="font-semibold mb-4">Siga-nos</h4>
            <div className="flex gap-2 mb-4">
              <Button variant="ghost" size="icon" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <Youtube className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <Facebook className="h-4 w-4" />
                </a>
              </Button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{siteConfig.company.whatsapp}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">contato@patalab.com.br</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Payment seals */}
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
            © 2024 {siteConfig.company.name} — CNPJ {siteConfig.company.cnpj} • Todos os direitos reservados.
          </div>
          <div className="flex gap-4">
            <Link to="/privacidade" className="hover:text-foreground">Política de Privacidade</Link>
            <Link to="/termos" className="hover:text-foreground">Termos de Uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;