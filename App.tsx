
import React, { useState, useMemo, useCallback } from "react";
import { type ConstellationData, type User } from "./types";
import { mockConstellations } from "./data/mockData";

import Header from "./components/Header";
import StarfieldBackground from "./components/StarfieldBackground";
import Constellation from "./components/Constellation";
import FilterControls from "./components/FilterControls";
import ActionDetailCard from "./components/ActionDetailCard";
import ActionPage from "./components/ActionPage";
import InitiateActionForm from "./components/InitiateActionForm";
import ParticipatedActionsPage from "./components/ParticipatedActionsPage";
import InterestedActionsPage from "./components/InterestedActionsPage";
import LoginModal from "./components/LoginModal";


const App: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [constellations, setConstellations] = useState<ConstellationData[]>(mockConstellations);
  const [selectedConstellation, setSelectedConstellation] = useState<ConstellationData | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  
  const [currentPage, setCurrentPage] = useState<'home' | 'action' | 'participated' | 'interested'>('home');
  const [actionPageFilter, setActionPageFilter] = useState<'all' | 'mine'>('all');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [actionToEdit, setActionToEdit] = useState<ConstellationData | null>(null);
  const [interestedActionIds, setInterestedActionIds] = useState<string[]>([]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(mockConstellations.map((c) => c.category)))],
    []
  );

  const filteredConstellations = useMemo(() => {
    if (activeFilter === "All") {
      return constellations;
    }
    return constellations.filter((c) => c.category === activeFilter);
  }, [constellations, activeFilter]);

  const constellationPositions = useMemo(() => {
    const positions: { [key: string]: { top: string; left: string; transform: string } } = {};
    if (currentPage !== 'home') return {};
    
    const num = filteredConstellations.length;
    if (num === 0) return {};

    const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 500;
    const centerY = typeof window !== "undefined" ? window.innerHeight / 2 - 80 : 320;

    const cols = Math.ceil(Math.sqrt(num));
    const rows = Math.ceil(num / cols);

    const horizontalSpacing = Math.min(
      300,
      ((typeof window !== "undefined" ? window.innerWidth : 1000) * 0.8) / cols
    );
    const verticalSpacing = Math.min(
      300,
      ((typeof window !== "undefined" ? window.innerHeight : 800) * 0.7) / rows
    );

    const gridWidth = (cols - 1) * horizontalSpacing;
    const gridHeight = (rows - 1) * verticalSpacing;
    const startX = centerX - gridWidth / 2;
    const startY = centerY - gridHeight / 2;

    filteredConstellations.forEach((c, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * horizontalSpacing;
      const y = startY + row * verticalSpacing;
      positions[c.id] = {
        top: `${y}px`,
        left: `${x}px`,
        transform: `translate(-50%, -50%)`,
      };
    });

    return positions;
  }, [filteredConstellations, currentPage]);

  // Auth Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('home'); // Redirect to home on logout
  };

  const handleSelectConstellation = useCallback((constellation: ConstellationData) => {
    setSelectedConstellation(constellation);
  }, []);

  const handleCloseCard = useCallback(() => {
    setSelectedConstellation(null);
  }, []);
  
  const handleNavigate = (page: 'home' | 'action' | 'participated' | 'interested', filter: 'all' | 'mine' = 'all') => {
    setCurrentPage(page);
    if (page === 'action') {
        setActionPageFilter(filter);
    }
  };

  const handleUpdateConstellation = (updatedData: ConstellationData) => {
    setConstellations((prev) => prev.map((c) => (c.id === updatedData.id ? updatedData : c)));
    if (selectedConstellation?.id === updatedData.id) {
      setSelectedConstellation(updatedData);
    }
  };
  
  const handleCreateAction = (newAction: ConstellationData) => {
    if (currentUser) {
        newAction.ownerId = currentUser.id;
        newAction.initiator = currentUser.name;
    }
    setConstellations(prev => [newAction, ...prev]);
  };
  
  const handleInitiateAction = () => {
    if (!currentUser) {
        setIsLoginModalOpen(true);
        return;
    }
    setActionToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditAction = (action: ConstellationData) => {
    setActionToEdit(action);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setActionToEdit(null);
  }

  const toggleInterestedAction = (actionId: string) => {
    setInterestedActionIds(prev =>
      prev.includes(actionId)
        ? prev.filter(id => id !== actionId)
        : [...prev, actionId]
    );
  };

  const renderHomePage = () => (
    <>
      <StarfieldBackground />
      <main className="relative w-full h-screen z-10 flex flex-col justify-center items-center">
        <div className="w-full h-full relative z-10">
          {constellations.map((constellation) => {
            const isVisible = filteredConstellations.some((c) => c.id === constellation.id);
            const style = constellationPositions[constellation.id] || {
              top: "50%",
              left: "50%",
              opacity: 0,
              transform: "translate(-50%, -50%) scale(0)",
            };
            return (
              <div
                key={constellation.id}
                className="transition-all duration-1000 ease-in-out absolute"
                style={{
                  ...style,
                  opacity: isVisible ? 1 : 0,
                  transitionProperty: "top, left, transform, opacity",
                }}
              >
                <Constellation data={constellation} onSelect={() => handleSelectConstellation(constellation)} />
              </div>
            );
          })}
        </div>

        <div
          className="absolute bottom-[-35vh] left-0 w-full h-[80vh] z-0 bg-no-repeat bg-cover bg-center opacity-90"
          style={{
            backgroundImage: "url('https://i.postimg.cc/dtz3MQqd/earth-from-space.png')",
            backgroundPosition: "center 90%",
            maskImage: "linear-gradient(to top, black 65%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to top, black 70%, transparent 100%)",
            filter: "brightness(1.15) saturate(1.1)",
            transition: "opacity 1s ease-in-out",
          }}
        />

        <div className="absolute bottom-[5vh] left-1/2 -translate-x-1/2 z-20">
          <FilterControls
            categories={categories}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>
      </main>
    </>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden relative">
      <Header 
        user={currentUser}
        onNavigate={handleNavigate} 
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {currentPage === 'home' && renderHomePage()}
      {currentPage === 'action' && (
        <ActionPage 
          allConstellations={constellations} 
          filter={actionPageFilter}
          onInitiateAction={handleInitiateAction}
          onViewAction={handleSelectConstellation}
          onEditAction={handleEditAction}
          currentUser={currentUser}
        />
      )}
      {currentPage === 'participated' && currentUser && (
        <ParticipatedActionsPage
          allConstellations={constellations}
          onViewAction={handleSelectConstellation}
          currentUserId={currentUser.id}
        />
      )}
      {currentPage === 'interested' && (
        <InterestedActionsPage
          allConstellations={constellations}
          interestedActionIds={interestedActionIds}
          onViewAction={handleSelectConstellation}
        />
      )}
      
      {isFormOpen && (
        <InitiateActionForm 
          onClose={handleCloseForm}
          onCreateAction={handleCreateAction}
          onUpdateAction={handleUpdateConstellation}
          actionToEdit={actionToEdit}
        />
      )}

      {selectedConstellation && (
        <ActionDetailCard
          key={selectedConstellation.id}
          data={selectedConstellation}
          onClose={handleCloseCard}
          onUpdateConstellation={handleUpdateConstellation}
          interestedActionIds={interestedActionIds}
          onToggleInterested={toggleInterestedAction}
          currentUser={currentUser}
          onLoginRequest={() => setIsLoginModalOpen(true)}
        />
      )}

      {isLoginModalOpen && (
        <LoginModal 
            onClose={() => setIsLoginModalOpen(false)}
            onLogin={handleLogin}
        />
      )}
    </div>
  );
};

export default App;
