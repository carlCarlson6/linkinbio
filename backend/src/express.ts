import express from 'express';
import path from 'path';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter, createContext } from './trpc.js';

const app = express();

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

app.use(express.json());

// Protect all API routes with Clerk authentication
app.use('/api', ClerkExpressRequireAuth());

// tRPC setup
app.use('/api/trpc', trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext,
}));

// Example protected API route
app.get('/api/protected', (req, res) => {
  res.json({ message: 'You are authenticated with Clerk!' });
});

// Serve static files from the frontend build
const frontendBuildPath = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendBuildPath));

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

export default app;
