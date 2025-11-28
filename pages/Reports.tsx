import React, { useState } from 'react';
import { PhotoEntry, User } from '../types';
import { FileText, Printer, Loader2, Sparkles, Calendar, User as UserIcon, Clock, Car, Hash, MapPin, Skull, Trash2 } from 'lucide-react';
import { generateReportSummary } from '../services/geminiService';

interface ReportsProps {
  photos: PhotoEntry[];
  users: User[];
  onRemovePhoto: (id: string) => void;
}

const Reports: React.FC<ReportsProps> = ({ photos, users, onRemovePhoto }) => {
  const [aiSummary, setAiSummary] = useState<string>("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  const handleGenerateSummary = async () => {
    setLoadingSummary(true);
    const summary = await generateReportSummary(photos, users);
    setAiSummary(summary);
    setLoadingSummary(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("ATENÇÃO: Tem certeza que deseja excluir este registro de vistoria? Esta ação não pode ser desfeita.")) {
      onRemovePhoto(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios de Vistoria</h1>
          <p className="text-gray-500">Relatório detalhado com fotos, dados do veículo e responsável.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors shadow-sm font-medium"
        >
          <Printer size={20} />
          <span>Exportar PDF / Imprimir</span>
        </button>
      </div>

      {/* Report Preview Container - This is what gets printed */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden print:shadow-none print:rounded-none">
        {/* Report Header */}
        <div className="bg-slate-900 text-white p-8 print:bg-slate-900 print:text-white print-color-adjust-exact border-b-4 border-blue-500">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold mb-2 uppercase tracking-wide">Relatório de Vistoria</h2>
                    <p className="text-slate-300 flex items-center gap-2">
                        <Skull size={18} />
                        cland Photo Audit System
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-400 uppercase tracking-wider">Data de Emissão</p>
                    <p className="font-bold text-xl">{new Date().toLocaleDateString('pt-BR')}</p>
                    <p className="text-xs text-slate-500">{new Date().toLocaleTimeString('pt-BR')}</p>
                </div>
            </div>
        </div>

        <div className="p-8 space-y-8">
            {/* AI Summary Section */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 print:bg-gray-50 print:border-gray-200 no-break-inside">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-blue-600" size={20} />
                        <h3 className="font-bold text-blue-900 uppercase text-sm tracking-wider">Análise Geral da Frota (IA)</h3>
                    </div>
                    {!aiSummary && !loadingSummary && (
                        <button 
                            onClick={handleGenerateSummary}
                            className="text-sm font-medium text-blue-600 hover:underline no-print"
                        >
                            Gerar Resumo da Frota
                        </button>
                    )}
                </div>
                
                {loadingSummary ? (
                    <div className="flex items-center gap-2 text-blue-700">
                        <Loader2 className="animate-spin" size={16} />
                        <span>Processando dados da frota...</span>
                    </div>
                ) : aiSummary ? (
                    <p className="text-slate-700 leading-relaxed text-justify text-sm">
                        {aiSummary}
                    </p>
                ) : (
                    <p className="text-slate-500 italic text-sm">
                        Resumo não gerado. Clique no botão acima para analisar.
                    </p>
                )}
            </div>

            {/* Detailed Cards List */}
            <div className="space-y-8">
                <h3 className="font-bold text-gray-900 border-b pb-2 text-lg uppercase tracking-wider flex items-center gap-2">
                    <FileText size={20} />
                    Detalhamento dos Veículos
                </h3>

                {photos.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 italic bg-gray-50 rounded-lg border-dashed border-2 border-gray-200">
                    Nenhuma coleta registrada no sistema.
                  </div>
                ) : (
                  photos.slice().reverse().map((photo, index) => {
                    const user = users.find(u => u.id === photo.userId);
                    const date = new Date(photo.timestamp);
                    
                    return (
                        <div key={photo.id} className="border border-gray-200 rounded-lg overflow-hidden flex flex-col md:flex-row print:flex-row print:border-gray-300 page-break-inside-avoid mb-6 shadow-sm print:shadow-none group">
                            {/* Photo Section */}
                            <div className="md:w-1/2 print:w-1/2 bg-gray-100 relative min-h-[250px]">
                                <img 
                                    src={photo.url} 
                                    alt="Vehicle" 
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            </div>

                            {/* Details Section */}
                            <div className="md:w-1/2 print:w-1/2 p-6 flex flex-col justify-between bg-white relative">
                                
                                {/* Delete Button (Absolute, top right) */}
                                <button
                                    onClick={() => handleDelete(photo.id)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors print:hidden"
                                    title="Excluir Registro"
                                >
                                    <Trash2 size={18} />
                                </button>

                                <div>
                                    <div className="flex justify-between items-start mb-4 pr-10">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">ID do Registro</p>
                                            <p className="font-mono text-sm text-gray-600">#{photo.id.split('-')[0]}</p>
                                        </div>
                                        <div className="bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                                            <p className="text-xs font-bold text-gray-600">Item {photos.length - index}</p>
                                        </div>
                                    </div>

                                    {/* Critical Vehicle Info */}
                                    <div className="mb-6">
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="bg-yellow-50 p-3 rounded border border-yellow-100 print:bg-white print:border-gray-300">
                                                <p className="text-xs text-yellow-800 font-bold uppercase mb-1 flex items-center gap-1">
                                                    <Hash size={12} /> Placa
                                                </p>
                                                <p className="text-2xl font-bold text-gray-900 font-mono tracking-wider">
                                                    {photo.licensePlate || "N/A"}
                                                </p>
                                            </div>
                                            <div className="bg-blue-50 p-3 rounded border border-blue-100 print:bg-white print:border-gray-300">
                                                <p className="text-xs text-blue-800 font-bold uppercase mb-1 flex items-center gap-1">
                                                    <Car size={12} /> Modelo
                                                </p>
                                                <p className="text-lg font-semibold text-gray-900 leading-tight">
                                                    {photo.vehicleModel || "Não identificado"}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-500">
                                                <span className="font-semibold text-gray-700">Descrição:</span> {photo.description || "Sem descrição."}
                                            </p>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {photo.tags.slice(0, 4).map((tag, i) => (
                                                    <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded border border-gray-200">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Meta Info Footer */}
                                <div className="border-t pt-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-semibold flex items-center gap-1 mb-1">
                                            <Calendar size={12} /> Data da Coleta
                                        </p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {date.toLocaleDateString('pt-BR')}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {date.toLocaleTimeString('pt-BR')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-semibold flex items-center gap-1 mb-1">
                                            <UserIcon size={12} /> Responsável
                                        </p>
                                        <div className="flex items-center gap-2">
                                            {user?.avatar && (
                                                <img src={user.avatar} className="w-6 h-6 rounded-full print:hidden" alt="" />
                                            )}
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {user?.name || "Sistema"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                  })
                )}
            </div>

             {/* Footer for print */}
             <div className="mt-12 border-t pt-4 text-center text-xs text-gray-400 print-only">
                <p>Relatório gerado automaticamente por cland Photo System. Página 1 de 1</p>
            </div>
        </div>
      </div>
      
      <style>{`
        @media print {
            @page { margin: 0; size: A4; }
            body { background: white; -webkit-print-color-adjust: exact; }
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            .page-break-inside-avoid { page-break-inside: avoid; }
            .shadow-lg { box-shadow: none !important; }
            .rounded-xl { border-radius: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default Reports;