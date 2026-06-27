import { useEffect, useState } from "react";

interface PersonAudioPlayerProps {
  blob: Blob;
  className?: string;
}

/**
 * Renders a Blob fetched via an authenticated request as a playable <audio> element.
 * Manages the object URL lifecycle: creates one when the blob changes, revokes the
 * previous one on change/unmount to avoid leaking memory.
 */
export default function PersonAudioPlayer({ blob, className }: PersonAudioPlayerProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  if (!url) return null;
  return <audio controls src={url} className={className} />;
}
