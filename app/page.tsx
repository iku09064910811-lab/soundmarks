const albums = [
  {
    title: "OK Computer",
    artist: "Radiohead",
    year: 1997,
    rating: 4.6,
    cover: "https://placehold.co/400x400?text=OK+Computer",
  },
  {
    title: "Ants From Up There",
    artist: "Black Country, New Road",
    year: 2022,
    rating: 4.5,
    cover: "https://placehold.co/400x400?text=Ants+From+Up+There",
  },
  {
    title: "our hope",
    artist: "羊文学",
    year: 2022,
    rating: 4.3,
    cover: "https://placehold.co/400x400?text=our+hope",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-bold tracking-tight">
            Soundmarks
          </h1>

          <nav className="flex items-center gap-6 text-sm text-zinc-300">
            <a href="#" className="hover:text-white">
              ホーム
            </a>
            <a href="#" className="hover:text-white">
              アルバムを探す
            </a>
            <a href="#" className="hover:text-white">
              マイページ
            </a>
          </nav>
        </div>
      </header>

      <section className="border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="mb-3 text-sm font-semibold text-emerald-400">
            音楽を記録する
          </p>

          <h2 className="max-w-2xl text-4xl font-bold leading-tight">
            聴いたアルバムと、
            <br />
            そのときの自分を残そう。
          </h2>

          <p className="mt-5 max-w-xl leading-7 text-zinc-400">
            アルバムを評価し、感想を書き、
            自分だけの音楽記録を作るサービスです。
          </p>

          <div className="mt-8 flex gap-3">
            <button className="rounded-full bg-emerald-400 px-6 py-3 font-semibold text-zinc-950 hover:bg-emerald-300">
              アルバムを探す
            </button>

            <button className="rounded-full border border-zinc-700 px-6 py-3 font-semibold hover:bg-zinc-800">
              記録を見る
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm text-zinc-500">
              PICK UP
            </p>
            <h2 className="mt-1 text-2xl font-bold">
              注目のアルバム
            </h2>
          </div>

          <button className="text-sm text-zinc-400 hover:text-white">
            すべて見る →
          </button>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <article
              key={album.title}
              className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
            >
              <img
                src={album.cover}
                alt={`${album.title}のジャケット`}
                className="aspect-square w-full object-cover"
              />

              <div className="p-5">
                <h3 className="text-xl font-bold">
                  {album.title}
                </h3>

                <p className="mt-1 text-sm text-zinc-400">
                  {album.artist}・{album.year}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-amber-400">
                    ★ {album.rating}
                  </span>

                  <button className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800">
                    詳細を見る
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}