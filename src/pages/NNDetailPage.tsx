import { useParams, useNavigate } from "react-router-dom";
import { usePerson } from "../hooks/useApi";
import NNDetail from "../components/NNDetail";
import PulseLoader from "../components/PulseLoader";

export default function NNDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: admission, isLoading, isError } = usePerson(id);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <PulseLoader className="h-12 w-12 text-[#991b1b]" />
        <p className="text-sm text-slate-400 font-medium">Cargando expediente...</p>
      </div>
    );
  }

  if (isError || !admission) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400 text-sm italic">
        No se encontró el expediente solicitado.
      </div>
    );
  }

  return <NNDetail admission={admission} onBack={() => navigate("/")} />;
}
