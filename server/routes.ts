import type { Express } from "express";
import type { Server } from "http";
import nodemailer from "nodemailer";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// simpele in-memory cache
const cache = new Map<string, { at: number; data: any }>();
function getCache(key: string, ttlMs: number) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > ttlMs) return null;
  return hit.data;
}
function setCache(key: string, data: any) {
  cache.set(key, { at: Date.now(), data });
}
console.log("ENV CHECK", {
  hasIGToken: !!process.env.INSTAGRAM_ACCESS_TOKEN,
  hasIGUser: !!process.env.INSTAGRAM_IG_USER_ID,
});
export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // ----------------------------
  // Healthcheck
  // ----------------------------
  app.get("/api/ping", (_req, res) => res.json({ ok: true }));

  // ----------------------------
  // Instagram: check if an ID is valid (requires token)
  // ----------------------------
  app.get("/api/ig-check/:id", async (req, res) => {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!token) {
      return res.status(500).json({
        message:
          "INSTAGRAM_ACCESS_TOKEN ontbreekt in .env (server). Zet dit alleen server-side.",
      });
    }

    const id = String(req.params.id || "").trim();
    if (!id) return res.status(400).json({ message: "ID ontbreekt." });

    const url =
      `https://graph.facebook.com/v21.0/${encodeURIComponent(id)}` +
      `?fields=id,username,media_count,name` +
      `&access_token=${encodeURIComponent(token)}`;

    const r = await fetch(url);
    const data = await r.json().catch(() => ({}));

    return res.status(r.ok ? 200 : 400).json(data);
  });

  // ----------------------------
  // Instagram: live media feed (server-side)
  // Requires:
  //   INSTAGRAM_ACCESS_TOKEN
  //   INSTAGRAM_IG_USER_ID   (numerieke id)
  // ----------------------------
  app.get("/api/instagram", async (_req, res) => {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;
    const igUserId = process.env.INSTAGRAM_IG_USER_ID;

    if (!token || !igUserId) {
      return res.status(500).json({
        message:
          "Instagram is niet ingesteld. Zet INSTAGRAM_ACCESS_TOKEN en INSTAGRAM_IG_USER_ID in .env (server).",
      });
    }

    const cached = getCache("instagram_feed", 5 * 60 * 1000);
    if (cached) return res.json(cached);

    const fields =
      "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
    const limit = 12;

    const url =
      `https://graph.facebook.com/v21.0/${encodeURIComponent(igUserId)}/media` +
      `?fields=${encodeURIComponent(fields)}` +
      `&limit=${limit}` +
      `&access_token=${encodeURIComponent(token)}`;

    const r = await fetch(url);
    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      // geen secrets loggen
      console.error("[instagram] error", data);
      return res.status(502).json({
        message: "Instagram ophalen mislukt.",
        error: data,
      });
    }

    setCache("instagram_feed", data);
    return res.json(data);
  });

  // ----------------------------
  // Contact form -> SMTP email
  // Requires:
  //   CONTACT_SMTP_HOST
  //   CONTACT_SMTP_PORT
  //   CONTACT_SMTP_USER
  //   CONTACT_SMTP_PASS   (Gmail app password)
  //   CONTACT_FROM_EMAIL
  //   CONTACT_TO_EMAIL
  // ----------------------------
  app.post("/api/contact", async (req, res) => {
    try {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const name = String(body.name ?? "").trim();
      const email = String(body.email ?? "").trim();
      const phone = String(body.phone ?? "").trim();
      const message = String(body.message ?? "").trim();
      const website = String(body.website ?? "").trim(); // honeypot

      // Honeypot anti-spam (bot niet verraden)
      if (website.length > 0) return res.status(200).json({ ok: true });

      // Validatie
      if (name.length < 2) {
        return res.status(400).json({ message: "Vul je naam in." });
      }
      if (!isValidEmail(email)) {
        return res
          .status(400)
          .json({ message: "Vul een geldig e-mailadres in." });
      }
      if (message.length < 10) {
        return res.status(400).json({ message: "Je bericht is te kort." });
      }

      // Env
      const host = process.env.CONTACT_SMTP_HOST;
      const port = Number(process.env.CONTACT_SMTP_PORT || "587");
      const user = process.env.CONTACT_SMTP_USER;
      const pass = process.env.CONTACT_SMTP_PASS;
      const toEmail = process.env.CONTACT_TO_EMAIL;
      const fromEmail = process.env.CONTACT_FROM_EMAIL || user;

      if (!host || !user || !pass || !toEmail || !fromEmail) {
        return res.status(500).json({
          message:
            "Contact is nog niet ingesteld (SMTP env ontbreekt). Zet CONTACT_SMTP_* en CONTACT_TO_EMAIL in .env.",
        });
      }

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true bij 465, anders false
        auth: { user, pass },
      });

      const subject = `Nieuw bericht via dikkezeehond.nl — ${name}`;
      const text =
        `Naam: ${name}\n` +
        `Email: ${email}\n` +
        `Telefoon: ${phone || "-"}\n\n` +
        `Bericht:\n${message}\n`;

      await transporter.sendMail({
        from: `Dikke Zeehond Website <${fromEmail}>`,
        to: toEmail,
        replyTo: email,
        subject,
        text,
      });

      return res.json({ ok: true });
    } catch (err) {
      console.error("[contact] error", err);
      return res
        .status(500)
        .json({ message: "Er ging iets mis bij het verzenden." });
    }
  });

  return httpServer;
}
