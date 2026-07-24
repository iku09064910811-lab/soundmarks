import { NextRequest, NextResponse } from "next/server";

type MusicBrainzArtistCredit = {
  name: string;
};

type MusicBrainzReleaseGroup = {
  id: string;
  title: string;
  score?: number;
  "first-release-date"?: string;
  "artist-credit"?: MusicBrainzArtistCredit[];
  "primary-type"?: string;
};

type MusicBrainzSearchResponse = {
  "release-groups"?: MusicBrainzReleaseGroup[];
};

let lastRequestTime = 0;

function escapeQuery(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"');
}

async function waitForRateLimit() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  const waitTime = Math.max(0, 1100 - elapsed);

  if (waitTime > 0) {
    await new Promise((resolve) =>
      setTimeout(resolve, waitTime)
    );
  }

  lastRequestTime = Date.now();
}

export async function GET(request: NextRequest) {
  const query =
    request.nextUrl.searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({
      albums: [],
    });
  }

  await waitForRateLimit();

  const escapedQuery = escapeQuery(query);

  const musicBrainzQuery =
    `(${escapedQuery} OR ` +
    `releasegroup:"${escapedQuery}" OR ` +
    `artist:"${escapedQuery}" OR ` +
    `artistname:"${escapedQuery}") ` +
    `AND primarytype:album`;

  const url = new URL(
    "https://musicbrainz.org/ws/2/release-group"
  );

  url.searchParams.set("query", musicBrainzQuery);
  url.searchParams.set("fmt", "json");
  url.searchParams.set("limit", "30");

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Soundmarks/0.1 (iku09064910811@gmail.com)",
      },
      cache: "no-store",
    });

    if (response.status === 503) {
      return NextResponse.json(
        {
          message:
            "MusicBrainzのアクセス制限中です。数秒待ってから、もう一度検索してください。",
          albums: [],
        },
        {
          status: 503,
        }
      );
    }

    if (!response.ok) {
      const responseText =
        await response.text();

      console.error(
        "MusicBrainz API error:",
        response.status,
        responseText
      );

      return NextResponse.json(
        {
          message:
            `MusicBrainzから検索結果を取得できませんでした。エラー：${response.status}`,
          albums: [],
        },
        {
          status: response.status,
        }
      );
    }

    const data =
      (await response.json()) as MusicBrainzSearchResponse;

    const albums = (
      data["release-groups"] ?? []
    )
      .filter(
        (album) =>
          !album["primary-type"] ||
          album["primary-type"] === "Album"
      )
      .map((album) => ({
        id: album.id,
        title: album.title,
        artist:
          album["artist-credit"]
            ?.map((credit) => credit.name)
            .join(", ") ??
          "不明なアーティスト",
        year:
          album["first-release-date"]?.slice(
            0,
            4
          ) ?? null,
        score: album.score ?? 0,
        coverUrl:
          `https://coverartarchive.org/release-group/${album.id}/front-500`,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 24);

    return NextResponse.json({
      albums,
    });
  } catch (error) {
    console.error(
      "アルバム検索エラー:",
      error
    );

    return NextResponse.json(
      {
        message:
          "検索中に通信エラーが発生しました。少し待ってから再試行してください。",
        albums: [],
      },
      {
        status: 500,
      }
    );
  }
}