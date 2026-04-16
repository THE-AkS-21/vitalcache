"use client";

import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { api } from '@/lib/api/http';

export function ServerStatus() {
    const [isOnline, setIsOnline] = useState(true);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        const checkServer = async () => {
            setIsChecking(true);
            try {
                // A lightweight ping to the backend. It doesn't matter if it returns 401/404,
                // as long as we get an HTTP response, the server is ALIVE.
                await api.get('/', { timeout: 3000 });
                setIsOnline(true);
            } catch (error: any) {
                // If we get a network error or timeout, the server is DOWN
                if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
                    setIsOnline(false);
                } else {
                    // It returned an error (like 401 Unauthorized), but it IS alive!
                    setIsOnline(true);
                }
            } finally {
                setIsChecking(false);
            }
        };

        // Check immediately, then every 15 seconds
        checkServer();
        const interval = setInterval(checkServer, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg rounded-full text-sm font-medium transition-all">
            {isOnline ? (
                <>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
                    <span className="text-gray-700">Server Online</span>
                </>
            ) : (
                <>
                    <WifiOff size={14} className="text-red-500" />
                    <span className="text-red-600">Server Offline</span>
                </>
            )}
        </div>
    );
}