import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Privacidade() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Política de Privacidade - Pata Lab</title>
        <meta name="description" content="Política de Privacidade da Pata Lab. Saiba como coletamos, usamos e protegemos seus dados pessoais." />
      </Helmet>

      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Política de Privacidade</h1>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Informações que Coletamos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Coletamos informações que você nos fornece diretamente, como nome, e-mail, endereço e dados de pagamento ao criar uma conta ou fazer uma compra.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Como Usamos suas Informações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Utilizamos suas informações para processar pedidos, melhorar nossos serviços, enviar comunicações importantes e oferecer suporte ao cliente.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Compartilhamento de Dados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Não vendemos ou alugamos suas informações pessoais. Compartilhamos dados apenas quando necessário para processar transações ou cumprir obrigações legais.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Segurança</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não autorizado, alteração ou destruição.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Contato</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Para dúvidas sobre esta política, entre em contato conosco através do e-mail: contato@patalab.com.br
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}