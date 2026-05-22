'use client';
import { useEffect, useRef } from 'react';
import { useAssessmentStore } from '@/store/assessmentStore';
import { JobUpdate } from '@/types';

export function useWebSocket(assignmentId?: string | null) {
  const { setJob, setWsConnected, addPaper } = useAssessmentStore();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;

    function connect() {
      if (socketRef.current) {
        if (
          socketRef.current.readyState === WebSocket.OPEN ||
          socketRef.current.readyState === WebSocket.CONNECTING
        ) {
          return;
        }
      }

      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/ws';
      const url = assignmentId ? `${wsUrl}?assignmentId=${assignmentId}` : wsUrl;

      console.log(`Connecting to WebSocket: ${url}`);
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        if (!isMounted) {
          ws.close();
          return;
        }
        setWsConnected(true);
        console.log('WebSocket connection opened');
      };

      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const msg: JobUpdate = JSON.parse(event.data);

          if (msg.type === 'job_update' && msg.data) {
            const { status, progress, message, result, error, jobId, assignmentId: aId } = msg.data;

            setJob({ status, progress, message, error: error || null, jobId, assignmentId: aId });

            if (status === 'completed' && result) {
              addPaper(result);
              setJob({ result });
            }
          }
        } catch (e) {
          console.error('WebSocket parse error:', e);
        }
      };

      ws.onclose = (event) => {
        if (!isMounted) return;
        setWsConnected(false);
        console.log(`WebSocket connection closed (code: ${event.code})`);
        
        if (event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMounted) connect();
          }, 3000);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
      };
    }

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close(1000);
        socketRef.current = null;
      }
    };
  }, [assignmentId, setJob, setWsConnected, addPaper]);

  return { ws: socketRef.current };
}

