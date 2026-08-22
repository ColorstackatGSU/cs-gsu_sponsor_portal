import { ENV_VARS } from '../lib/env';

/**
 * What renders instead of the app when a required VITE_ var is missing.
 *
 * This exists because the alternative is a blank white page: the vars are read
 * at module scope, and anything that throws there takes the import graph down
 * before React mounts. A developer who has just cloned the repo then sees
 * nothing at all unless they happen to open the console.
 *
 * Only ever shown to whoever is running the app, never to a sponsor, so it says
 * exactly which var is missing and what to do about it.
 */
export default function ConfigNeeded() {
  return (
    <div className="shell shell-auth">
      <main className="auth-pane">
        <div className="auth-pane-inner" style={{ maxWidth: 640 }}>
          <header className="auth-head">
            <span className="eyebrow">Local setup</span>
            <h1>Add your env file</h1>
            <p className="page-sub">
              The portal reads Supabase and API settings from a <code className="num">.env.local</code> file
              that is deliberately not committed. Create one in the project root and restart
              the dev server.
            </p>
          </header>

          <section className="card card-flush">
            <div className="card-head">
              <span className="card-title">Required variables</span>
            </div>
            <div className="card-pad">
              <ul className="tasks">
                {ENV_VARS.map((v) => (
                  <li key={v.name} className="task">
                    <p className="task-title num">{v.name}</p>
                    <p className="task-body">{v.hint}</p>
                    <span className={v.value ? 'task-due' : 'task-due task-due-late'}>
                      {v.value ? 'Set' : 'Missing'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <div className="note note-info" style={{ marginTop: 22 }}>
            <strong>Quickest path:</strong> copy <code className="num">.env.example</code> to{' '}
            <code className="num">.env.local</code>, fill in the three values, then run{' '}
            <code className="num">npm run dev</code> again. Vite only reads env files at
            startup, so a running server will not pick the file up on its own.
          </div>
        </div>
      </main>
    </div>
  );
}
