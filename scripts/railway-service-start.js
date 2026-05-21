/**
 * Railway: both services can share railway.toml + this start command.
 * Detects web vs bot from SERVICE env or RAILWAY_SERVICE_NAME.
 */
import { spawn } from 'child_process';

function detectService() {
  const explicit = (process.env.SERVICE || '').toLowerCase();
  if (explicit === 'web' || explicit === 'bot') return explicit;

  const name = (process.env.RAILWAY_SERVICE_NAME || '').toLowerCase();
  if (name.includes('web')) return 'web';
  if (name.includes('bot') || name.includes('discord')) return 'bot';

  return 'bot';
}

const service = detectService();
const args =
  service === 'web'
    ? ['run', 'start', '-w', '@jjk/web']
    : ['run', 'start', '-w', '@jjk/discord-bot'];

console.log(
  `Railway start: ${service} (SERVICE=${process.env.SERVICE || '-'} RAILWAY_SERVICE_NAME=${process.env.RAILWAY_SERVICE_NAME || '-'})`
);

const child = spawn('npm', args, { stdio: 'inherit', shell: true, env: process.env });
child.on('exit', (code) => process.exit(code ?? 1));
