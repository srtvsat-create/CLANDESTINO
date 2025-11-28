import React, { useState } from 'react';
import { LayoutDashboard, Camera, Users, FileText, Menu, X, Skull, Lock, ShieldAlert, Trash2, Plus, Check, AlertTriangle, ArrowRight } from 'lucide-react';
import { User, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
  onAddAdmin: (name: string, email: string) => void;
  onClearData: () => void;
  pendingUserCount: number;
  currentUser: User;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate, onAddAdmin, onClearData, pendingUserCount, currentUser }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Secret Menu States
  const [isSecretMenuOpen, setIsSecretMenuOpen] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'admin' | 'danger'>('admin');
  
  // Forms
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const MASTER_PASS = "SALMOS83:18";

  const handleSecretAccess = () => {
    if (masterPassword === MASTER_PASS) {
      setIsAuthenticated(true);
      setMasterPassword('');
    } else {
      alert("Senha Mestra Incorreta");
      setMasterPassword('');
    }
  };

  const handleCreateAdmin = () => {
    if (newAdminName && newAdminEmail) {
      onAddAdmin(newAdminName, newAdminEmail);
      setNewAdminName('');
      setNewAdminEmail('');
      alert("Administrador cadastrado com sucesso!");
    }
  };

  const handleDeleteData = () => {
    if (deleteConfirmation === MASTER_PASS) {
      if (window.confirm("ATENÇÃO: Isso apagará todas as fotos e usuários (exceto o admin principal). Esta ação é irreversível. Continuar?")) {
        onClearData();
        setDeleteConfirmation('');
        setIsSecretMenuOpen(false);
        alert("Todos os dados foram apagados.");
      }
    } else {
      alert("Senha de confirmação incorreta.");
    }
  };

  const closeSecretMenu = () => {
    setIsSecretMenuOpen(false);
    setIsAuthenticated(false);
    setMasterPassword('');
    setDeleteConfirmation('');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'collection', label: 'Coleta', icon: Camera },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'reports', label: 'Relatórios', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 no-print flex flex-col
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-600">
              <Skull className="w-5 h-5 text-slate-200" />
            </div>
            <span className="text-xl font-bold tracking-wide text-slate-100">cland Photo</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative
                ${activePage === item.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
              
              {/* Notification Badge for Users */}
              {item.id === 'users' && pendingUserCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                  {pendingUserCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer with Secret Trigger */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src={currentUser.avatar || "https://picsum.photos/40/40"} 
              alt="User" 
              className="w-10 h-10 rounded-full border-2 border-slate-600 object-cover"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-400 truncate">{currentUser.role}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-2">
             <span className="text-[10px] text-slate-600">v1.0.5 Release</span>
             {/* Secret Button */}
             <button 
                onClick={() => setIsSecretMenuOpen(true)}
                className="text-slate-700 hover:text-slate-500 transition-colors p-1"
                title="Configurações do Sistema"
             >
                <Lock size={12} />
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between no-print">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-slate-600 hover:text-slate-900 relative"
          >
            <Menu size={24} />
            {pendingUserCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          <div className="flex items-center gap-2">
            <Skull className="w-5 h-5 text-slate-800" />
            <span className="font-bold text-slate-800">cland Photo</span>
          </div>
          <div className="w-6" /> {/* Spacer */}
        </header>

        {/* Admin Notification Banner */}
        {activePage === 'dashboard' && currentUser.role === UserRole.ADMIN && pendingUserCount > 0 && (
           <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in slide-in-from-top duration-300 no-print">
              <div className="flex items-center gap-3">
                 <div className="bg-amber-100 p-1.5 rounded-full text-amber-600">
                    <AlertTriangle size={16} />
                 </div>
                 <p className="text-sm text-amber-900 font-medium">
                    Existem <span className="font-bold">{pendingUserCount}</span> usuários aguardando aprovação.
                 </p>
              </div>
              <button 
                 onClick={() => onNavigate('users')}
                 className="text-xs font-bold text-amber-700 hover:text-amber-900 hover:underline flex items-center gap-1"
              >
                 Gerenciar Acessos <ArrowRight size={12} />
              </button>
           </div>
        )}

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-auto p-4 lg:p-8 relative">
          {children}
        </main>
      </div>

      {/* Secret Menu Modal */}
      {isSecretMenuOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-black/40 p-6 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                 <ShieldAlert className="text-red-500" size={24} />
                 <h2 className="text-xl font-bold text-white tracking-wide">
                    {isAuthenticated ? 'Painel Super Admin' : 'Acesso Restrito'}
                 </h2>
              </div>
              <button onClick={closeSecretMenu} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {!isAuthenticated ? (
                <div className="space-y-4">
                  <p className="text-slate-400 text-sm">Esta área é restrita para manutenção do sistema. Digite a senha mestra para continuar.</p>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha Mestra</label>
                    <input 
                      type="password" 
                      value={masterPassword}
                      onChange={(e) => setMasterPassword(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      placeholder="••••••••••"
                    />
                  </div>
                  <button 
                    onClick={handleSecretAccess}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
                  >
                    Acessar
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Tabs */}
                  <div className="flex bg-slate-800 p-1 rounded-lg">
                    <button 
                      onClick={() => setActiveTab('admin')}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                        activeTab === 'admin' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Cadastrar Admin
                    </button>
                    <button 
                      onClick={() => setActiveTab('danger')}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                        activeTab === 'danger' ? 'bg-red-900/50 text-red-200 shadow-sm' : 'text-slate-400 hover:text-red-300'
                      }`}
                    >
                      Zona de Perigo
                    </button>
                  </div>

                  {activeTab === 'admin' ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                       <div>
                         <label className="block text-xs text-slate-400 mb-1">Nome do Administrador</label>
                         <input 
                            type="text"
                            value={newAdminName}
                            onChange={(e) => setNewAdminName(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 text-white px-3 py-2 rounded focus:border-blue-500 outline-none"
                         />
                       </div>
                       <div>
                         <label className="block text-xs text-slate-400 mb-1">Email</label>
                         <input 
                            type="email"
                            value={newAdminEmail}
                            onChange={(e) => setNewAdminEmail(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 text-white px-3 py-2 rounded focus:border-blue-500 outline-none"
                         />
                       </div>
                       <button 
                        onClick={handleCreateAdmin}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                       >
                         <Plus size={18} /> Cadastrar Admin
                       </button>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                      <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-lg">
                        <h4 className="text-red-400 font-bold flex items-center gap-2 mb-2">
                          <Trash2 size={18} /> Apagar Todos os Dados
                        </h4>
                        <p className="text-red-200/70 text-sm text-justify">
                          Esta ação excluirá permanentemente todas as fotos coletadas e removerá todos os usuários (exceto você). Esta ação não pode ser desfeita.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirme a Senha Mestra</label>
                        <input 
                          type="password" 
                          value={deleteConfirmation}
                          onChange={(e) => setDeleteConfirmation(e.target.value)}
                          className="w-full bg-slate-800 border border-red-900/50 text-red-100 px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 outline-none placeholder-red-900/50"
                          placeholder="Digite a senha para confirmar"
                        />
                      </div>

                      <button 
                        onClick={handleDeleteData}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 size={20} /> CONFIRMAR EXCLUSÃO
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Layout;