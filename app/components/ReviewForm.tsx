"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

type Review = {
  id: number;
  album_id: string;
  user_id: string | null;
  rating: number;
  review_text: string;
  created_at: string;
  author: {
    username: string;
  } | null;
};

type ReviewFormProps = {
  albumId: string;
};

export default function ReviewForm({
  albumId,
}: ReviewFormProps) {
  const [user, setUser] = useState<User | null>(null);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] =
    useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("reviews")
      .select(`
        id,
        album_id,
        user_id,
        rating,
        review_text,
        created_at,
        author:profiles!reviews_user_id_fkey (
          username
        )
      `)
      .eq("album_id", albumId)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "レビューの読み込みエラー:",
        error
      );

      setErrorMessage(
        `レビューの読み込みに失敗しました：${error.message}`
      );
      setLoading(false);
      return;
    }

    setReviews((data ?? []) as unknown as Review[]);
    setLoading(false);
  }, [albumId]);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error(
          "ログイン状態の確認エラー:",
          error
        );
      }

      setUser(user);
    }

    void checkUser();
    void loadReviews();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [loadReviews]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setErrorMessage("");

    if (!user) {
      setErrorMessage(
        "レビューを投稿するにはログインが必要です。"
      );
      return;
    }

    if (rating === 0) {
      alert("星評価を選んでください。");
      return;
    }

    if (text.trim() === "") {
      alert("感想を入力してください。");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from("reviews")
      .insert({
        album_id: albumId,
        user_id: user.id,
        rating,
        review_text: text.trim(),
      });

    if (error) {
      console.error(
        "レビューの投稿エラー:",
        error
      );

      setErrorMessage(
        `レビューの投稿に失敗しました：${error.message}`
      );
      setSubmitting(false);
      return;
    }

    setRating(0);
    setText("");

    await loadReviews();

    setSubmitting(false);
  }

  async function handleDelete(reviewId: number) {
    if (!user) {
      return;
    }

    const shouldDelete = window.confirm(
      "このレビューを削除しますか？"
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingId(reviewId);
    setErrorMessage("");

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId)
      .eq("user_id", user.id);

    if (error) {
      console.error(
        "レビューの削除エラー:",
        error
      );

      setErrorMessage(
        `レビューの削除に失敗しました：${error.message}`
      );
      setDeletingId(null);
      return;
    }

    await loadReviews();
    setDeletingId(null);
  }

  return (
    <section className="mt-16 border-t border-zinc-800 pt-10">
      <h2 className="text-2xl font-bold">
        レビューを書く
      </h2>

      {!user ? (
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-zinc-300">
            レビューを投稿するにはログインが必要です。
          </p>

          <Link
            href="/login"
            className="mt-4 inline-block rounded-full bg-emerald-400 px-6 py-3 font-semibold text-zinc-950 hover:bg-emerald-300"
          >
            ログイン・新規登録
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
        >
          <p className="mb-3 text-sm text-zinc-400">
            星評価
          </p>

          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((number) => (
              <button
                key={number}
                type="button"
                onClick={() => setRating(number)}
                className={`text-3xl transition ${
                  number <= rating
                    ? "text-amber-400"
                    : "text-zinc-600 hover:text-zinc-400"
                }`}
                aria-label={`${number}点`}
              >
                ★
              </button>
            ))}
          </div>

          <label
            htmlFor="review"
            className="mt-6 block text-sm text-zinc-400"
          >
            感想
          </label>

          <textarea
            id="review"
            value={text}
            onChange={(event) =>
              setText(event.target.value)
            }
            placeholder="このアルバムを聴いて感じたことを書いてください"
            className="mt-3 min-h-36 w-full resize-y rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-white outline-none focus:border-emerald-400"
          />

          {errorMessage && (
            <p className="mt-4 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded-full bg-emerald-400 px-6 py-3 font-semibold text-zinc-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "投稿中..."
              : "投稿する"}
          </button>
        </form>
      )}

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            投稿されたレビュー
          </h2>

          {!loading && (
            <p className="text-sm text-zinc-500">
              {reviews.length}件
            </p>
          )}
        </div>

        {errorMessage && !user && (
          <p className="mt-5 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
            {errorMessage}
          </p>
        )}

        {loading ? (
          <p className="mt-6 text-zinc-500">
            読み込み中です。
          </p>
        ) : reviews.length === 0 ? (
          <p className="mt-6 text-zinc-500">
            まだレビューはありません。
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {reviews.map((review) => {
              const username =
                review.author?.username ??
                "不明なユーザー";

              const shortUserId = review.user_id
                ? review.user_id.slice(0, 8)
                : "unknown";

              const isMyReview =
                user?.id === review.user_id;

              return (
                <article
                  key={review.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-lg font-bold text-zinc-950">
                        {username
                          .slice(0, 1)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2">
                          <p className="font-semibold text-zinc-100">
                            {username}
                          </p>

                          {isMyReview && (
                            <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-400">
                              あなた
                            </span>
                          )}
                        </div>

                        <p
                          className="mt-1 truncate text-xs text-zinc-500"
                          title={
                            review.user_id ??
                            undefined
                          }
                        >
                          @{username}
                          {" · "}
                          ID：{shortUserId}
                        </p>
                      </div>
                    </div>

                    {isMyReview && (
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(review.id)
                        }
                        disabled={
                          deletingId === review.id
                        }
                        className="shrink-0 text-sm text-zinc-500 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === review.id
                          ? "削除中..."
                          : "削除"}
                      </button>
                    )}
                  </div>

                  <div className="mt-5">
                    <p className="text-amber-400">
                      {"★".repeat(review.rating)}

                      <span className="text-zinc-600">
                        {"★".repeat(
                          5 - review.rating
                        )}
                      </span>

                      <span className="ml-2 text-sm text-zinc-400">
                        {review.rating}.0
                      </span>
                    </p>

                    <p className="mt-2 text-xs text-zinc-500">
                      {new Date(
                        review.created_at
                      ).toLocaleString("ja-JP")}
                    </p>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap leading-7 text-zinc-300">
                    {review.review_text}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}