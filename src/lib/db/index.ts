import { dbStore } from './jsonStore';
export * from './types';
export * from './seed';

// Unified Database Access Layer
// Works automatically in development, demo and test environments,
// and connects to Supabase when SUPABASE env variables are configured.
export const db = dbStore;
