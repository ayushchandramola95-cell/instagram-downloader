import { NextRequest, NextResponse } from "next/server";
import { getTranslationsData, saveTranslationsData, LanguageMeta } from "@/lib/translations-store";

export const dynamic = "force-dynamic";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "gramsave2026";

export async function GET(req: NextRequest) {
  try {
    const data = await getTranslationsData();
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang");

    if (lang && data.strings[lang]) {
      return NextResponse.json({
        languages: data.languages,
        lang,
        strings: data.strings[lang],
      });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load translations";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { secret, action, language, strings, code } = body;

    // Verify admin passcode
    if (!secret || secret !== ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: "Unauthorized: Invalid developer secret." }, { status: 401 });
    }

    const currentData = await getTranslationsData();

    if (action === "update_strings") {
      // Update strings for a specific language
      if (!code || !strings) {
        return NextResponse.json({ success: false, error: "Missing language code or strings." }, { status: 400 });
      }

      currentData.strings[code] = {
        ...(currentData.strings[code] || {}),
        ...strings,
      };

      const saved = await saveTranslationsData(currentData);
      if (!saved) throw new Error("Failed to write to translations file.");

      return NextResponse.json({ success: true, message: `Updated strings for language '${code}'.` });
    }

    if (action === "add_language") {
      // Add a brand new language
      if (!language || !language.code || !language.name) {
        return NextResponse.json({ success: false, error: "Invalid language specification." }, { status: 400 });
      }

      const langCode = language.code.toLowerCase().trim();
      const existingIndex = currentData.languages.findIndex((l) => l.code === langCode);

      const newLangObj: LanguageMeta = {
        code: langCode,
        name: language.name.trim(),
        nativeName: language.nativeName?.trim() || language.name.trim(),
        flag: language.flag || "🌐",
        dir: language.dir === "rtl" ? "rtl" : "ltr",
        active: true,
      };

      if (existingIndex >= 0) {
        currentData.languages[existingIndex] = newLangObj;
      } else {
        currentData.languages.push(newLangObj);
      }

      // Initialize with English template if not present
      if (!currentData.strings[langCode]) {
        currentData.strings[langCode] = { ...(currentData.strings["en"] || {}) };
      }

      const saved = await saveTranslationsData(currentData);
      if (!saved) throw new Error("Failed to write to translations file.");

      return NextResponse.json({ success: true, message: `Language '${langCode}' added successfully!` });
    }

    if (action === "toggle_language") {
      if (!code) {
        return NextResponse.json({ success: false, error: "Missing language code." }, { status: 400 });
      }
      const lang = currentData.languages.find((l) => l.code === code);
      if (lang) {
        lang.active = !lang.active;
        await saveTranslationsData(currentData);
        return NextResponse.json({ success: true, message: `Language '${code}' status changed.` });
      }
      return NextResponse.json({ success: false, error: "Language not found." }, { status: 404 });
    }

    if (action === "delete_language") {
      if (!code || code === "en") {
        return NextResponse.json({ success: false, error: "Cannot delete the default English language." }, { status: 400 });
      }
      currentData.languages = currentData.languages.filter((l) => l.code !== code);
      delete currentData.strings[code];
      await saveTranslationsData(currentData);
      return NextResponse.json({ success: true, message: `Language '${code}' deleted.` });
    }

    return NextResponse.json({ success: false, error: "Unknown action." }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error processing request";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
