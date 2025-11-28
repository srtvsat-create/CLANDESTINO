import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PhotoEntry, User } from '../types';
import { Camera, Users, FileCheck, TrendingUp, Trophy, Sparkles } from 'lucide-react';

interface DashboardProps {
  photos: PhotoEntry[];
  users: User[];
}

const Dashboard: React.FC<DashboardProps> = ({ photos, users }) => {
  
  // Calculate Stats
  const totalPhotos = photos.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const todayPhotos = photos.filter(p => new Date(p.timestamp).toDateString() === new Date().toDateString()).length;
  
  // Mock current user for Welcome Message (usually provided by auth context)
  const currentUser = users[0];

  // Prepare Chart Data - Photos per User
  const photosByUser = users.map(user => ({
    name: user.name.split(' ')[0], // First name
    photos: photos.filter(p => p.userId === user.id).length
  })).filter(d => d.photos > 0);

  // Prepare User Ranking (Top 10 by photo count)
  const userRanking = users.map(user => ({
      user,
      photoCount: photos.filter(p => p.userId === user.id).length
  }))
  .sort((a, b) => b.photoCount - a.photoCount)
  .slice(0, 10);

  const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
        <p className="text-xs text-green-600 mt-1 font-medium">{sub}</p>
      </div>
      <div className={`p-3 rounded-lg ${color} text-white`}>
        <Icon size={24} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                Olá, {currentUser.name.split(' ')[0]}! <span className="text-2xl">👋</span>
            </h1>
            <p className="text-slate-300 max-w-xl">
                Bem-vindo ao <strong>cland Photo</strong>. Aqui você tem a visão geral de todas as coletas, métricas de desempenho e status da frota.
            </p>
        </div>
        <div className="absolute right-0 top-0 h-full opacity-10 pointer-events-none">
            <Sparkles size={200} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Métricas Principais</h2>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
            title="Total de Fotos" 
            value={totalPhotos} 
            sub="Armazenadas no sistema" 
            icon={Camera} 
            color="bg-blue-500" 
            />
            <StatCard 
            title="Usuários Ativos" 
            value={activeUsers} 
            sub="Acesso liberado" 
            icon={Users} 
            color="bg-emerald-500" 
            />
            <StatCard 
            title="Coletas Hoje" 
            value={todayPhotos} 
            sub="Últimas 24h" 
            icon={TrendingUp} 
            color="bg-amber-500" 
            />
            <StatCard 
            title="Relatórios" 
            value="Pronto" 
            sub="Exportação disponível" 
            icon={FileCheck} 
            color="bg-purple-500" 
            />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Produtividade por Usuário</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={photosByUser}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fill: '#6B7280'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#6B7280'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#F3F4F6'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="photos" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Ranking List (Replaces Pie Chart) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy className="text-yellow-500" size={20} />
            Ranking de Coletas (Top 10)
          </h3>
          <div className="flex-1 overflow-auto">
            <div className="space-y-4">
              {userRanking.map((item, index) => (
                <div key={item.user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm
                      ${index === 0 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-200' : 
                        index === 1 ? 'bg-gray-200 text-gray-700 ring-2 ring-gray-300' : 
                        index === 2 ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-200' : 'bg-white border text-gray-500'}
                    `}>
                      {index + 1}
                    </div>
                    <img src={item.user.avatar} alt={item.user.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                    <div>
                      <p className="font-semibold text-gray-900">{item.user.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        {item.user.role}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{item.photoCount}</p>
                    <p className="text-xs text-gray-400">fotos</p>
                  </div>
                </div>
              ))}
              
              {userRanking.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
                  <Trophy size={48} className="mb-2 opacity-20" />
                  <p>Nenhum dado de coleta disponível.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;