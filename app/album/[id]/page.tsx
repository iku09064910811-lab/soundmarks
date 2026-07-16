import { notFound } from "next/navigation";
import { albums } from "../../../data/albums";

type AlbumPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AlbumPage({
  params,
}: AlbumPageProps) {
  const { id } = await params;

  const album = albums.find(
    (item) => item.id === Number(id)
  );

  if (!album) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <a
          href="/"
          className="text-sm text-zinc-400 hover:text-white"
        >
          ← ホームに戻る
        </a>

        <section className="mt-8 grid gap-10 md:grid-cols-[320px_1fr]">
          <img
            src={album.cover}
            alt={`${album.title}のジャケット`}
            className="aspect-square w-full rounded-2xl object-cover"
          />

          <div>
            <p className="text-sm font-semibold text-emerald-400">
              ALBUM
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              {album.title}
            </h1>

            <p className="mt-3 text-lg text-zinc-400">
              {album.artist}・{album.year}
            </p>

            <div className="mt-6 flex items-center gap-4">
              <span className="text-2xl text-amber-400">
                ★ {album.rating}
              </span>

              <span className="text-sm text-zinc-500">
                {album.reviewCount}件の評価
              </span>
            </div>

            <p className="mt-6 max-w-xl leading-7 text-zinc-300">
              {album.description}
            </p>

            <button className="mt-8 rounded-full bg-emerald-400 px-6 py-3 font-semibold text-zinc-950 hover:bg-emerald-300">
              レビューを書く
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}