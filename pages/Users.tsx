import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Plus, Trash2, Shield, User as UserIcon, Lock, Unlock, AlertTriangle, Clock, Calendar, ChevronDown, ChevronUp, History, X } from 'lucide-react';

interface UsersProps {
  users: User[];
  onAddUser: (user: User) => void;
  onRemoveUser: (id: string) => void;
  onUpdateUserStatus: (id: string, status: User['status']) => void;
}

const UsersPage: React.FC<UsersProps> = ({ users, onAddUser, onRemoveUser, onUpdateUserStatus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: UserRole.COLLECTOR });
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  
  // State for delete confirmation
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const pendingUsers = users.filter(u => u.status === 'pending');

  const handleAdd = () => {
    if (!newUser.name || !newUser.email) return;
    
    onAddUser({
      id: crypto.randomUUID(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: `https://picsum.photos/seed/${encodeURIComponent(newUser.name)}/200`,
      status: 'pending', // Default to pending for approval
      createdAt: Date.now(),
      accessLogs: []
    });
    setNewUser({ name: '', email: '', role: UserRole.COLLECTOR });
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      onRemoveUser(userToDelete);
      setUserToDelete(null);
    }
  };

  const toggleExpand = (userId: string) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Ativo
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Bloqueado
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Aguardando Aprovação
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Controle de Usuários</h1>
          <p className="text-gray-500">Gerencie o acesso, permissões e histórico da equipe.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Admin Warning for Pending Users */}
      {pendingUsers.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4">
          <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-900">Atenção Necessária</h3>
            <p className="text-amber-800 text-sm mt-1">
              Existem <strong>{pendingUsers.length} novos usuários</strong> aguardando permissão para acessar o sistema.
              Verifique a lista abaixo e conceda acesso se apropriado.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuário</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Função</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Registro</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações / Permissão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <React.Fragment key={user.id}>
                <tr 
                  className={`hover:bg-gray-50/50 transition-colors cursor-pointer group ${user.status === 'pending' ? 'bg-amber-50/30' : ''}`}
                  onClick={() => toggleExpand(user.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                        {expandedUserId === user.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                      <img src={user.avatar} alt="" className="w-10 h-10 rounded-full bg-gray-200 object-cover" />
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      user.role === UserRole.ADMIN 
                        ? 'bg-purple-50 text-purple-700 border-purple-200' 
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {user.role === UserRole.ADMIN ? <Shield size={12} /> : <UserIcon size={12} />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col text-xs text-gray-500">
                       <span className="flex items-center gap-1 font-medium text-gray-700">
                          <Calendar size={12} />
                          {new Date(user.createdAt).toLocaleDateString()}
                       </span>
                       <span className="flex items-center gap-1 mt-1">
                          <Clock size={12} />
                          {new Date(user.createdAt).toLocaleTimeString()}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      {/* Permission Button */}
                      {user.status !== 'active' ? (
                          <button
                              onClick={() => onUpdateUserStatus(user.id, 'active')}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors border border-green-200"
                              title="Conceder Permissão de Acesso"
                          >
                              <Unlock size={14} />
                              Liberar Acesso
                          </button>
                      ) : (
                          <button
                              onClick={() => onUpdateUserStatus(user.id, 'inactive')}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
                              title="Revogar Permissão"
                          >
                              <Lock size={14} />
                              Bloquear
                          </button>
                      )}

                      <div className="h-4 w-px bg-gray-300 mx-1"></div>

                      <button 
                        onClick={() => setUserToDelete(user.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                        title="Excluir Usuário"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Expandable History Section */}
                {expandedUserId === user.id && (
                  <tr className="bg-gray-50 shadow-inner">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="ml-16 border-l-2 border-gray-200 pl-6 space-y-3">
                        <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                          <History size={16} className="text-blue-500" />
                          Histórico de Acesso Recente
                        </h4>
                        
                        {user.accessLogs && user.accessLogs.length > 0 ? (
                           <ul className="space-y-2">
                              {user.accessLogs.map((log, index) => (
                                <li key={index} className="text-xs text-gray-600 flex items-center gap-3">
                                  <span className="w-2 h-2 rounded-full bg-blue-300"></span>
                                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                                    {new Date(log).toLocaleDateString()}
                                  </span>
                                  <span className="text-gray-500">
                                    {new Date(log).toLocaleTimeString()}
                                  </span>
                                  <span className="text-gray-400 italic">
                                     - Acesso via Web App
                                  </span>
                                </li>
                              ))}
                           </ul>
                        ) : (
                           <p className="text-xs text-gray-400 italic">Nenhum registro de acesso recente disponível.</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Trash2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Excluir Usuário?</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Esta ação removerá o acesso deste usuário permanentemente. O histórico de coletas será mantido, mas desvinculado.
                </p>
                <div className="flex gap-3">
                   <button 
                      onClick={() => setUserToDelete(null)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                   >
                      Cancelar
                   </button>
                   <button 
                      onClick={confirmDelete}
                      className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                   >
                      Sim, Excluir
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Adicionar Novo Usuário</h3>
                <p className="text-sm text-gray-500">O usuário será criado como "Pendente".</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Ex: João Silva"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="joao@exemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
                <select 
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                >
                  <option value={UserRole.COLLECTOR}>Coletor</option>
                  <option value={UserRole.ADMIN}>Administrador</option>
                  <option value={UserRole.VIEWER}>Observador</option>
                </select>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 font-medium hover:text-gray-900"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAdd}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                Salvar e Aguardar Aprovação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;