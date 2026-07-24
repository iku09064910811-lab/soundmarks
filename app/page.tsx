import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import MyPageLink from "./components/MyPageLink";
import AlbumCover from "./components/AlbumCover";

type Album = {
  id: string;
  title: string;
  artist: string;
  release_year: string | null;
  cover_url: string | null;
  created_at: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env
    .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default async function Home() {
  const { data, error } = await supabase
    .from("albums")
    .select(
      `
        id,
        title,
        artist,
        release_year,
        cover_url,
        created_at
      `
    )
    .not("cover_url", "is", null)
    .not("cover_url", "ilike", "%placehold.co%")
    .order("created_at", {
      ascending: false,
    })
    .limit(6);

  if (error) {
    console.error(
      "トップページのアルバム取得エラー:",
      error
    );
  }

  const albums = (data ?? []) as Album[];

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
          >
            Soundmarks
          </Link>

          <nav className="flex items-center gap-6 text-sm text-zinc-300">
            <Link
              href="/"
              className="hover:text-white"
            >
              ホーム
            </Link>

            <Link
              href="/search"
              className="hover:text-white"
            >
              アルバムを探す
            </Link>

            <MyPageLink />
          </nav>
        </div>
      </header>

      <section className="border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="mb-3 text-sm font-semibold text-emerald-400">
            音楽を記録する
          </p>

          <h1 className="max-w-2xl text-4xl font-bold leading-tight">
            聴いたアルバムと、
            <br />
            そのときの自分を残そう。
          </h1>

          <p className="mt-5 max-w-xl leading-7 text-zinc-400">
            アルバムを評価し、感想を書き、
            自分だけの音楽記録を作るサービスです。
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/search"
              className="rounded-full bg-emerald-400 px-6 py-3 font-semibold text-zinc-950 hover:bg-emerald-300"
            >
              アルバムを探す
            </Link>

            <Link
              href="/mypage"
              className="rounded-full border border-zinc-700 px-6 py-3 font-semibold hover:bg-zinc-800"
            >
              記録を見る
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm text-zinc-500">
              RECENTLY ADDED
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              最近追加されたアルバム
            </h2>
          </div>

          <Link
            href="/search"
            className="text-sm text-zinc-400 hover:text-white"
          >
            もっと探す →
          </Link>
        </div>

        {albums.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
            <p className="text-zinc-400">
              実際のジャケットが登録されたアルバムはまだありません。
            </p>

            <Link
              href="/search"
              className="mt-5 inline-block rounded-full bg-emerald-400 px-6 py-3 font-semibold text-zinc-950"
            >
              アルバムを検索する
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <article
                key={album.id}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
              >
                <Link
                  href={`/album/${album.id}`}
                  className="block"
                >
                  <AlbumCover
                    src={album.cover_url}
                    title={album.title}
                    className="aspect-square w-full"
                  />
                </Link>

                <div className="p-5">
                  <Link
                    href={`/album/${album.id}`}
                    className="text-xl font-bold hover:text-emerald-400"
                  >
                    {album.title}
                  </Link>

                  <p className="mt-1 text-sm text-zinc-400">
                    {album.artist}

                    {album.release_year
                      ? `・${album.release_year}`
                      : ""}
                  </p>

                  <Link
                    href={`/album/${album.id}`}
                    className="mt-5 inline-block rounded-full border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
                  >
                    詳細を見る
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}