import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface ProductTabsProps {
  description: string;
}

export default function ProductTabs({ description }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      title: "Descrição",
      content: description || "Este produto foi cuidadosamente selecionado para oferecer o melhor para seu pet. Consulte as especificações completas para mais detalhes."
    },
    {
      title: "Entrega & Devolução",
      content: "Entrega em todo o Brasil. Prazo de 3 a 8 dias úteis. Troca garantida em até 7 dias corridos após o recebimento. Produto deve estar em perfeitas condições."
    },
    {
      title: "Avaliações",
      content: "Ainda não há avaliações para este produto. Seja o primeiro a avaliar!"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Desktop Tabs */}
      <div className="hidden md:block">
        <div className="flex border-b border-line">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === index
                  ? "border-brand-blue text-brand-blue"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>
        <div className="py-6">
          <p className="text-ink leading-relaxed">{tabs[activeTab].content}</p>
        </div>
      </div>

      {/* Mobile Accordions */}
      <div className="md:hidden space-y-2">
        {tabs.map((tab, index) => (
          <div key={index} className="card">
            <button
              onClick={() => setActiveTab(activeTab === index ? -1 : index)}
              className="w-full p-4 flex items-center justify-between text-left"
              aria-expanded={activeTab === index}
            >
              <span className="font-medium text-ink">{tab.title}</span>
              <ChevronDown 
                size={20} 
                className={`text-muted transition-transform ${
                  activeTab === index ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeTab === index && (
              <div className="px-4 pb-4">
                <p className="text-ink leading-relaxed">{tab.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}