import express from 'express';
import path from 'path';
import cors from 'cors';
import * as trpcExpress from '@trpc/server/adapters/express';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express';
import { beAppRouter, createTrpcContext } from 'trpc';

const app = express();

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Enable CORS for local frontend (adjust port if needed)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(clerkMiddleware());

// tRPC setup
app.use('/api/trpc', trpcExpress.createExpressMiddleware({
  router: beAppRouter,
  createContext: createTrpcContext,
}));

// Serve static files from the frontend build
const frontendBuildPath = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendBuildPath));

app.get('/', (_, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

export default app;
