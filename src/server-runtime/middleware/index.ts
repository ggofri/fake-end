import express, { Application } from 'express';

export function setupMiddleware(app: Application): void {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
}
