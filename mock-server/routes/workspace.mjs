import { Router } from 'express';
import { db, notFound, resetDb } from '../lib/db.mjs';

export const workspaceRouter = Router();

workspaceRouter.get('/me', (_req, res) => {
  res.json(db.session);
});

workspaceRouter.get('/notifications', (_req, res) => {
  const sorted = [...db.notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json(sorted);
});

workspaceRouter.patch('/notifications/:id/read', (req, res) => {
  const notification = db.notifications.find((n) => n.id === req.params.id);
  if (!notification) return notFound(res, 'Notification');
  notification.read = true;
  res.json(notification);
});

workspaceRouter.post('/notifications/read-all', (_req, res) => {
  db.notifications.forEach((n) => (n.read = true));
  res.status(204).end();
});

/** Restore the seed dataset without restarting the mock server. */
workspaceRouter.post('/__reset', (_req, res) => {
  resetDb();
  res.status(204).end();
});

workspaceRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});
