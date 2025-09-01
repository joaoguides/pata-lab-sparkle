import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
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
import { maskCep, maskPhone, fetchAddressByCep, unmaskValue } from "@/lib/mask";

interface AddAddressDialogProps {
  userId: string;
  onAddressAdded: () => void;
}

interface AddressFormData {
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

export default function AddAddressDialog({ userId, onAddressAdded }: AddAddressDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset
  } = useForm<AddressFormData>({
    defaultValues: {
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
    }
  });

  const cepValue = watch('cep');

  // Auto-complete address on CEP change
  useEffect(() => {
    if (cepValue && unmaskValue(cepValue).length === 8) {
      handleCepLookup(cepValue);
    }
  }, [cepValue]);

  const handleCepLookup = async (cep: string) => {
    setCepLoading(true);
    try {
      const addressData = await fetchAddressByCep(cep);
      if (addressData) {
        if (addressData.logradouro) setValue('street', addressData.logradouro);
        if (addressData.bairro) setValue('district', addressData.bairro);
        if (addressData.localidade) setValue('city', addressData.localidade);
        if (addressData.uf) setValue('state', addressData.uf);
      }
    } catch (error) {
      console.error('Error fetching CEP:', error);
    } finally {
      setCepLoading(false);
    }
  };

  const onSubmit = async (data: AddressFormData) => {
    setLoading(true);
    try {
      // If setting as default, unset other defaults first
      if (data.is_default) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", userId);
      }

      // Clean phone and CEP before saving
      const cleanData = {
        ...data,
        phone: unmaskValue(data.phone),
        cep: unmaskValue(data.cep),
      };

      const { error } = await supabase
        .from("addresses")
        .insert({
          ...cleanData,
          user_id: userId,
        });

      if (error) throw error;

      toast({
        title: "Endereço adicionado!",
        description: "Novo endereço salvo com sucesso",
      });

      setOpen(false);
      reset();
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
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do destinatário *</Label>
            <Input
              id="name"
              {...register("name", { required: "Nome é obrigatório" })}
              aria-invalid={errors.name ? "true" : "false"}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-destructive" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              {...register("phone", { 
                required: "Telefone é obrigatório",
                onChange: (e) => {
                  const masked = maskPhone(e.target.value);
                  setValue("phone", masked);
                }
              })}
              aria-invalid={errors.phone ? "true" : "false"}
              aria-describedby={errors.phone ? "phone-error" : undefined}
            />
            {errors.phone && (
              <p id="phone-error" className="text-sm text-destructive" role="alert">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="cep">CEP *</Label>
              <div className="relative">
                <Input
                  id="cep"
                  placeholder="12345-678"
                  {...register("cep", { 
                    required: "CEP é obrigatório",
                    onChange: (e) => {
                      const masked = maskCep(e.target.value);
                      setValue("cep", masked);
                    }
                  })}
                  aria-invalid={errors.cep ? "true" : "false"}
                  aria-describedby={errors.cep ? "cep-error" : undefined}
                />
                {cepLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
              </div>
              {errors.cep && (
                <p id="cep-error" className="text-sm text-destructive" role="alert">
                  {errors.cep.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado *</Label>
              <Input
                id="state"
                maxLength={2}
                {...register("state", { required: "Estado é obrigatório" })}
                aria-invalid={errors.state ? "true" : "false"}
                aria-describedby={errors.state ? "state-error" : undefined}
              />
              {errors.state && (
                <p id="state-error" className="text-sm text-destructive" role="alert">
                  {errors.state.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade *</Label>
            <Input
              id="city"
              {...register("city", { required: "Cidade é obrigatória" })}
              aria-invalid={errors.city ? "true" : "false"}
              aria-describedby={errors.city ? "city-error" : undefined}
            />
            {errors.city && (
              <p id="city-error" className="text-sm text-destructive" role="alert">
                {errors.city.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="district">Bairro *</Label>
            <Input
              id="district"
              {...register("district", { required: "Bairro é obrigatório" })}
              aria-invalid={errors.district ? "true" : "false"}
              aria-describedby={errors.district ? "district-error" : undefined}
            />
            {errors.district && (
              <p id="district-error" className="text-sm text-destructive" role="alert">
                {errors.district.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="street">Rua *</Label>
              <Input
                id="street"
                {...register("street", { required: "Rua é obrigatória" })}
                aria-invalid={errors.street ? "true" : "false"}
                aria-describedby={errors.street ? "street-error" : undefined}
              />
              {errors.street && (
                <p id="street-error" className="text-sm text-destructive" role="alert">
                  {errors.street.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">Número *</Label>
              <Input
                id="number"
                {...register("number", { required: "Número é obrigatório" })}
                aria-invalid={errors.number ? "true" : "false"}
                aria-describedby={errors.number ? "number-error" : undefined}
              />
              {errors.number && (
                <p id="number-error" className="text-sm text-destructive" role="alert">
                  {errors.number.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input
              id="complement"
              {...register("complement")}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_default"
              {...register("is_default")}
            />
            <Label htmlFor="is_default">Definir como endereço padrão</Label>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || loading} className="flex-1">
              {(isSubmitting || loading) ? "Salvando..." : "Salvar endereço"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}