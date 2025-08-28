import { Navigate, useLocation } from "react-router-dom";
import { useSession } from "@/hooks/useSession";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { session, loading } = useSession();
  const location = useLocation();
  if (loading) return <div className="p-6">Carregando…</div>;
  if (!session) return <Navigate to="/entrar" replace state={{ from: location }} />;
  return children;
}