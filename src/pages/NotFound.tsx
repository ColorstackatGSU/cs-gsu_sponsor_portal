import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page">
      <div className="wrap-narrow" style={{ textAlign: 'center' }}>
        <h1>Page not found</h1>
        <p className="muted" style={{ fontSize: 14, marginTop: 8 }}>
          That page doesn't exist, or it hasn't been built yet.
        </p>
        <Link to="/login" className="btn btn-secondary" style={{ marginTop: 20 }}>Back to sign in</Link>
      </div>
    </div>
  );
}
