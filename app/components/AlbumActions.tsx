"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

type AlbumStatus = "want_to_listen" | "listened" | null;

type UserAlbumRecord = {
  id: number;
  user_id: string;
  album_id: string;
  status: AlbumStatus;
  is_favorite: boolean;
};

type AlbumActionsProps = {
  albumId: string;
};

export default function AlbumActions({
  albumId,
}: AlbumActionsProps) {
  const [user, setUser] = useState<User | null>(null);

  const [status, setStatus] = useState<AlbumStatus>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadAlbumActions() {
      setLoading(true);
      setMessage("");
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("ユーザー取得エラー:", userError);

        setErrorMessage(
          `ログイン情報の取得に失敗しました：${userError.message}`
        );

        setLoading(false);
        return;
      }

      if (!user) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(user);

      const { data, error } = await supabase
        .from("user_albums")
        .select(`
          id,
          user_id,
          album_id,
          status,
          is_favorite
        `)
        .eq("user_id", user.id)
        .eq("album_id", albumId)
        .maybeSingle();

      if (error) {
        console.error("アルバム記録取得エラー:", error);

        setErrorMessage(
          `アルバム記録の取得に失敗しました：${error.message}`
        );

        setLoading(false);
        return;
      }

      const record = data as UserAlbumRecord | null;

      if (record) {
        setStatus(record.status);
        setIsFavorite(record.is_favorite);
      } else {
        setStatus(null);
        setIsFavorite(false);
      }

      setLoading(false);
    }

    void loadAlbumActions();
  }, [albumId]);

  async function saveRecord(
    newStatus: AlbumStatus,
    newIsFavorite: boolean
  ): Promise<boolean> {
    if (!user) {
      setErrorMessage(
        "この機能を使うにはログインしてください。"
      );

      return false;
    }

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    if (newStatus === null && newIsFavorite === false) {
      const { error } = await supabase
        .from("user_albums")
        .delete()
        .eq("user_id", user.id)
        .eq("album_id", albumId);

      if (error) {
        console.error("アルバム記録削除エラー:", error);

        setErrorMessage(
          `アルバム記録の削除に失敗しました：${error.message}`
        );

        setSaving(false);
        return false;
      }

      setStatus(null);
      setIsFavorite(false);
      setSaving(false);

      return true;
    }

    const { error } = await supabase
      .from("user_albums")
      .upsert(
        {
          user_id: user.id,
          album_id: albumId,
          status: newStatus,
          is_favorite: newIsFavorite,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,album_id",
        }
      );

    if (error) {
      console.error("アルバム記録保存エラー:", error);

      setErrorMessage(
        `アルバム記録の保存に失敗しました：${error.message}`
      );

      setSaving(false);
      return false;
    }

    setStatus(newStatus);
    setIsFavorite(newIsFavorite);
    setSaving(false);

    return true;
  }

  async function handleWantToListen() {
    const nextStatus: AlbumStatus =
      status === "want_to_listen"
        ? null
        : "want_to_listen";

    const success = await saveRecord(
      nextStatus,
      isFavorite
    );

    if (!success) {
      return;
    }

    setMessage(
      nextStatus === "want_to_listen"
        ? "「聴きたい」に追加しました。"
        : "「聴きたい」を解除しました。"
    );
  }

  async function handleListened() {
    const nextStatus: AlbumStatus =
      status === "listened"
        ? null
        : "listened";

    const success = await saveRecord(
      nextStatus,
      isFavorite
    );

    if (!success) {
      return;
    }

    setMessage(
      nextStatus === "listened"
        ? "「聴いた」に追加しました。"
        : "「聴いた」を解除しました。"
    );
  }

  async function handleFavorite() {
    const nextFavorite = !isFavorite;

    const success = await saveRecord(
      status,
      nextFavorite
    );

    if (!success) {
      return;
    }

    setMessage(
      nextFavorite
        ? "お気に入りに追加しました。"
        : "お気に入りを解除しました。"
    );
  }

  if (loading) {
    return (
      <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <p className="text-sm text-zinc-400">
          アルバムの記録を読み込んでいます。
        </p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <p className="text-zinc-300">
          ログインすると、このアルバムを記録できます。
        </p>

        <a
          href="/login"
          className="mt-4 inline-block rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
        >
          ログインする
        </a>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold">
        このアルバムを記録
      </h2>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleListened}
          disabled={saving}
          className={`rounded-full border px-5 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
            status === "listened"
              ? "border-emerald-400 bg-emerald-400 text-zinc-950"
              : "border-zinc-700 bg-zinc-900 text-white hover:border-emerald-400"
          }`}
        >
          {status === "listened"
            ? "✓ 聴いた"
            : "＋ 聴いた"}
        </button>

        <button
          type="button"
          onClick={handleWantToListen}
          disabled={saving}
          className={`rounded-full border px-5 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
            status === "want_to_listen"
              ? "border-sky-400 bg-sky-400 text-zinc-950"
              : "border-zinc-700 bg-zinc-900 text-white hover:border-sky-400"
          }`}
        >
          {status === "want_to_listen"
            ? "✓ 聴きたい"
            : "＋ 聴きたい"}
        </button>

        <button
          type="button"
          onClick={handleFavorite}
          disabled={saving}
          className={`rounded-full border px-5 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
            isFavorite
              ? "border-pink-400 bg-pink-400 text-zinc-950"
              : "border-zinc-700 bg-zinc-900 text-white hover:border-pink-400"
          }`}
        >
          {isFavorite
            ? "♥ お気に入り"
            : "♡ お気に入り"}
        </button>
      </div>

      {saving && (
        <p className="mt-4 text-sm text-zinc-400">
          保存しています。
        </p>
      )}

      {!saving && message && (
        <p className="mt-4 text-sm text-emerald-400">
          {message}
        </p>
      )}

      {errorMessage && (
        <p className="mt-4 rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">
          {errorMessage}
        </p>
      )}
    </section>
  );
}