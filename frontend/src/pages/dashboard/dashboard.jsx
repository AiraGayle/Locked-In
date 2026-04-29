import { useState, useEffect } from 'react';
import RoomCard from '../../components/room-card/RoomCard.jsx';
import RoomModal from '../../modals/RoomModal.jsx';
import { getRooms, createRoom, joinRoom } from '../../services/room.js';
import { getStats } from '../../services/session.js';
import { logout } from '../../services/auth-service.js';
import { formatDuration } from '../../utils/time.js';
import { useActiveSessions } from '../../hooks/active-session.js';
import './dashboard.css';

const StatCard = ({ label, value }) => (
  <div className="dashboard-page__stat-card">
    <span className="dashboard-page__stat-value">{value}</span>
    <span className="dashboard-page__stat-label">{label}</span>
  </div>
);

const DashboardPage = ({ user, onLogout, onNavigate }) => {
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState('');
  const [isShowingCreateModal, setIsShowingCreateModal] = useState(false);
  const [isShowingJoinModal, setIsShowingJoinModal] = useState(false);
  const { activeSessions } = useActiveSessions();
  const onClose = () => {
    setIsShowingCreateModal(false);
    setIsShowingJoinModal(false);
  };

  const fetchRooms = async () => {
    try {
      const data = await getRooms();
      setRooms(data);
    } catch (err) {
      setError('Failed to load rooms');
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch {
      // stats failing silently is fine
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchStats();
  }, []);

  const handleCreate = async (name) => {
    const room = await createRoom(name);
    setRooms((prev) => [room, ...prev]);
  };

  const handleJoin = async (inviteCode) => {
    const room = await joinRoom(inviteCode);
    setRooms((prev) => {
      const alreadyIn = prev.some((r) => r.id === room.id);
      return alreadyIn ? prev : [room, ...prev];
    });
  };

  const handleEnterRoom = (room) => {
    onNavigate(`/room/${room.id}`);
  };

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  const totalFocusSeconds = stats
    ? Math.floor(Number(stats.total_focus_time?.seconds || 0))
    : 0;

  return (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <h1 className="dashboard-page__logo">Focus Room</h1>
        <div className="dashboard-page__header-actions">
          <button className="dashboard-page__nav-btn" onClick={() => onNavigate('/stats')}>
            Stats
          </button>
          <button className="dashboard-page__logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-page__main">
        <p className="dashboard-page__welcome">Welcome back, {user.username}</p>

        <section className="dashboard-page__stats-section">
          <StatCard
            label="Total focus time"
            value={isLoadingStats ? '—' : formatDuration(totalFocusSeconds)}
          />
          <StatCard
            label="Sessions completed"
            value={isLoadingStats ? '—' : stats?.sessions_completed ?? 0}
          />
          <StatCard
            label="Longest streak"
            value={isLoadingStats ? '—' : `${stats?.longest_streak ?? 0} days`}
          />
        </section>

        <section className="dashboard-page__rooms-section">
          <div className="dashboard-page__rooms-header">
            <h2 className="dashboard-page__rooms-title">Your rooms</h2>
            <div className="dashboard-page__rooms-actions">
              <button
                className="dashboard-page__join-btn"
                onClick={() => setIsShowingJoinModal(true)}
              >
                Join room
              </button>
              <button
                className="dashboard-page__create-btn"
                onClick={() => setIsShowingCreateModal(true)}
              >
                + Create room
              </button>
            </div>
          </div>

          {error && <p className="dashboard-page__error">{error}</p>}

          {isLoadingRooms ? (
            <div className="dashboard-page__loading">Loading rooms...</div>
          ) : rooms.length === 0 ? (
            <div className="dashboard-page__empty">
              <p>No rooms yet. Create one or join with an invite code.</p>
            </div>
          ) : (
            <div className="dashboard-page__rooms-grid">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onJoin={handleEnterRoom}
                  activeUserTimer={activeSessions[room.id]}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {isShowingCreateModal && (
        <RoomModal
          mode="create"
          onClose={onClose}
          onSubmit={handleJoin}
        />
      )}

      {isShowingJoinModal && (
        <RoomModal
          mode="join"
          onClose={onClose}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
};

export default DashboardPage;