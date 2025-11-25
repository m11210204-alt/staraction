
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { type ConstellationData, type User } from "./types";
import { mockConstellations } from "./data/mockData";
import { actionsApi, authApi } from "./lib/api";
import { type JoinFormData } from "./components/JoinActionModal";

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
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem("token"));
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
    () => ["All", ...Array.from(new Set(constellations.map((c) => c.category)))],
    [constellations]
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

    const width = typeof window !== "undefined" ? window.innerWidth : 1000;
    const height = typeof window !== "undefined" ? window.innerHeight : 800;
    const centerX = width / 2;
    const centerY = height / 2 - 80;

    const cols = Math.ceil(Math.sqrt(num));
    const rows = Math.ceil(num / cols);

    const horizontalSpacing = Math.min(
      300,
      (width * 0.8) / cols
    );
    const verticalSpacing = Math.min(
      300,
      (height * 0.7) / rows
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

  useEffect(() => {
    const bootstrap = async () => {
      if (authToken && !currentUser) {
        try {
          const me = await authApi.me(authToken);
          setCurrentUser(me);
        } catch (err) {
          console.warn("Restore session failed", err);
          setAuthToken(null);
          localStorage.removeItem("token");
        }
      }
    };
    void bootstrap();
  }, [authToken, currentUser]);

  useEffect(() => {
    const loadActions = async () => {
      try {
        const data = await actionsApi.list(authToken ?? undefined);
        setConstellations(data);
      } catch (err) {
        console.warn("載入行動列表失敗，使用預設資料", err);
        setConstellations(mockConstellations);
      }
    };
    void loadActions();
  }, [authToken]);

  useEffect(() => {
    const loadInterested = async () => {
      if (!authToken) {
        setInterestedActionIds([]);
        return;
      }
      try {
        const ids = await actionsApi.interestedList(authToken);
        setInterestedActionIds(ids);
      } catch (err) {
        console.warn("載入收藏列表失敗", err);
      }
    };
    void loadInterested();
  }, [authToken]);

  // Auth Handlers
  const handleLogin = (user: User, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    localStorage.setItem("token", token);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem("token");
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

  const toActionPayload = (action: ConstellationData) => ({
    name: action.name,
    category: action.category,
    region: action.region,
    status: action.status,
    summary: action.summary,
    background: action.background,
    goals: action.goals,
    howToParticipate: action.howToParticipate,
    participationTags: action.participationTags,
    maxParticipants: action.maxParticipants,
    shapePoints: action.shapePoints,
    updates: action.updates,
    sroiReport: action.sroiReport,
    initiator: action.initiator,
  });

  const handleCreateAction = async (newAction: ConstellationData) => {
    try {
      if (authToken) {
        const res = await actionsApi.create(toActionPayload(newAction), authToken);
        const created = res.action as ConstellationData;
        setConstellations((prev) => [created, ...prev]);
      } else {
        if (currentUser) {
          newAction.ownerId = currentUser.id;
          newAction.initiator = currentUser.name;
        }
        setConstellations((prev) => [newAction, ...prev]);
      }
    } catch (err) {
      alert((err as Error).message || '建立行動失敗');
    }
  };

  const handleUpdateAction = async (updatedAction: ConstellationData) => {
    try {
      if (authToken) {
        const res = await actionsApi.update(
          updatedAction.id,
          toActionPayload(updatedAction),
          authToken,
        );
        const patched = (res.action as ConstellationData) || updatedAction;
        setConstellations((prev) =>
          prev.map((c) => (c.id === patched.id ? { ...c, ...patched } : c)),
        );
        if (selectedConstellation?.id === patched.id) {
          setSelectedConstellation(patched);
        }
      } else {
        setConstellations((prev) =>
          prev.map((c) => (c.id === updatedAction.id ? updatedAction : c)),
        );
        if (selectedConstellation?.id === updatedAction.id) {
          setSelectedConstellation(updatedAction);
        }
      }
    } catch (err) {
      alert((err as Error).message || '更新行動失敗');
    }
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

  const toggleInterestedAction = async (actionId: string) => {
    if (!authToken) {
      setIsLoginModalOpen(true);
      return;
    }
    try {
      const result = await actionsApi.interact(actionId, 'interested', authToken);
      setInterestedActionIds(result.interestedIds || []);
    } catch (err) {
      alert((err as Error).message || '收藏操作失敗');
    }
  };

  const handleDeleteAction = (actionId: string) => {
    setConstellations(prev => prev.filter(c => c.id !== actionId));
    if (selectedConstellation?.id === actionId) {
      setSelectedConstellation(null);
    }
  };

  const handleArchiveAction = (actionId: string) => {
    setConstellations(prev =>
      prev.map(c =>
        c.id === actionId ? { ...c, status: ActionStatus.COMPLETED } : c,
      ),
    );
    if (selectedConstellation?.id === actionId) {
      setSelectedConstellation({
        ...selectedConstellation,
        status: ActionStatus.COMPLETED,
      });
    }
  };

  const handleJoinAction = async (actionId: string, formData: JoinFormData) => {
    if (!authToken) {
      setIsLoginModalOpen(true);
      return null;
    }
    try {
      const res = await actionsApi.join(actionId, formData, authToken);
      let updatedAction: ConstellationData | null = null;
      setConstellations(prev =>
        prev.map(c => {
          if (c.id !== actionId) return c;
          const patched = {
            ...c,
            participants: [
              ...c.participants,
              {
                id: currentUser!.id,
                key: `${currentUser!.id}-${actionId}`,
                pointIndex: res.pointIndex,
              },
            ],
          };
          updatedAction = patched;
          return patched;
        }),
      );
      if (updatedAction) {
        setSelectedConstellation(updatedAction);
      }
      return updatedAction;
    } catch (err) {
      alert((err as Error).message || '加入失敗');
      return null;
    }
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
          onDeleteAction={handleDeleteAction}
          onArchiveAction={handleArchiveAction}
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
          onUpdateAction={handleUpdateAction}
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
          onJoinAction={handleJoinAction}
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
