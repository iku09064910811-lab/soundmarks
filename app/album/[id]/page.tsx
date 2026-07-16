export default function AlbumPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="text-sm text-zinc-400 hover:text-white">
          ← ホームに戻る
        </a>

        <section className="mt-8 grid gap-10 md:grid-cols-[320px_1fr]">
          <div className="aspect-square rounded-2xl bg-zinc-800" />

          <div>
            <p className="text-sm font-semibold text-emerald-400">
              ALBUM
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              OK Computer
            </h1>

            <p className="mt-3 text-lg text-zinc-400">
              Radiohead・1997
            </p>

            <div className="mt-6 flex items-center gap-4">
              <span className="text-2xl text-amber-400">★ 4.6</span>
              <span className="text-sm text-zinc-500">128件の評価</span>
            </div>

            <button className="mt-8 rounded-full bg-emerald-400 px-6 py-3 font-semibold text-zinc-950 hover:bg-emerald-300">
              レビューを書く
            </button>
          </div>
        </section>

        <section className="mt-16 border-t border-zinc-800 pt-10">
          <h2 className="text-2xl font-bold">レビュー</h2>

          <article className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <p className="font-semibold">music_user</p>
              <span className="text-amber-400">★ 5.0</span>
            </div>

            <p className="mt-4 leading-7 text-zinc-300">
              聴くたびに新しい音が見つかるアルバム。曲順も含めて完成度が高い。
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}