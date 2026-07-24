"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import AlbumCover from "../../components/AlbumCover";
import AlbumActions from "../../components/AlbumActions";
import ReviewForm from "../../components/ReviewForm";

type Album = {
  id: string;
  title: string;
  artist: string;
  release_year: string | null;
  cover_url: string | null;
  description: string | null;
};

export default function AlbumDetailPage() {
  const params = useParams<{ id: string }>();

  const albumId =
    typeof params.id === "string"
      ? params.id
      : "";

  const [album, setAlbum] =
    useState<Album | null>(null);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadAlbum() {
      if (!albumId) {
        setErrorMessage(
          "アルバムIDを取得できませんでした。"
        );

        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("albums")
        .select(`
          id,
          title,
          artist,
          release_year,
          cover_url,
          description
        `)
        .eq("id", albumId)
        .maybeSingle();

      if (error) {
        console.error(
          "アルバム取得エラー:",
          error
        );

        setErrorMessage(
          `アルバムの取得に失敗しました：${error.message}`
        );

        setLoading(false);
        return;
      }

      if (!data) {
        setErrorMessage(
          "アルバムが見つかりませんでした。"
        );

        setLoading(false);
        return;
      }

      setAlbum(data as Album);
      setLoading(false);
    }

    void loadAlbum();
  }, [albumId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
        <p className="text-center text-zinc-400">
          アルバムを読み込んでいます。
        </p>
      </main>
    );
  }

  if (errorMessage || !album) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/search"
            className="text-sm text-zinc-400 hover:text-white"
          >
            ← 検索に戻る
          </Link>

          <div className="mt-8 rounded-2xl border border-red-900 bg-red-950/40 p-6 text-red-300">
            {errorMessage ||
              "アルバムが見つかりませんでした。"}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/search"
          className="text-sm text-zinc-400 hover:text-white"
        >
          ← アルバム検索に戻る
        </Link>

        <section className="mt-8 grid gap-8 md:grid-cols-[320px_1fr]">
          <AlbumCover
            src={album.cover_url}
            title={album.title}
            className="aspect-square w-full rounded-2xl"
          />

          <div>
            <p className="text-sm font-semibold text-emerald-400">
              ALBUM
            </p>

            <h1 className="mt-2 text-4xl font-bold leading-tight">
              {album.title}
            </h1>

            <p className="mt-3 text-xl text-zinc-300">
              {album.artist}
            </p>

            {album.release_year && (
              <p className="mt-2 text-zinc-500">
                {album.release_year}
              </p>
            )}

            {album.description && (
              <p className="mt-6 whitespace-pre-wrap leading-7 text-zinc-400">
                {album.description}
              </p>
            )}

            <AlbumActions albumId={album.id} />
          </div>
        </section>

        <section className="mt-14 border-t border-zinc-800 pt-10">
          <ReviewForm albumId={album.id} />
        </section>
      </div>
    </main>
  );
}