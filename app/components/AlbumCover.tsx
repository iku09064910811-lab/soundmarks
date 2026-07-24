"use client";

import { useState } from "react";

type AlbumCoverProps = {
  src: string | null;
  title: string;
  className?: string;
};

export default function AlbumCover({
  src,
  title,
  className = "",
}: AlbumCoverProps) {
  const [failed, setFailed] = useState(false);

  const hasUsableImage =
    Boolean(src) &&
    !src?.includes("placehold.co") &&
    !failed;

  return (
    <div
      className={`flex items-center justify-center overflow-hidden bg-zinc-800 ${className}`}
    >
      {hasUsableImage ? (
        <img
          src={src ?? ""}
          alt={`${title}のジャケット`}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="px-5 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-700 text-2xl">
            ♪
          </div>

          <p className="mt-4 line-clamp-2 text-sm text-zinc-400">
            {title}
          </p>

          <p className="mt-1 text-xs text-zinc-600">
            ジャケット未登録
          </p>
        </div>
      )}
    </div>
  );
}