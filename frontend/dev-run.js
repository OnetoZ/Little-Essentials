import { spawn } from 'child_process';

console.log('\x1b[36m%s\x1b[0m', '🚀 Starting Little Essentials Dev Environment (Frontend + Backend API)...');

// Spawn the Express backend server
const server = spawn('node', ['server.js'], { stdio: 'inherit', shell: true });

// Spawn the Vite frontend dev server
const vite = spawn('npx', ['vite'], { stdio: 'inherit', shell: true });

// Forward termination signals to child processes
const killAll = () => {
  server.kill('SIGINT');
  vite.kill('SIGINT');
};

process.on('SIGINT', () => {
  killAll();
  process.exit(0);
});

process.on('SIGTERM', () => {
  killAll();
  process.exit(0);
});

process.on('exit', () => {
  killAll();
});
