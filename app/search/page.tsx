"use client";

import Link from "next/link";
import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type AlbumSearchResult = {
  id: string;
  title: string;
  artist: string;
  year: string | null;
  coverUrl: string;
};

export default function SearchPage() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [albums, setAlbums] = useState<
    AlbumSearchResult[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [savingAlbumId, setSavingAlbumId] =
    useState<string | null>(null);
  const [errorMessage, setErrorMessage] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    setLoading(true);
    setSearched(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/albums/search?q=${encodeURIComponent(
          trimmedQuery
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ??
            "検索に失敗しました。"
        );
      }

      setAlbums(data.albums ?? []);
    } catch (error) {
      console.error(error);
      setAlbums([]);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "検索に失敗しました。"
      );
    } finally {
      setLoading(false);
    }
  }

  async function openAlbum(
    album: AlbumSearchResult
  ) {
    setSavingAlbumId(album.id);
    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(userError);
    }

    /*
      現在のalbumsテーブルは、未ログイン利用者には
      insert権限がありません。

      未ログインの場合はログイン画面へ送ります。
    */
    if (!user) {
      setSavingAlbumId(null);

      router.push(
        `/login?next=${encodeURIComponent(
          `/search?q=${query}`
        )}`
      );

      return;
    }

    const { error } = await supabase
      .from("albums")
      .upsert(
        {
          id: album.id,
          title: album.title,
          artist: album.artist,
          release_year: album.year,
          cover_url: album.coverUrl,
          description: null,
        },
        {
          onConflict: "id",
        }
      );

    if (error) {
      console.error(
        "アルバム保存エラー:",
        error
      );

      setErrorMessage(
        `アルバムを登録できませんでした：${error.message}`
      );
      setSavingAlbumId(null);
      return;
    }

    router.push(`/album/${album.id}`);
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="text-sm text-zinc-400 hover:text-white"
        >
          ← ホームに戻る
        </Link>

        <section className="mt-8">
          <p className="text-sm font-semibold text-emerald-400">
            SEARCH
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            アルバムを探す
          </h1>

          <p className="mt-4 text-zinc-400">
            アルバム名またはアーティスト名で検索できます。
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="例：Radiohead OK Computer"
              className="min-w-0 flex-1 rounded-full border border-zinc-700 bg-zinc-900 px-5 py-3 outline-none focus:border-emerald-400"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-emerald-400 px-7 py-3 font-semibold text-zinc-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "検索中..." : "検索"}
            </button>
          </form>
        </section>

        {errorMessage && (
          <p className="mt-8 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">
            {errorMessage}
          </p>
        )}

        <section className="mt-12">
          {!searched ? (
            <p className="text-zinc-500">
              検索結果がここに表示されます。
            </p>
          ) : loading ? (
            <p className="text-zinc-500">
              アルバムを検索しています。
            </p>
          ) : albums.length === 0 ? (
            <p className="text-zinc-500">
              該当するアルバムが見つかりませんでした。
            </p>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  検索結果
                </h2>

                <p className="text-sm text-zinc-500">
                  {albums.length}件
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {albums.map((album) => (
                  <article
                    key={album.id}
                    className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
                  >
                    <div className="flex aspect-square items-center justify-center bg-zinc-800">
                      <img
                        src={album.coverUrl}
                        alt={`${album.title}のジャケット`}
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="p-5">
                      <h2 className="line-clamp-2 font-bold">
                        {album.title}
                      </h2>

                      <p className="mt-2 line-clamp-1 text-sm text-zinc-400">
                        {album.artist}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        {album.year ?? "発売年不明"}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          void openAlbum(album)
                        }
                        disabled={
                          savingAlbumId === album.id
                        }
                        className="mt-5 w-full rounded-full border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingAlbumId === album.id
                          ? "読み込み中..."
                          : "詳細を見る"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}