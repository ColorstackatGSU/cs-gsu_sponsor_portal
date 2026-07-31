import { ORG } from '../data/org';

export default function Footer() {
  return (
    <footer
      className="portal-footer"
      style={{ borderTop: '1px solid var(--line)', padding: '32px 0', color: 'rgba(255, 255, 255, 0.45)' }}
    >
      <div
        className="container-wide"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        <span>{ORG.legalName}</span>
        <a href={`mailto:${ORG.billingEmail}`} style={{ color: 'var(--gsu-sky)' }}>
          {ORG.billingEmail}
        </a>
      </div>
    </footer>
  );
}
