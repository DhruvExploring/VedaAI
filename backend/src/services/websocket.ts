import { WebSocket, WebSocketServer } from 'ws';
import { JobState } from '../types';
import { logger } from './logger';

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Set<WebSocket>> = new Map();

  init(wss: WebSocketServer) {
    this.wss = wss;

    wss.on('connection', (ws: WebSocket, req) => {
      const url = new URL(req.url || '', `http://localhost`);
      const assignmentId = url.searchParams.get('assignmentId') || 'global';

      if (!this.clients.has(assignmentId)) {
        this.clients.set(assignmentId, new Set());
      }
      this.clients.get(assignmentId)!.add(ws);

      logger.info(`WS client connected for assignmentId: ${assignmentId}`);

      ws.on('close', () => {
        this.clients.get(assignmentId)?.delete(ws);
        logger.info(`WS client disconnected for assignmentId: ${assignmentId}`);
      });

      ws.on('error', (err) => {
        logger.error(`WS error for assignmentId ${assignmentId}`, err);
        this.clients.get(assignmentId)?.delete(ws);
      });

      // Send initial connection confirmation
      ws.send(JSON.stringify({ type: 'connected', assignmentId }));
    });
  }

  broadcast(assignmentId: string, data: JobState) {
    const message = JSON.stringify({ type: 'job_update', data });

    // Send to specific assignment listeners
    const assignmentClients = this.clients.get(assignmentId);
    if (assignmentClients) {
      assignmentClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }

    // Also send to global listeners
    const globalClients = this.clients.get('global');
    if (globalClients) {
      globalClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  broadcastAll(data: object) {
    const message = JSON.stringify(data);
    this.clients.forEach((clientSet) => {
      clientSet.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });
  }
}

export const wsManager = new WebSocketManager();
