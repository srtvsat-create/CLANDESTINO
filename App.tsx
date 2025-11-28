import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Collection from './pages/Collection';
import UsersPage from './pages/Users';
import Reports from './pages/Reports';
import { AppState, User, PhotoEntry, UserRole } from './types';

// Mock Initial Data
const INITIAL_USERS: User[] = [
  { 
    id: '1', 
    name: 'Ana Souza', 
    email: 'ana@fotoflow.ai', 
    role: UserRole.ADMIN, 
    avatar: 'https://picsum.photos/seed/ana/200', 
    status: 'active',
    createdAt: Date.now() - 10000000,
    accessLogs: [
        Date.now() - 120000, 
        Date.now() - 86400000, 
        Date.now() - 172800000
    ]
  },
  { 
    id: '2', 
    name: 'Carlos Lima', 
    email: 'carlos@fotoflow.ai', 
    role: UserRole.COLLECTOR, 
    avatar: 'https://picsum.photos/seed/carlos/200', 
    status: 'active',
    createdAt: Date.now() - 5000000,
    accessLogs: [
        Date.now() - 3600000, 
        Date.now() - 4000000
    ]
  },
  { 
    id: '3', 
    name: 'Beatriz Silva', 
    email: 'bia@fotoflow.ai', 
    role: UserRole.VIEWER, 
    avatar: 'https://picsum.photos/seed/bia/200', 
    status: 'pending', // Example of a pending user
    createdAt: Date.now() - 3600000,
    accessLogs: []
  },
];

const INITIAL_PHOTOS: PhotoEntry[] = [
    { 
      id: '101', 
      url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', 
      timestamp: Date.now() - 86400000, 
      userId: '2', 
      description: 'Veículo em bom estado de conservação, leve arranhão no para-choque.', 
      tags: ['sedan', 'prata', 'vistoria'],
      vehicleModel: 'Toyota Corolla',
      licensePlate: 'ABC-1234'
    },
    { 
      id: '102', 
      url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80', 
      timestamp: Date.now() - 172800000, 
      userId: '2', 
      description: 'Pneu dianteiro esquerdo com desgaste irregular.', 
      tags: ['manutenção', 'pneus', 'alinhamento'],
      vehicleModel: 'Honda Civic',
      licensePlate: 'XYZ-9876'
    },
    { 
      id: '103', 
      url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80', 
      timestamp: Date.now() - 3600000, 
      userId: '1', 
      description: 'SUV limpo e pronto para entrega.', 
      tags: ['suv', 'limpeza', 'entrega'],
      vehicleModel: 'Jeep Compass',
      licensePlate: 'JEP-5544'
    },
];

const App: React.FC = () => {
  // Explicitly set Dashboard as the initial page
  const [activePage, setActivePage] = useState('dashboard');
  
  // State
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [photos, setPhotos] = useState<PhotoEntry[]>(INITIAL_PHOTOS);

  // Calculated state for notifications
  const pendingUserCount = users.filter(u => u.status === 'pending').length;
  
  // Mock current user (Safe fallback)
  // In a real app, this would be determined by authentication
  const currentUser = users.length > 0 ? users[0] : {
    id: 'admin-fallback',
    name: 'Admin Sistema',
    email: 'admin@system',
    role: UserRole.ADMIN,
    avatar: '',
    status: 'active',
    createdAt: Date.now()
  } as User;

  // Update document title based on active page
  useEffect(() => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard - cland Photo',
      collection: 'Coleta - cland Photo',
      users: 'Usuários - cland Photo',
      reports: 'Relatórios - cland Photo'
    };
    document.title = titles[activePage] || 'cland Photo';
  }, [activePage]);

  // Actions
  const handleAddPhoto = (photo: PhotoEntry) => {
    setPhotos(prev => [...prev, photo]);
    setActivePage('reports'); 
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleAddUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const handleRemoveUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleUpdateUserStatus = (id: string, status: User['status']) => {
    setUsers(prev => prev.map(u => 
        u.id === id ? { ...u, status } : u
    ));
  };

  // Super Admin Actions
  const handleAddAdmin = (name: string, email: string) => {
    const newAdmin: User = {
      id: crypto.randomUUID(),
      name,
      email,
      role: UserRole.ADMIN,
      avatar: `https://picsum.photos/seed/${encodeURIComponent(name)}/200`,
      status: 'active',
      createdAt: Date.now(),
      accessLogs: []
    };
    setUsers(prev => [...prev, newAdmin]);
  };

  const handleClearData = () => {
    setPhotos([]);
    // Reset users but keep the initial admin to prevent lockout in this demo environment
    setUsers([INITIAL_USERS[0]]); 
  };

  // Render Page
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard photos={photos} users={users} />;
      case 'collection':
        return <Collection onAddPhoto={handleAddPhoto} userId={currentUser.id} />;
      case 'users':
        return <UsersPage users={users} onAddUser={handleAddUser} onRemoveUser={handleRemoveUser} onUpdateUserStatus={handleUpdateUserStatus} />;
      case 'reports':
        return <Reports photos={photos} users={users} onRemovePhoto={handleRemovePhoto} />;
      default:
        // Default fallback is always Dashboard
        return <Dashboard photos={photos} users={users} />;
    }
  };

  return (
    <Layout 
      activePage={activePage} 
      onNavigate={setActivePage}
      onAddAdmin={handleAddAdmin}
      onClearData={handleClearData}
      pendingUserCount={pendingUserCount}
      currentUser={currentUser}
    >
      {renderPage()}
    </Layout>
  );
};

export default App;