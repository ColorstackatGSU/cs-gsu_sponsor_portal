/**
 * The solid GSU blue field the sign-in and activation cards float over.
 *
 * The member portal uses a photo mosaic here. This portal has no photo set of its
 * own, so it uses the brand colour flat. The two orbs are the only modulation and
 * they are both GSU blues, so the field never drifts off-brand. Purely decorative,
 * so it is aria-hidden and takes no pointer events.
 */
export default function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop-orb backdrop-orb-a" />
      <div className="backdrop-orb backdrop-orb-b" />
    </div>
  );
}
