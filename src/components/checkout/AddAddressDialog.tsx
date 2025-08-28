import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface AddAddressDialogProps {
  userId: string;
  onAddressAdded: () => void;
}

export default function AddAddressDialog({ userId, onAddressAdded }: AddAddressDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
    cep: "",
    is_default: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // If setting as default, unset other defaults first
      if (formData.is_default) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", userId);
      }

      const { error } = await supabase
        .from("addresses")
        .insert({
          ...formData,
          user_id: userId,
        });

      if (error) throw error;

      toast({
        title: "Endereço adicionado!",
        description: "Novo endereço salvo com sucesso",
      });

      setOpen(false);
      setFormData({
        name: "",
        phone: "",
        street: "",
        number: "",
        complement: "",
        district: "",
        city: "",
        state: "",
        cep: "",
        is_default: false,
      });
      onAddressAdded();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar endereço",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar novo endereço
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Endereço</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do destinatário *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="cep">CEP *</Label>
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="district">Bairro *</Label>
            <Input
              id="district"
              value={formData.district}
              onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="street">Rua *</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">Número *</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input
              id="complement"
              value={formData.complement}
              onChange={(e) => setFormData(prev => ({ ...prev, complement: e.target.value }))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_default"
              checked={formData.is_default}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, is_default: checked === true }))
              }
            />
            <Label htmlFor="is_default">Definir como endereço padrão</Label>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Salvando..." : "Salvar endereço"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}