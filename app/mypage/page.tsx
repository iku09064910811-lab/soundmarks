"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import AlbumCover from "../components/AlbumCover";
import ProfileEditor from "../components/ProfileEditor";

type Album = {
  id: string;
  title: string;
  artist: string;
  release_year: string | null;
  cover_url: string | null;
};

type Review = {
  id: number;
  album_id: string;
  user_id: string;
  rating: number;
  review_text: string;
  created_at: string;
  album: Album | null;
};

type AlbumStatus =
  | "want_to_listen"
  | "listened"
  | null;

type UserAlbum = {
  id: number;
  album_id: string;
  status: AlbumStatus;
  is_favorite: boolean;
  created_at: string;
  album: Album | null;
};

type AlbumGridProps = {
  title: string;
  albums: UserAlbum[];
  emptyMessage: string;
};

function AlbumGrid({
  title,
  albums,
  emptyMessage,
}: AlbumGridProps) {
  return (
    <section className="mt-12">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-bold">
          {title}
        </h2>

        <p className="text-sm text-zinc-500">
          {albums.length}件
        </p>
      </div>

      {albums.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-7 text-zinc-400">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {albums.map((record) => {
            if (!record.album) {
              return null;
            }

            return (
              <Link
                key={record.id}
                href={`/album/${record.album.id}`}
                className="group block"
              >
                <AlbumCover
                  src={record.album.cover_url}
                  title={record.album.title}
                  className="aspect-square w-full rounded-xl"
                />

                <h3 className="mt-3 line-clamp-2 font-semibold group-hover:text-emerald-400">
                  {record.album.title}
                </h3>

                <p className="mt-1 line-clamp-1 text-sm text-zinc-500">
                  {record.album.artist}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function MyPage() {
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [userAlbums, setUserAlbums] =
    useState<UserAlbum[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [editingRating, setEditingRating] =
    useState(0);

  const [editingText, setEditingText] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    async function loadMyPage() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      setUser(user);

      const [
        reviewsResult,
        userAlbumsResult,
      ] = await Promise.all([
        supabase
          .from("reviews")
          .select(`
            id,
            album_id,
            user_id,
            rating,
            review_text,
            created_at,
            album:albums!reviews_album_id_fkey (
              id,
              title,
              artist,
              release_year,
              cover_url
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("user_albums")
          .select(`
            id,
            album_id,
            status,
            is_favorite,
            created_at,
            album:albums!user_albums_album_id_fkey (
              id,
              title,
              artist,
              release_year,
              cover_url
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          }),
      ]);

      if (reviewsResult.error) {
        console.error(
          "レビュー取得エラー:",
          reviewsResult.error
        );

        setErrorMessage(
          `レビューの取得に失敗しました：${reviewsResult.error.message}`
        );
      } else {
        setReviews(
          (reviewsResult.data ?? []) as unknown as Review[]
        );
      }

      if (userAlbumsResult.error) {
        console.error(
          "アルバム記録取得エラー:",
          userAlbumsResult.error
        );

        setErrorMessage((current) => {
          const newMessage =
            `アルバム記録の取得に失敗しました：${userAlbumsResult.error?.message}`;

          return current
            ? `${current}\n${newMessage}`
            : newMessage;
        });
      } else {
        setUserAlbums(
          (userAlbumsResult.data ??
            []) as unknown as UserAlbum[]
        );
      }

      setLoading(false);
    }

    void loadMyPage();
  }, [router]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return 0;
    }

    const total = reviews.reduce(
      (sum, review) =>
        sum + review.rating,
      0
    );

    return total / reviews.length;
  }, [reviews]);

  const listenedAlbums = useMemo(
    () =>
      userAlbums.filter(
        (record) =>
          record.status === "listened"
      ),
    [userAlbums]
  );

  const wantToListenAlbums = useMemo(
    () =>
      userAlbums.filter(
        (record) =>
          record.status ===
          "want_to_listen"
      ),
    [userAlbums]
  );

  const favoriteAlbums = useMemo(
    () =>
      userAlbums.filter(
        (record) =>
          record.is_favorite
      ),
    [userAlbums]
  );

  function startEditing(review: Review) {
    setEditingId(review.id);
    setEditingRating(review.rating);
    setEditingText(review.review_text);
    setErrorMessage("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingRating(0);
    setEditingText("");
  }

  async function saveEditing(
    reviewId: number
  ) {
    if (!user) {
      return;
    }

    if (editingRating === 0) {
      alert("星評価を選んでください。");
      return;
    }

    if (
      editingText.trim() === ""
    ) {
      alert("感想を入力してください。");
      return;
    }

    setSaving(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("reviews")
      .update({
        rating: editingRating,
        review_text:
          editingText.trim(),
      })
      .eq("id", reviewId)
      .eq("user_id", user.id);

    if (error) {
      console.error(
        "レビュー編集エラー:",
        error
      );

      setErrorMessage(
        `レビューの編集に失敗しました：${error.message}`
      );

      setSaving(false);
      return;
    }

    setReviews(
      (currentReviews) =>
        currentReviews.map(
          (review) =>
            review.id === reviewId
              ? {
                  ...review,
                  rating:
                    editingRating,
                  review_text:
                    editingText.trim(),
                }
              : review
        )
    );

    cancelEditing();
    setSaving(false);
  }

  async function deleteReview(
    reviewId: number
  ) {
    if (!user) {
      return;
    }

    const shouldDelete =
      window.confirm(
        "このレビューを削除しますか？"
      );

    if (!shouldDelete) {
      return;
    }

    setErrorMessage("");

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId)
      .eq("user_id", user.id);

    if (error) {
      console.error(
        "レビュー削除エラー:",
        error
      );

      setErrorMessage(
        `レビューの削除に失敗しました：${error.message}`
      );

      return;
    }

    setReviews(
      (currentReviews) =>
        currentReviews.filter(
          (review) =>
            review.id !== reviewId
        )
    );
  }

  async function handleLogout() {
    setLoggingOut(true);

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      setErrorMessage(
        `ログアウトに失敗しました：${error.message}`
      );

      setLoggingOut(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
        <p className="text-center text-zinc-400">
          マイページを読み込んでいます。
        </p>
      </main>
    );
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

        <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm font-semibold text-emerald-400">
                MY PAGE
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                マイページ
              </h1>

              <p className="mt-3 break-all text-zinc-400">
                {user?.email}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm font-semibold hover:bg-zinc-800 disabled:opacity-50"
            >
              {loggingOut
                ? "ログアウト中..."
                : "ログアウト"}
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-zinc-950 p-5">
              <p className="text-sm text-zinc-500">
                レビュー
              </p>

              <p className="mt-2 text-3xl font-bold">
                {reviews.length}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-950 p-5">
              <p className="text-sm text-zinc-500">
                平均評価
              </p>

              <p className="mt-2 text-3xl font-bold text-amber-400">
                {reviews.length > 0
                  ? `★ ${averageRating.toFixed(1)}`
                  : "―"}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-950 p-5">
              <p className="text-sm text-zinc-500">
                聴いた
              </p>

              <p className="mt-2 text-3xl font-bold">
                {listenedAlbums.length}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-950 p-5">
              <p className="text-sm text-zinc-500">
                聴きたい
              </p>

              <p className="mt-2 text-3xl font-bold">
                {wantToListenAlbums.length}
              </p>
            </div>
          </div>
        </section>

        {user && (
          <ProfileEditor user={user} />
        )}

        {errorMessage && (
          <p className="mt-8 whitespace-pre-wrap rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
            {errorMessage}
          </p>
        )}

        <AlbumGrid
          title="聴いたアルバム"
          albums={listenedAlbums}
          emptyMessage="「聴いた」に登録したアルバムはまだありません。"
        />

        <AlbumGrid
          title="聴きたいアルバム"
          albums={wantToListenAlbums}
          emptyMessage="「聴きたい」に登録したアルバムはまだありません。"
        />

        <AlbumGrid
          title="お気に入り"
          albums={favoriteAlbums}
          emptyMessage="お気に入りに登録したアルバムはまだありません。"
        />

        <section className="mt-14">
          <h2 className="text-2xl font-bold">
            自分のレビュー
          </h2>

          {reviews.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
              <p className="text-zinc-400">
                まだレビューを投稿していません。
              </p>

              <Link
                href="/search"
                className="mt-5 inline-block rounded-full bg-emerald-400 px-6 py-3 font-semibold text-zinc-950 hover:bg-emerald-300"
              >
                アルバムを探す
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {reviews.map((review) => {
                const isEditing =
                  editingId === review.id;

                return (
                  <article
                    key={review.id}
                    className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
                  >
                    <div className="grid sm:grid-cols-[180px_1fr]">
                      <Link
                        href={`/album/${review.album_id}`}
                      >
                        <AlbumCover
                          src={
                            review.album
                              ?.cover_url ??
                            null
                          }
                          title={
                            review.album
                              ?.title ??
                            "不明なアルバム"
                          }
                          className="aspect-square h-full min-h-44 w-full"
                        />
                      </Link>

                      <div className="p-6">
                        <div className="flex flex-col justify-between gap-5 sm:flex-row">
                          <div>
                            <Link
                              href={`/album/${review.album_id}`}
                              className="text-xl font-bold hover:text-emerald-400"
                            >
                              {review.album
                                ?.title ??
                                "不明なアルバム"}
                            </Link>

                            <p className="mt-1 text-sm text-zinc-400">
                              {review.album
                                ?.artist ??
                                "不明なアーティスト"}
                            </p>

                            <p className="mt-2 text-xs text-zinc-500">
                              {new Date(
                                review.created_at
                              ).toLocaleString(
                                "ja-JP"
                              )}
                            </p>
                          </div>

                          {!isEditing && (
                            <div className="flex gap-4 text-sm">
                              <button
                                type="button"
                                onClick={() =>
                                  startEditing(
                                    review
                                  )
                                }
                                className="text-zinc-400 hover:text-white"
                              >
                                編集
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteReview(
                                    review.id
                                  )
                                }
                                className="text-zinc-400 hover:text-red-400"
                              >
                                削除
                              </button>
                            </div>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="mt-6">
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map(
                                (number) => (
                                  <button
                                    key={number}
                                    type="button"
                                    onClick={() =>
                                      setEditingRating(
                                        number
                                      )
                                    }
                                    className={`text-3xl ${
                                      number <=
                                      editingRating
                                        ? "text-amber-400"
                                        : "text-zinc-600"
                                    }`}
                                  >
                                    ★
                                  </button>
                                )
                              )}
                            </div>

                            <textarea
                              value={
                                editingText
                              }
                              onChange={(
                                event
                              ) =>
                                setEditingText(
                                  event
                                    .target
                                    .value
                                )
                              }
                              className="mt-5 min-h-32 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 outline-none focus:border-emerald-400"
                            />

                            <div className="mt-4 flex gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  saveEditing(
                                    review.id
                                  )
                                }
                                disabled={
                                  saving
                                }
                                className="rounded-full bg-emerald-400 px-5 py-2 font-semibold text-zinc-950 disabled:opacity-50"
                              >
                                変更を保存
                              </button>

                              <button
                                type="button"
                                onClick={
                                  cancelEditing
                                }
                                className="rounded-full border border-zinc-700 px-5 py-2"
                              >
                                キャンセル
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="mt-6 text-amber-400">
                              {"★".repeat(
                                review.rating
                              )}

                              <span className="text-zinc-600">
                                {"★".repeat(
                                  5 -
                                    review.rating
                                )}
                              </span>
                            </p>

                            <p className="mt-4 whitespace-pre-wrap leading-7 text-zinc-300">
                              {
                                review.review_text
                              }
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}