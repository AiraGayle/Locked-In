import { useState, useEffect } from 'react';
import { getRooms, createRoom, joinRoom } from '../../services/room-service.js';
import { getStats } from '../../services/session-service.js';
import { logout } from '../../services/auth-service.js';
import { formatDuration } from '../../utils/date-utils.js';
import { useOnlineStatus } from '../../hooks/useOnlineStatus.js';
import { saveRooms, getRooms as getCachedRooms, addToSyncQueue } from '../../lib/offlineDB.js';
import { processSyncQueue } from '../../utils/sw-utils.js';
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
  const isOnline = useOnlineStatus();

  const fetchRooms = async () => {
    try {
      if (isOnline) {
        const data = await getRooms();
        setRooms(data);
        await saveRooms(data); // cache for offline
      } else {
        const cached = await getCachedRooms();
        setRooms(cached);
      }
    } catch (err) {
      // fallback to cache if online fetch fails
      const cached = await getCachedRooms();
      if (cached.length > 0) {
        setRooms(cached);
      } else {
        setError('Failed to load rooms');
      }
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
  }, [isOnline]);


  useEffect(() => {
    if (!isOnline) return;

    const sync = async () => {
      const results = await processSyncQueue();
      if (results.some((r) => r.result)) {
        await fetchRooms();
      }
      const failed = results.filter((r) => r.error);
      if (failed.length > 0) {
        setError(`${failed.length} offline action(s) failed to sync. Try again.`);
      }
    };

  sync();
}, [isOnline]); 

  const handleJoin = async (inviteCode) => {
    if (isOnline) {
      const room = await joinRoom(inviteCode);
      setRooms((prev) => {
        const alreadyIn = prev.some((r) => r.id === room.id);
        return alreadyIn ? prev : [room, ...prev];
      });
    } else {
      await addToSyncQueue({ type: 'JOIN_ROOM', payload: { inviteCode } });
      setError('You are offline. Will join room when back online.');
    }
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
        {!isOnline && (
          <div className="dashboard-page__offline-banner">
            ⚠️ You are offline. Showing cached data.
          </div>
        )}

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
                <div key={room.id} onClick={() => handleEnterRoom(room)}
                  style={{padding:'1rem', border:'1px solid #ccc', borderRadius:'8px', cursor:'pointer'}}>
                  <strong>{room.name}</strong>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {isShowingCreateModal && (
        <CreateRoomModal
          onClose={() => setIsShowingCreateModal(false)}
          onCreate={handleCreate}
        />
      )}

      {isShowingJoinModal && (
        <JoinRoomModal
          onClose={() => setIsShowingJoinModal(false)}
          onJoin={handleJoin}
        />
      )}
    </div>
  );
};

export default DashboardPage;