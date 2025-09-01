import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Termos() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Termos de Uso - Pata Lab</title>
        <meta name="description" content="Termos de Uso da Pata Lab. Conheça os termos e condições para uso de nossos serviços." />
      </Helmet>

      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Termos de Uso</h1>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Aceitação dos Termos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Ao acessar e usar nosso site, você aceita e concorda em cumprir os termos e condições estabelecidos neste documento.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Uso do Site</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Você se compromete a usar nosso site apenas para fins legítimos e de acordo com todas as leis aplicáveis.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Produtos e Preços</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Todos os preços estão sujeitos a alterações sem aviso prévio. Nos reservamos o direito de modificar ou descontinuar produtos a qualquer momento.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Política de Devolução</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Aceitamos devoluções em até 7 dias após o recebimento do produto, desde que esteja em sua embalagem original e em perfeitas condições.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Limitação de Responsabilidade</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Nossa responsabilidade está limitada ao valor do produto adquirido. Não nos responsabilizamos por danos indiretos ou consequentes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Contato</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Para questões relacionadas aos termos de uso, entre em contato: contato@patalab.com.br
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