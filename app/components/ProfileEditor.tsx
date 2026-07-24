"use client";

import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

type ProfileEditorProps = {
  user: User;
};

export default function ProfileEditor({
  user,
}: ProfileEditorProps) {
  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] =
    useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (error) {
        setMessage(
          `プロフィールの取得に失敗しました：${error.message}`
        );
        setLoading(false);
        return;
      }

      setUsername(data.username);
      setOriginalUsername(data.username);
      setLoading(false);
    }

    void loadProfile();
  }, [user.id]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedUsername = username
      .trim()
      .toLowerCase();

    if (
      !/^[a-z0-9_]{3,20}$/.test(
        normalizedUsername
      )
    ) {
      setMessage(
        "ユーザーネームは3～20文字の半角英数字と_で入力してください。"
      );
      return;
    }

    setSaving(true);
    setMessage("");

    const { data: existingProfile } =
      await supabase
        .from("profiles")
        .select("id")
        .eq("username", normalizedUsername)
        .neq("id", user.id)
        .maybeSingle();

    if (existingProfile) {
      setMessage(
        "そのユーザーネームはすでに使われています。"
      );
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        username: normalizedUsername,
      })
      .eq("id", user.id);

    if (error) {
      setMessage(
        `保存に失敗しました：${error.message}`
      );
      setSaving(false);
      return;
    }

    setUsername(normalizedUsername);
    setOriginalUsername(normalizedUsername);
    setMessage("ユーザーネームを保存しました。");
    setSaving(false);
  }

  if (loading) {
    return (
      <p className="text-zinc-500">
        プロフィールを読み込んでいます。
      </p>
    );
  }

  return (
    <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
      <p className="text-sm font-semibold text-emerald-400">
        PROFILE
      </p>

      <h2 className="mt-2 text-2xl font-bold">
        プロフィール設定
      </h2>

      <div className="mt-6 rounded-xl bg-zinc-950 p-5">
        <p className="text-sm text-zinc-500">
          ユーザーID
        </p>

        <p className="mt-2 break-all font-mono text-sm text-zinc-300">
          {user.id}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6"
      >
        <label
          htmlFor="profile-username"
          className="block text-sm text-zinc-400"
        >
          ユーザーネーム
        </label>

        <div className="mt-2 flex items-center rounded-xl border border-zinc-700 bg-zinc-950 focus-within:border-emerald-400">
          <span className="pl-4 text-zinc-500">
            @
          </span>

          <input
            id="profile-username"
            value={username}
            onChange={(event) =>
              setUsername(
                event.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9_]/g, "")
              )
            }
            minLength={3}
            maxLength={20}
            required
            className="w-full bg-transparent px-2 py-3 outline-none"
          />
        </div>

        {message && (
          <p className="mt-4 text-sm text-zinc-400">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={
            saving || username === originalUsername
          }
          className="mt-5 rounded-full bg-emerald-400 px-6 py-3 font-semibold text-zinc-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "保存中..." : "変更を保存"}
        </button>
      </form>
    </section>
  );
}