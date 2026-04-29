import { useState, useEffect, useRef, useCallback } from 'react';
import { getSessions } from '../services/session.js';
import { isOnline } from '../utils/sw.js';

export const useActiveSessions = () => {
  const [activeSessions, setActiveSessions] = useState(() => {
    const stored = localStorage.getItem('activeSessions');
    return stored ? JSON.parse(stored) : {};
  });

  const storageTimerRef = useRef(null);

  const updateLocalStorage = useCallback((sessions) => {
    // Batch localStorage updates to avoid blocking on rapid changes
    if (storageTimerRef.current) clearTimeout(storageTimerRef.current);
    storageTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem('activeSessions', JSON.stringify(sessions));
      } catch (e) {
        console.error('Failed to save active sessions:', e);
      }
    }, 100);
  }, []);

  const fetchActiveSessions = useCallback(async () => {
    try {
      const sessions = await getSessions();
      const active = {};
      sessions.forEach((s) => {
        if (s.status === 'ongoing' || s.status === 'paused') {
          active[s.room_id] = {
            sessionId: s.id,
            targetSeconds: s.target_time_secs,
            startedAt: new Date(s.start_time).getTime(),
            status: s.status,
          };
        }
      });
      setActiveSessions(active);
      updateLocalStorage(active);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  }, [updateLocalStorage]);

  useEffect(() => {
    if (isOnline()) {
      fetchActiveSessions();
      // Increase polling interval from 30s to 60s for better mobile performance
      const interval = setInterval(fetchActiveSessions, 60000);
      return () => {
        clearInterval(interval);
        if (storageTimerRef.current) clearTimeout(storageTimerRef.current);
      };
    }
  }, [fetchActiveSessions]);

  const updateSessionTimer = useCallback((roomId, sessionData) => {
    setActiveSessions((prev) => {
      const updated = { ...prev, [roomId]: sessionData };
      updateLocalStorage(updated);
      return updated;
    });
  }, [updateLocalStorage]);

  const clearSessionTimer = useCallback((roomId) => {
    setActiveSessions((prev) => {
      const updated = { ...prev };
      delete updated[roomId];
      updateLocalStorage(updated);
      return updated;
    });
  }, [updateLocalStorage]);

  return { activeSessions, updateSessionTimer, clearSessionTimer, fetchActiveSessions };
};