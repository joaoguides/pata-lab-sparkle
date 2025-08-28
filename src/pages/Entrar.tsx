import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Entrar() {
  const [email, setEmail] = useState(""); 
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState<string|null>(null); 
  const [loading, setLoading] = useState(false);
  const nav = useNavigate(); 
  const loc = useLocation() as any;
  
  async function onSubmit(e: React.FormEvent){ 
    e.preventDefault(); 
    setMsg(null); 
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    setLoading(false);
    if (error) return setMsg(error.message);
    const to = loc.state?.from?.pathname || "/"; 
    nav(to, { replace:true });
  }
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl border mt-6">
      <h1 className="text-xl font-bold mb-3">Entrar</h1>
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
          className="w-full rounded-xl bg-primary text-primary-foreground py-2 font-semibold" 
          disabled={loading}
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
        {msg && <p className="text-sm text-red-600">{msg}</p>}
      </form>
      <p className="text-sm mt-3">
        Não tem conta? <Link to="/criar-conta" className="text-primary underline">Criar conta</Link>
      </p>
    </div>
  );
}