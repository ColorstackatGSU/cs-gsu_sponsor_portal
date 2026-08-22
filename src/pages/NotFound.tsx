import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page">
      <div className="wrap-narrow" style={{ textAlign: 'center', paddingTop: 24 }}>
        <p className="notfound-code">404</p>
        <h1>Page not found</h1>
        <p className="page-sub" style={{ margin: '14px auto 24px' }}>
          That page doesn't exist, or it hasn't been built yet.
        </p>
        <Link to="/dashboard" className="btn btn-primary">Back to the portal</Link>
      </div>
    </div>
  );
}
