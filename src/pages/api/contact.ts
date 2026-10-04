import type { APIRoute } from 'astro';
import { RESEND_API_KEY, CONTACT_TO, CONTACT_FROM } from 'astro:env/server';
import { isLang, contactUrl } from '../../i18n/utils';

// Seule route exécutée côté serveur (fonction Vercel) : reçoit le formulaire de contact
// et l'envoie par e-mail via l'API Resend. La clé ne quitte jamais le serveur.
export const prerender = false;

const LIMITS = { nom: 120, email: 200, sujet: 80, message: 5000 };

function field(data: FormData, name: keyof typeof LIMITS) {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim().slice(0, LIMITS[name]) : '';
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const wantsJson = request.headers.get('accept')?.includes('application/json');
  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return new Response(null, { status: 400 });
  }

  const langValue = data.get('langue')?.toString();
  const lang = isLang(langValue) ? langValue : 'fr';
  // Sans JavaScript, on revient sur la page de contact ; l'ancre affiche le bon message (CSS :target).
  const reply = (ok: boolean, status: number) =>
    wantsJson
      ? Response.json({ ok }, { status })
      : redirect(`${contactUrl(lang)}#${ok ? 'contact-success' : 'contact-error'}`, 303);

  // Champ piège : rempli uniquement par les robots. On fait comme si tout allait bien.
  if (data.get('site_web')) return reply(true, 200);

  const nom = field(data, 'nom');
  const email = field(data, 'email');
  const sujet = field(data, 'sujet').replace(/[\r\n]+/g, ' ');
  const message = field(data, 'message');
  if (!nom || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(false, 400);

  if (!RESEND_API_KEY || !CONTACT_TO) {
    console.error('Formulaire de contact : RESEND_API_KEY ou CONTACT_TO manquant.');
    return reply(false, 500);
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // Une variable définie mais vide ne déclenche pas la valeur par défaut d'astro:env.
      from: CONTACT_FROM || 'AREMS <onboarding@resend.dev>',
      to: CONTACT_TO.split(',').map((a) => a.trim()),
      reply_to: email,
      subject: `[AREMS] ${sujet || 'Contact'} · ${nom}`,
      text: `Nom : ${nom}\nE-mail : ${email}\nSujet : ${sujet}\nLangue du site : ${lang}\n\n${message}`,
    }),
  });

  if (!response.ok) {
    console.error('Resend a refusé l’envoi :', response.status, await response.text());
    return reply(false, 502);
  }
  return reply(true, 200);
};
