// Cuore del "mi piace": pieno e verde se il brano è tra i preferiti.
// Estratto perché compariva identico in tracklist, player, PiP e modali.

export function HeartIcon({ liked }: { liked: boolean }) {
  if (liked) {
    return <i className="bi bi-heart-fill" style={{ color: 'var(--spotify-green)' }} />
  }
  return <i className="bi bi-heart" />
}
