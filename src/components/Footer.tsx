import { ORG } from '../data/org';

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot-inner">
        <span>{ORG.legalName}</span>
        <a href={`mailto:${ORG.billingEmail}`}>{ORG.billingEmail}</a>
      </div>
    </footer>
  );
}
