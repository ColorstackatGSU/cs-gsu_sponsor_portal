/**
 * The light field the sign-in and activation cards float over.
 *
 * The member portal uses a photo mosaic here. This portal has no photo set of its
 * own and the sponsor-facing first impression should not depend on one, so it uses
 * a blueprint grid in GSU blue instead. Purely decorative, so it is aria-hidden and
 * takes no pointer events.
 */
export default function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop-orb backdrop-orb-a" />
      <div className="backdrop-orb backdrop-orb-b" />
      <div className="backdrop-grid" />
    </div>
  );
}
