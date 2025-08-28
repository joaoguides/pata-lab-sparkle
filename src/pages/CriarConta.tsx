import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function CriarConta() {
  const [email, setEmail] = useState(""); 
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState<string|null>(null); 
  const [loading, setLoading] = useState(false);
  
  async function onSubmit(e: React.FormEvent){ 
    e.preventDefault(); 
    setMsg(null); 
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password: pass });
    setLoading(false);
    setMsg(error ? error.message : "Conta criada! Verifique seu e-mail para confirmar.");
  }
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl border mt-6">
      <h1 className="text-xl font-bold mb-3">Criar conta</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input 
          className="w-full border rounded-lg px-3 py-2" 
          type="email" 
          placeholder="email@exemplo.com" 
          value={email} 
          onChange={e=>setEmail(e.target.value)} 
          required
        />
        <input 
          className="w-full border rounded-lg px-3 py-2" 
          type="password" 
          placeholder="Senha" 
          value={pass} 
          onChange={e=>setPass(e.target.value)} 
          required
        />
        <button 
          className="w-full rounded-xl bg-secondary text-secondary-foreground py-2 font-semibold" 
          disabled={loading}
        >
          {loading ? "Criando…" : "Criar conta"}
        </button>
        {msg && <p className="text-sm">{msg}</p>}
      </form>
      <p className="text-sm mt-3">
        Já tem conta? <Link to="/entrar" className="text-primary underline">Entrar</Link>
      </p>
    </div>
  );
}