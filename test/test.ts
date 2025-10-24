// test/test.ts
// Importe directement la source TypeScript pour les tests locaux
import halloweenify from '../src/index';

document.addEventListener('DOMContentLoaded', () => {
  const runBtn = document.getElementById('run') as HTMLButtonElement | null;
  runBtn?.addEventListener('click', () => {
    halloweenify({ force: true });
  });
});