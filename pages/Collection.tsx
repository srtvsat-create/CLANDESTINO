import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Loader2, Tag, CheckCircle, Car, AlertCircle, AlertTriangle, Save, RefreshCw, FileWarning } from 'lucide-react';
import { PhotoEntry } from '../types';
import { analyzePhoto } from '../services/geminiService';

interface CollectionProps {
  onAddPhoto: (photo: PhotoEntry) => void;
  userId: string;
}

type UploadStatus = 'idle' | 'analyzing' | 'reviewing' | 'saving' | 'success';

const Collection: React.FC<CollectionProps> = ({ onAddPhoto, userId }) => {
  // State Machine
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [preview, setPreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    model: string;
    plate: string;
    desc: string;
    tags: string[];
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect to handle completion of upload simulation
  useEffect(() => {
    if (status === 'saving' && uploadProgress >= 100) {
      const timer = setTimeout(() => {
        finalizeSave();
      }, 500); // Small delay for visual completion
      return () => clearTimeout(timer);
    }
  }, [uploadProgress, status]);

  const resetState = () => {
    setStatus('idle');
    setUploadProgress(0);
    setError(null);
    setPreview(null);
    setAnalysisResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validation
    if (!file.type.startsWith('image/')) {
        setError("O arquivo selecionado não é uma imagem válida.");
        return;
    }
    const MAX_SIZE_MB = 10;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`A imagem é muito grande. O tamanho máximo é ${MAX_SIZE_MB}MB.`);
        return;
    }

    // Reset previous errors and start analysis
    setError(null);
    setStatus('analyzing');

    // 2. Read File
    const reader = new FileReader();
    reader.onerror = () => {
        setError("Falha ao ler o arquivo. Tente novamente.");
        setStatus('idle');
    };
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setPreview(base64String);
      
      try {
          // 3. AI Analysis
          const analysis = await analyzePhoto(base64String);
          
          // Check for AI "soft" errors
          if (analysis.vehicleModel === "Erro" && analysis.licensePlate === "Erro") {
              setError("A IA não conseguiu identificar o veículo automaticamente. Por favor, preencha os dados manualmente.");
          }

          setAnalysisResult({
            model: analysis.vehicleModel || '',
            plate: analysis.licensePlate || '',
            desc: analysis.description,
            tags: analysis.tags
          });
          setStatus('reviewing');

      } catch (err) {
          console.error(err);
          setError("Erro na conexão com o serviço de análise. Preencha os dados manualmente.");
          // Fallback to empty form
          setAnalysisResult({
            model: '',
            plate: '',
            desc: '',
            tags: []
          });
          setStatus('reviewing');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!preview || !analysisResult) return;

    setStatus('saving');
    setError(null);
    setUploadProgress(0);

    // Simulate Upload Progress
    const interval = setInterval(() => {
        setUploadProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                return 100;
            }
            return prev + 10;
        });
    }, 150);
  };

  const finalizeSave = () => {
    // Ensure we have data (double check, though status flow prevents this)
    if (!preview || !analysisResult) return;

    const newPhoto: PhotoEntry = {
      id: crypto.randomUUID(),
      url: preview,
      timestamp: Date.now(),
      userId: userId,
      description: analysisResult.desc,
      tags: analysisResult.tags,
      vehicleModel: analysisResult.model,
      licensePlate: analysisResult.plate
    };

    setStatus('success');
    
    // Allow user to see success message briefly before redirecting
    setTimeout(() => {
        onAddPhoto(newPhoto);
        // Note: The parent usually navigates away here.
    }, 1500);
  };

  const handleRetake = () => {
    resetState();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Coleta de Veículos</h1>
        <p className="text-gray-500">Capture a foto do veículo para identificação automática de placa e modelo.</p>
      </div>

      {/* Error Banner */}
      {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-in slide-in-from-top-2">
              <AlertTriangle className="text-red-500 mt-0.5" size={20} />
              <div>
                  <h4 className="text-sm font-bold text-red-800">Atenção</h4>
                  <p className="text-sm text-red-700">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
                  <X size={16} />
              </button>
          </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
        
        {/* Success Overlay */}
        {status === 'success' && (
            <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="bg-green-100 p-4 rounded-full mb-4">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Coleta Salva!</h2>
                <p className="text-gray-500">Redirecionando para relatórios...</p>
            </div>
        )}

        {status === 'idle' ? (
          <div className="py-16 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group cursor-pointer text-center" onClick={() => fileInputRef.current?.click()}>
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Camera size={40} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Capturar Veículo</h3>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">Tire uma foto frontal ou traseira para melhor leitura da placa.</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              capture="environment" 
              onChange={handleFileChange}
            />
            <button className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm inline-flex items-center gap-2">
                <Upload size={20} />
                Selecionar ou Tirar Foto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Image Column */}
             <div className="space-y-4">
                <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-md group">
                    <img src={preview!} alt="Preview" className={`w-full h-full object-contain transition-opacity ${status === 'analyzing' ? 'opacity-50' : 'opacity-100'}`} />
                    
                    {/* Analyzing Overlay */}
                    {status === 'analyzing' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
                            <p className="text-white font-bold text-lg drop-shadow-md">Analisando imagem...</p>
                            <p className="text-blue-200 text-sm mt-2 drop-shadow-md">Identificando modelo e lendo placa...</p>
                        </div>
                    )}

                    {/* Change Photo Button (Review Mode) */}
                    {status === 'reviewing' && (
                        <button 
                            onClick={handleRetake}
                            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Trocar Foto"
                        >
                            <RefreshCw size={16} />
                        </button>
                    )}
                </div>
                
                {status === 'reviewing' && (
                    <button 
                        onClick={handleRetake}
                        className="w-full py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Camera size={18} />
                        Tirar Outra Foto
                    </button>
                )}
             </div>

             {/* Details Column */}
             <div className="flex flex-col h-full">
                {analysisResult ? (
                    <div className="space-y-6 flex-1 animate-in slide-in-from-right duration-500">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <CheckCircle className="text-green-500" size={20} />
                                    Dados da Vistoria
                                </h3>
                                <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">AUTO-ID</span>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                        Placa do Veículo
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={analysisResult.plate}
                                            onChange={(e) => setAnalysisResult({...analysisResult, plate: e.target.value})}
                                            disabled={status === 'saving'}
                                            className="w-full p-3 bg-yellow-50 border border-yellow-200 text-gray-900 font-mono text-xl font-bold rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none uppercase tracking-widest text-center disabled:opacity-70"
                                            placeholder="AAA-0000"
                                        />
                                        {!analysisResult.plate && status === 'reviewing' && (
                                            <div className="absolute right-3 top-3.5 text-yellow-600 animate-pulse" title="Placa não detectada">
                                                <AlertCircle size={20} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                        Modelo / Marca
                                    </label>
                                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200 px-3">
                                        <Car className="text-gray-400" size={20} />
                                        <input 
                                            type="text" 
                                            value={analysisResult.model}
                                            onChange={(e) => setAnalysisResult({...analysisResult, model: e.target.value})}
                                            disabled={status === 'saving'}
                                            className="w-full py-3 bg-transparent outline-none font-medium text-lg text-gray-800 disabled:opacity-70"
                                            placeholder="Ex: Toyota Corolla"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                        Descrição Técnica
                                    </label>
                                    <textarea 
                                        value={analysisResult.desc}
                                        onChange={(e) => setAnalysisResult({...analysisResult, desc: e.target.value})}
                                        disabled={status === 'saving'}
                                        className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 disabled:bg-gray-50"
                                        placeholder="Adicione detalhes sobre o estado do veículo..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 mt-auto">
                            {status === 'saving' ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-gray-500 font-semibold uppercase">
                                        <span>Salvando dados...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                        <div 
                                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    onClick={handleSave}
                                    disabled={!analysisResult.plate && !confirm("A placa está vazia. Deseja continuar mesmo assim?")}
                                    className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    <Save size={24} />
                                    Confirmar Coleta
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50">
                       <div className="space-y-3 w-full">
                           <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                           <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mx-auto"></div>
                           <div className="h-24 w-full bg-gray-200 rounded animate-pulse mt-6"></div>
                       </div>
                    </div>
                )}
             </div>
          </div>
        )}
      </div>

      {/* Helper Tips */}
      {status === 'idle' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                    <AlertCircle size={18} />
                    <span>Enquadramento</span>
                </div>
                <p className="text-sm text-blue-600">Mantenha a placa centralizada e evite ângulos muito inclinados.</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                    <AlertCircle size={18} />
                    <span>Iluminação</span>
                </div>
                <p className="text-sm text-blue-600">Evite sombras fortes sobre a placa ou reflexos excessivos.</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                    <FileWarning size={18} />
                    <span>Tamanho</span>
                </div>
                <p className="text-sm text-blue-600">O sistema aceita imagens de alta resolução até 10MB.</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default Collection;