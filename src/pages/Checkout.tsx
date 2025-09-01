import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProgressBar from "@/components/checkout/ProgressBar";
import OrderSummary from "@/components/checkout/OrderSummary";
import AddAddressDialog from "@/components/checkout/AddAddressDialog";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { ensureActiveCart } from "@/lib/cart";
import { runCheckout } from "@/lib/checkout";
import { useToast } from "@/hooks/use-toast";
import { track } from "@/lib/analytics";
import { useNavigate } from "react-router-dom";
import { CreditCard, MapPin, Package, X, CheckCircle } from "lucide-react";

interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  cep: string;
  is_default: boolean;
}

interface CartItem {
  id: string;
  variant_id: string;
  quantity: number;
  price: number;
  variants: {
    name: string;
    price: number;
    products: {
      name: string;
      images: any;
    };
  };
}

const steps = [
  { id: 1, title: "Endereço", description: "Onde entregar" },
  { id: 2, title: "Pagamento", description: "Como pagar" },
  { id: 3, title: "Revisão", description: "Confirme seu pedido" },
];

export default function Checkout() {
  const { session } = useSession();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [totals, setTotals] = useState<{ subtotal: number; discount: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  
  // Load draft from localStorage
  useEffect(() => {
    const draft = localStorage.getItem('checkout:draftAddress');
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        // TODO: Pre-fill form if needed
      } catch (error) {
        console.error('Error parsing draft:', error);
      }
    }
  }, []);

  // Track step changes
  useEffect(() => {
    if (!loading) {
      track("checkout_step", { step: currentStep });
    }
  }, [currentStep, loading]);

  useEffect(() => {
    if (session?.user?.id) {
      initializeCheckout();
    }
  }, [session?.user?.id]);

  const initializeCheckout = async () => {
    try {
      const userId = session!.user.id;
      
      // Get or create cart
      const activeCartId = await ensureActiveCart(userId);
      setCartId(activeCartId);
      
      // Track checkout start
      track("begin_checkout", { cart_id: activeCartId });

      // Load addresses
      const { data: addressData, error: addressError } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false });

      if (addressError) throw addressError;
      setAddresses(addressData || []);
      
      // Auto-select default address
      const defaultAddress = addressData?.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }

      // Load cart items
      const { data: cartData, error: cartError } = await supabase
        .from("cart_items")
        .select(`
          id,
          variant_id,
          quantity,
          price,
          variants (
            name,
            price,
            products (
              name,
              images
            )
          )
        `)
        .eq("cart_id", activeCartId);

      if (cartError) throw cartError;
      setCartItems(cartData || []);

      // Calculate initial totals
      const subtotal = (cartData || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setTotals({ subtotal, discount: 0, total: subtotal });

    } catch (error) {
      console.error("Error initializing checkout:", error);
      toast({
        title: "Erro ao carregar checkout",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAddresses = async () => {
    if (!session?.user?.id) return;
    
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", session.user.id)
      .order("is_default", { ascending: false });

    if (error) {
      console.error("Error loading addresses:", error);
      return;
    }

    setAddresses(data || []);
    
    // Auto-select default address if none selected
    if (!selectedAddressId) {
      const defaultAddress = data?.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim() || !cartId) return;
    
    setLoadingCoupon(true);
    try {
      const result = await runCheckout(cartId, couponCode);
      setTotals(result);
      setCouponApplied(true);
      track("apply_coupon", { code: couponCode, ok: true });
      toast({
        title: "Cupom aplicado!",
        description: `Desconto de R$ ${result.discount.toFixed(2)}`,
      });
    } catch (error: any) {
      track("apply_coupon", { code: couponCode, ok: false });
      toast({
        title: "Erro ao aplicar cupom",
        description: error.message || "Cupom inválido",
        variant: "destructive",
      });
    } finally {
      setLoadingCoupon(false);
    }
  };

  const removeCoupon = async () => {
    if (!cartId) return;
    
    setLoadingCoupon(true);
    try {
      const result = await runCheckout(cartId, "");
      setTotals(result);
      setCouponApplied(false);
      setCouponCode("");
      toast({
        title: "Cupom removido",
        description: "Desconto removido do pedido",
      });
    } catch (error: any) {
      console.error("Error removing coupon:", error);
    } finally {
      setLoadingCoupon(false);
    }
  };

  const handleStepNext = () => {
    if (currentStep === 1 && !selectedAddressId) {
      track("form_error", { step: 1, field: "address" });
      toast({
        title: "Selecione um endereço",
        description: "Escolha o endereço de entrega para continuar",
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
      // Smooth scroll to top when changing steps
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinishOrder = async () => {
    if (!selectedAddressId || !cartId) {
      track("form_error", { step: 3, field: "address" });
      toast({
        title: "Erro",
        description: "Selecione um endereço para continuar",
        variant: "destructive",
      });
      return;
    }

    setLoadingOrder(true);
    try {
      const { data, error } = await supabase.functions.invoke("place-order", {
        body: { 
          address_id: selectedAddressId, 
          payment_method: paymentMethod, 
          coupon_code: couponCode || null 
        }
      });

      if (error) throw error;

      // Track successful purchase intent
      track("purchase_intent", { 
        order_id: data.order_id,
        total: data.total
      });
      
      toast({
        title: "Pedido criado com sucesso!",
        description: "Redirecionando para a confirmação...",
      });

      // Navigate to order detail with created status
      navigate(`/pedido/${data.order_id}?status=created`);
      
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast({
        title: "Erro ao criar pedido",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoadingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando checkout...</div>
        </div>
        <Footer />
      </div>
    );
  }

  const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Checkout - Pata Lab</title>
        <meta name="description" content="Finalize sua compra na Pata Lab. Produtos para seu pet com entrega rápida e segura." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Finalizar Pedido</h1>
          
          <ProgressBar currentStep={currentStep} steps={steps} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Address */}
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Endereço de Entrega
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {addresses.length > 0 ? (
                      <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                        {addresses.map((address) => (
                          <div key={address.id} className="flex items-start space-x-2 p-3 border rounded-lg">
                            <RadioGroupItem value={address.id} id={address.id} />
                            <div className="flex-1">
                              <Label htmlFor={address.id} className="cursor-pointer">
                                <div className="font-medium">{address.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {address.street}, {address.number}
                                  {address.complement && `, ${address.complement}`}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {address.district}, {address.city} - {address.state}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  CEP: {address.cep}
                                  {address.phone && ` • Tel: ${address.phone}`}
                                </div>
                                {address.is_default && (
                                  <div className="text-xs text-primary font-medium mt-1">
                                    Endereço padrão
                                  </div>
                                )}
                              </Label>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhum endereço cadastrado
                      </div>
                    )}
                    
                    <AddAddressDialog 
                      userId={session!.user.id} 
                      onAddressAdded={loadAddresses}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Payment */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Método de Pagamento
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup value={paymentMethod} onValueChange={(value: "pix" | "card") => setPaymentMethod(value)}>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg">
                          <RadioGroupItem value="pix" id="pix" />
                          <Label htmlFor="pix" className="cursor-pointer flex-1 flex items-center gap-2">
                            💰 PIX - 10% de desconto
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg">
                          <RadioGroupItem value="card" id="card" />
                          <Label htmlFor="card" className="cursor-pointer flex-1 flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Cartão de Crédito
                          </Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Cupom de Desconto</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {couponApplied ? (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">
                              Cupom "{couponCode}" aplicado
                            </span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={removeCoupon}
                            disabled={loadingCoupon}
                            className="text-green-600 hover:text-green-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Digite seu cupom"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
                            disabled={loadingCoupon}
                          />
                          <Button 
                            onClick={applyCoupon}
                            disabled={!couponCode.trim() || loadingCoupon}
                            variant="outline"
                          >
                            {loadingCoupon ? "..." : "Aplicar"}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Itens do Pedido
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                            <img
                              src={Array.isArray(item.variants?.products?.images) ? item.variants.products.images[0] : "/placeholder.svg"}
                              alt={item.variants?.products?.name || "Produto"}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {item.variants?.products?.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {item.variants?.name}
                              </div>
                            </div>
                            <div className="text-right text-sm">
                              <div>{item.quantity}x R$ {item.price.toFixed(2)}</div>
                              <div className="font-medium">
                                R$ {(item.quantity * item.price).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revisão do Pedido</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Address */}
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Endereço de Entrega
                        </h4>
                        {selectedAddress && (
                          <div className="text-sm text-muted-foreground">
                            <div>{selectedAddress.name}</div>
                            <div>
                              {selectedAddress.street}, {selectedAddress.number}
                              {selectedAddress.complement && `, ${selectedAddress.complement}`}
                            </div>
                            <div>
                              {selectedAddress.district}, {selectedAddress.city} - {selectedAddress.state}
                            </div>
                            <div>CEP: {selectedAddress.cep}</div>
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Payment */}
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Método de Pagamento
                        </h4>
                        <div className="text-sm text-muted-foreground">
                          {paymentMethod === "pix" ? "PIX" : "Cartão de Crédito"}
                        </div>
                      </div>

                      <Separator />

                      {/* Items */}
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Itens ({cartItems.length})
                        </h4>
                        <div className="space-y-2">
                          {cartItems.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>
                                {item.quantity}x {item.variants?.products?.name} ({item.variants?.name})
                              </span>
                              <span>R$ {(item.quantity * item.price).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Sidebar - Order Summary */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <OrderSummary 
                totals={totals}
                itemCount={cartItems.length}
                className="mb-6"
              />

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <Button 
                    variant="outline" 
                    onClick={handleStepBack}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                )}
                {currentStep < 3 ? (
                  <Button 
                    onClick={handleStepNext}
                    disabled={currentStep === 1 && !selectedAddressId}
                    className="flex-1"
                  >
                    Continuar
                  </Button>
                ) : (
                  <Button 
                    onClick={handleFinishOrder}
                    disabled={loadingOrder || !selectedAddressId}
                    className="flex-1"
                  >
                    {loadingOrder ? "Processando..." : "Finalizar Pedido"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}