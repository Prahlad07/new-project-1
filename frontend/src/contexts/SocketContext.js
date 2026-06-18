import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { USE_MOCK } from '../services/api';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      return;
    }

    if (USE_MOCK) {
      const mockSocket = {
        on: (event, cb) => {
          if (!mockSocket.listeners[event]) mockSocket.listeners[event] = [];
          mockSocket.listeners[event].push(cb);
        },
        emit: (event, data) => {
          mockSocket.listeners[event]?.forEach(cb => cb(data));
        },
        disconnect: () => {
          clearInterval(mockSocket.intervalId);
        },
        listeners: {}
      };

      // Emit simulated real-time alerts periodically to show off reactive UI toasts
      mockSocket.intervalId = setInterval(() => {
        const rand = Math.random();
        if (rand < 0.4) {
          const alertData = {
            type: 'critical_complaint',
            title: 'Critical Escalation Alert',
            message: 'Sewage overflow near Karol Bagh market flagged as critical hazard.',
            createdAt: new Date().toISOString()
          };
          mockSocket.emit('notification', alertData);
        } else if (rand < 0.7) {
          const alertData = {
            type: 'new_assignment',
            title: 'New Automated Task Assignment',
            message: 'Defunct high-mast streetlight ticket in Saket auto-assigned to you.',
            createdAt: new Date().toISOString()
          };
          mockSocket.emit('notification', alertData);
        }
      }, 50000);

      socketRef.current = mockSocket;
      setSocket(mockSocket);

      mockSocket.on('notification', (data) => {
        setUnreadCount((c) => c + 1);
        if (data.type === 'critical_complaint') {
          toast.error(`🚨 ${data.title}: ${data.message}`, { duration: 8000 });
          setCriticalAlerts((prev) => [data, ...prev.slice(0, 9)]);
        } else if (data.type === 'false_closure_alert') {
          toast.error(`⚠️ ${data.title}`, { duration: 6000 });
        } else if (data.type === 'verification_required') {
          toast(`✅ ${data.title}`, { duration: 8000 });
        } else if (data.type === 'new_assignment') {
          toast.success(`📋 ${data.title}`);
        } else {
          toast(data.title);
        }
      });

      return () => { mockSocket.disconnect(); };
    }

    const token = localStorage.getItem('token');
    const s = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
      auth: { token } // server reads this to join the per-user room
    });
    socketRef.current = s;
    setSocket(s);

    // Persistent, per-user notifications (replaces old ad-hoc event names)
    s.on('notification', (data) => {
      setUnreadCount((c) => c + 1);
      if (data.type === 'critical_complaint') {
        toast.error(`🚨 ${data.title}: ${data.message}`, { duration: 8000 });
        setCriticalAlerts((prev) => [data, ...prev.slice(0, 9)]);
      } else if (data.type === 'false_closure_alert') {
        toast.error(`⚠️ ${data.title}`, { duration: 6000 });
      } else if (data.type === 'verification_required') {
        toast(`✅ ${data.title}`, { duration: 8000 });
      } else if (data.type === 'new_assignment') {
        toast.success(`📋 ${data.title}`);
      } else {
        toast(data.title);
      }
    });

    // Broadcast events (not user-targeted)
    s.on('overdue_complaints', ({ count }) => {
      if (['cm', 'super_admin'].includes(user.role)) {
        toast.error(`⏰ ${count} complaint${count > 1 ? 's' : ''} just became overdue`);
      }
    });

    return () => { s.disconnect(); };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ socket, criticalAlerts, setCriticalAlerts, unreadCount, setUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
