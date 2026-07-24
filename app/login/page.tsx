"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">(
    "login"
  );
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setSubmitting(true);

    if (mode === "signup") {
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
        setSubmitting(false);
        return;
      }

      const { data: existingProfile } =
        await supabase
          .from("profiles")
          .select("id")
          .eq("username", normalizedUsername)
          .maybeSingle();

      if (existingProfile) {
        setMessage(
          "そのユーザーネームはすでに使われています。"
        );
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: normalizedUsername,
          },
        },
      });

      if (error) {
        setMessage(
          `登録に失敗しました：${error.message}`
        );
        setSubmitting(false);
        return;
      }

      setMessage(
        "登録しました。届いた確認メールのリンクを開いてください。"
      );
      setSubmitting(false);
      return;
    }

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setMessage(
        "ログインできませんでした。メールアドレスとパスワードを確認してください。"
      );
      setSubmitting(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-md">
        <Link
          href="/"
          className="text-sm text-zinc-400 hover:text-white"
        >
          ← ホームに戻る
        </Link>

        <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <p className="text-sm font-semibold text-emerald-400">
            SOUNDMARKS
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            {mode === "login"
              ? "ログイン"
              : "新規登録"}
          </h1>

          <form
            onSubmit={handleSubmit}
            className="mt-8"
          >
            {mode === "signup" && (
              <>
                <label
                  htmlFor="username"
                  className="block text-sm text-zinc-400"
                >
                  ユーザーネーム
                </label>

                <div className="mt-2 flex items-center rounded-xl border border-zinc-700 bg-zinc-950 focus-within:border-emerald-400">
                  <span className="pl-4 text-zinc-500">
                    @
                  </span>

                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(event) =>
                      setUsername(
                        event.target.value
                          .toLowerCase()
                          .replace(
                            /[^a-z0-9_]/g,
                            ""
                          )
                      )
                    }
                    required
                    minLength={3}
                    maxLength={20}
                    autoComplete="username"
                    placeholder="music_user"
                    className="w-full bg-transparent px-2 py-3 outline-none"
                  />
                </div>

                <p className="mt-2 text-xs text-zinc-500">
                  3～20文字の半角英数字と_が使えます。
                </p>
              </>
            )}

            <label
              htmlFor="email"
              className={`block text-sm text-zinc-400 ${
                mode === "signup" ? "mt-6" : ""
              }`}
            >
              メールアドレス
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              autoComplete="email"
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-emerald-400"
            />

            <label
              htmlFor="password"
              className="mt-6 block text-sm text-zinc-400"
            >
              パスワード
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              minLength={6}
              autoComplete={
                mode === "login"
                  ? "current-password"
                  : "new-password"
              }
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-emerald-400"
            />

            {message && (
              <p className="mt-5 rounded-xl bg-zinc-800 p-4 text-sm leading-6 text-zinc-300">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-full bg-emerald-400 px-6 py-3 font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-50"
            >
              {submitting
                ? "処理中..."
                : mode === "login"
                  ? "ログインする"
                  : "登録する"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(
                mode === "login"
                  ? "signup"
                  : "login"
              );
              setMessage("");
            }}
            className="mt-6 w-full text-sm text-zinc-400 hover:text-white"
          >
            {mode === "login"
              ? "アカウントを持っていない方はこちら"
              : "すでにアカウントを持っている方はこちら"}
          </button>
        </section>
      </div>
    </main>
  );
}