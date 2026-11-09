'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/components/i18n/LocaleProvider';
import { rich } from '@/components/i18n/rich';
import { pngFileName, renderWhoisSharePng } from '@/lib/whoisShareImage';
import {
  buildSocialCaption,
  buildSocialPostText,
  buildWhoisShareUrl,
  getShareOrigin,
  isLocalShareOrigin,
  isSociallyCrawlableOrigin,
} from '@/lib/whoisShareMeta';

export type WhoisShareData = {
  domain: string;
  registrar: string;
  status: string;
  statuses?: string[];
  registrationDate: string | null;
  expirationDate: string | null;
  updatedDate?: string | null;
  nameServers: string[];
  dnssec?: boolean;
  registrant?: {
    organization?: string | null;
    country?: string | null;
  };
  source?: string;
  available?: boolean;
};

type ShareChannel =
  | 'image'
  | 'x'
  | 'linkedin'
  | 'facebook'
  | 'whatsapp'
  | 'telegram'
  | 'email'
  | 'download'
  | 'copyImage'
  | 'copy'
  | 'copyLink';

type SocialId = 'x' | 'linkedin' | 'facebook' | 'whatsapp' | 'telegram' | 'email';

const SOCIAL: Record<
  SocialId,
  {
    label: string;
    /** Short label under icon — empty for X so logo isn’t doubled */
    chip: string;
    /**
     * Build network share URL.
     * caption = text without link; shareUrl = public page whose OG image is the card.
     * Platforms embed the card image from the link automatically.
     */
    intent: (caption: string, shareUrl: string, title: string) => string;
  }
> = {
  x: {
    label: 'X',
    chip: 'Post',
    intent: (caption, shareUrl) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(shareUrl)}`,
  },
  linkedin: {
    label: 'LinkedIn',
    chip: 'Share',
    intent: (_c, shareUrl) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  },
  facebook: {
    label: 'Facebook',
    chip: 'Share',
    intent: (_c, shareUrl) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
  },
  whatsapp: {
    label: 'WhatsApp',
    chip: 'Send',
    // WhatsApp has no separate url param — put caption + link in body
    intent: (caption, shareUrl) =>
      `https://wa.me/?text=${encodeURIComponent(`${caption}\n\n${shareUrl}`)}`,
  },
  telegram: {
    label: 'Telegram',
    chip: 'Send',
    intent: (caption, shareUrl) =>
      `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(caption)}`,
  },
  email: {
    label: 'Email',
    chip: 'Mail',
    intent: (caption, shareUrl, title) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${caption}\n\n${shareUrl}`)}`,
  },
};

function openShareWindow(url: string) {
  if (typeof window === 'undefined') return;
  const w = 640;
  const h = 560;
  const left = Math.max(0, (window.screen.width - w) / 2);
  const top = Math.max(0, (window.screen.height - h) / 2);
  window.open(url, '_blank', `noopener,noreferrer,width=${w},height=${h},left=${left},top=${top}`);
}

function canShareFiles(file: File): boolean {
  try {
    return (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [file] })
    );
  } catch {
    return false;
  }
}

function SocialIcon({ id, className = 'h-4 w-4' }: { id: SocialId | 'download' | 'copy' | 'image'; className?: string }) {
  const c = className;
  switch (id) {
    case 'x':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      );
    case 'telegram':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      );
    case 'email':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case 'download':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      );
    case 'copy':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    default:
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
  }
}

interface WhoisShareCardProps {
  data: WhoisShareData;
}

export function WhoisShareCard({ data }: WhoisShareCardProps) {
  const t = useT();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [supportsImageShare, setSupportsImageShare] = useState(false);
  const shareOrigin = useMemo(() => getShareOrigin(), []);
  const pageUrl = useMemo(() => buildWhoisShareUrl(data.domain, shareOrigin), [data.domain, shareOrigin]);
  const localShare = isLocalShareOrigin(shareOrigin);
  const crawlable = isSociallyCrawlableOrigin(shareOrigin) && !localShare;
  const caption = useMemo(() => buildSocialCaption(data.domain), [data.domain]);
  /** Caption + link for clipboard / preview */
  const postText = useMemo(() => buildSocialPostText(data.domain, pageUrl), [data.domain, pageUrl]);
  const shareTitle = `WHOIS · ${data.domain}`;

  const flash = useCallback((msg: string) => {
    setFeedback(msg);
    window.setTimeout(() => setFeedback(null), 2800);
  }, []);

  const rebuildImage = useCallback(async () => {
    const blob = await renderWhoisSharePng({
      domain: data.domain,
      registrar: data.registrar,
      status: data.status,
      registrationDate: data.registrationDate,
      expirationDate: data.expirationDate,
      updatedDate: data.updatedDate,
      nameServers: data.nameServers,
      dnssec: data.dnssec,
      registrant: data.registrant,
      available: data.available,
    });
    return blob;
  }, [data]);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    (async () => {
      try {
        const blob = await rebuildImage();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
        setImageBlob(blob);
        const file = new File([blob], pngFileName(data.domain), { type: 'image/png' });
        setSupportsImageShare(canShareFiles(file));
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [data.domain, rebuildImage]);

  const ensureBlob = useCallback(async () => {
    if (imageBlob) return imageBlob;
    const blob = await rebuildImage();
    setImageBlob(blob);
    return blob;
  }, [imageBlob, rebuildImage]);

  const downloadPng = useCallback(
    async (blob?: Blob) => {
      const png = blob ?? (await ensureBlob());
      const url = URL.createObjectURL(png);
      const a = document.createElement('a');
      a.href = url;
      a.download = pngFileName(data.domain);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    },
    [data.domain, ensureBlob]
  );

  const sharePngFile = useCallback(
    async (blob: Blob) => {
      const file = new File([blob], pngFileName(data.domain), { type: 'image/png' });
      if (canShareFiles(file)) {
        await navigator.share({
          files: [file],
          title: shareTitle,
          text: `${shareTitle}\n${pageUrl}`,
        });
        return true;
      }
      return false;
    },
    [data.domain, pageUrl, shareTitle]
  );

  const copyImage = useCallback(async (blob: Blob) => {
    if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) {
      throw new Error('Clipboard image not supported');
    }
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
  }, []);

  /**
   * Social buttons open the network composer with our share-page URL in the post.
   * X/LinkedIn/Facebook fetch Open Graph from that URL and auto-show the WHOIS card image.
   * No local download required for the social path.
   */
  const openSocialComposer = useCallback(
    (id: SocialId) => {
      if (localShare && id !== 'email') {
        flash(t('Card image won’t show on social until the site is public HTTPS (not localhost)'));
      }
      const conf = SOCIAL[id];
      const href = conf.intent(caption, pageUrl, shareTitle);
      if (id === 'email') {
        window.location.href = href;
      } else {
        openShareWindow(href);
      }
      if (!localShare) {
        flash(t('Opened {s} · image card loads from the public link', { s: conf.label }));
      }
    },
    [caption, flash, localShare, pageUrl, shareTitle, t]
  );

  const share = useCallback(
    async (channel: ShareChannel) => {
      setBusy(true);
      try {
        // Optional: device share sheet with PNG file (AirDrop / Messages, etc.)
        if (channel === 'image') {
          const blob = await ensureBlob();
          try {
            const ok = await sharePngFile(blob);
            if (ok) {
              flash(t('Shared via device sheet'));
              return;
            }
          } catch (err) {
            if ((err as Error)?.name === 'AbortError') return;
          }
          // Fallback: copy the public share link (best for social previews)
          await navigator.clipboard.writeText(pageUrl);
          flash(t('Share link copied — paste in any app for the card preview'));
          return;
        }

        if (channel === 'download') {
          await downloadPng();
          flash(t('Card image downloaded'));
          return;
        }

        if (channel === 'copyImage') {
          const blob = await ensureBlob();
          try {
            await copyImage(blob);
            flash(t('Card image copied'));
          } catch {
            await downloadPng(blob);
            flash(t('Downloaded (clipboard blocked)'));
          }
          return;
        }

        if (channel === 'copy') {
          await navigator.clipboard.writeText(postText);
          flash(t('Post text + link copied'));
          return;
        }

        if (channel === 'copyLink') {
          await navigator.clipboard.writeText(pageUrl);
          flash(t('Share link copied'));
          return;
        }

        if (channel in SOCIAL) {
          openSocialComposer(channel as SocialId);
        }
      } catch {
        flash(t('Share failed — try Copy link'));
      } finally {
        setBusy(false);
      }
    },
    [copyImage, downloadPng, ensureBlob, flash, openSocialComposer, pageUrl, postText, sharePngFile, t]
  );

  const statusTone = data.available
    ? isLight
      ? 'text-emerald-700'
      : 'text-emerald-300'
    : isLight
      ? 'text-slate-800'
      : 'text-white';

  const socialIds: SocialId[] = ['x', 'linkedin', 'facebook', 'whatsapp', 'telegram', 'email'];

  return (
    <div
      className={`relative rounded-2xl border overflow-hidden ${
        isLight ? 'border-slate-200 bg-slate-50/90' : 'border-white/10 bg-[#0a0a0a]'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2 px-3.5 pt-3.5 sm:px-4 sm:pt-4">
        <div className="min-w-0 max-w-2xl">
          <div
            className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
              isLight ? 'text-slate-500' : 'text-white/40'
            }`}
          >
            {t('Share')}
          </div>
          <p className={`mt-0.5 text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-white/90'}`}>
            {t('Send this record')}
          </p>
          <p className={`mt-1 text-[12px] leading-relaxed ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
            {t('Download the card, or open it in the app you already use. The image appears under the post once the link is public.')}
          </p>
        </div>
        {feedback && (
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
              isLight
                ? 'border-[#d7dbdc] bg-white text-slate-800'
                : 'border-white/15 bg-[#111111] text-white/80'
            }`}
          >
            {feedback}
          </span>
        )}
      </div>

      {/* Localhost / crawl warning */}
      {localShare && (
        <div
          className={`mx-3.5 mt-3 rounded-xl border px-3 py-2.5 text-[12px] leading-relaxed sm:mx-4 ${
            isLight
              ? 'border-[#d7dbdc] bg-white text-slate-700'
              : 'border-white/10 bg-[#111111] text-white/70'
          }`}
        >
          {t('Image previews need a public link. On localhost, share still opens with the caption and URL. The card image appears after you deploy.')}
        </div>
      )}
      {!localShare && crawlable && (
        <div
          className={`mx-3.5 mt-3 rounded-xl border px-3 py-2 text-[11px] sm:mx-4 ${
            isLight ? 'border-slate-200 bg-white text-slate-600' : 'border-white/10 bg-[#0a0a0a] text-white/50'
          }`}
        >
          {rich(t('Share links use {origin} so networks can fetch the card image.'), {
            origin: <span className="font-mono text-[10px]">{shareOrigin}</span>,
          })}
        </div>
      )}

      <div className="grid gap-4 p-3.5 sm:p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* LEFT: flat share card on the same dot field as the homepage hero */}
        <div className="min-w-0 space-y-3 overflow-hidden">
          <div
            className={`relative overflow-hidden rounded-2xl border ${
              isLight ? 'border-[#d7dbdc] bg-white' : 'border-white/10 bg-black'
            }`}
          >
            <div className="ambient-edge-fade pointer-events-none absolute inset-0" aria-hidden>
              <div className="absolute inset-0 ambient-dots ambient-breathe" />
              <div className="absolute inset-0 ambient-sweep">
                <div className="ambient-sweep-band">
                  <div className="ambient-dots ambient-sweep-dots" />
                </div>
              </div>
            </div>
            <div className="relative z-[1] mx-auto max-w-sm px-4 py-6 sm:py-8">
              <div
                className={`relative overflow-hidden rounded-2xl border ${
                  isLight
                    ? 'border-[#d7dbdc] bg-white shadow-[0_16px_40px_-24px_rgba(15,23,42,0.35)]'
                    : 'border-white/10 bg-[#111111] shadow-[0_20px_50px_-24px_rgba(0,0,0,0.85)]'
                }`}
              >
                <div className="relative p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div
                        className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                          isLight ? 'text-slate-500' : 'text-white/45'
                        }`}
                      >
                        DomainDiscovery · WHOIS
                      </div>
                      <h4 className={`mt-1.5 text-xl font-semibold tracking-tight break-all ${statusTone}`}>
                        {data.domain}
                      </h4>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        isLight
                          ? 'border-[#d7dbdc] bg-white text-slate-600'
                          : 'border-white/15 bg-white/[0.06] text-white/60'
                      }`}
                    >
                      RDAP
                    </span>
                  </div>

                  <div
                    className={`mt-3.5 grid grid-cols-2 gap-2 rounded-xl border p-2.5 ${
                      isLight ? 'border-[#d7dbdc] bg-[#f7f8f8]' : 'border-white/10 bg-black/40'
                    }`}
                  >
                    <Field label="Status" value={data.status || '—'} isLight={isLight} />
                    <Field label="Registrar" value={data.registrar || '—'} isLight={isLight} />
                    <Field label="Registered" value={data.registrationDate || '—'} isLight={isLight} />
                    <Field label="Expires" value={data.expirationDate || '—'} isLight={isLight} />
                    {typeof data.dnssec === 'boolean' && (
                      <Field label="DNSSEC" value={data.dnssec ? 'Signed' : 'Unsigned'} isLight={isLight} />
                    )}
                    {data.nameServers[0] && (
                      <Field label="Name server" value={data.nameServers[0]} isLight={isLight} mono />
                    )}
                  </div>

                  <div
                    className={`mt-2.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em] ${
                      isLight ? 'text-slate-400' : 'text-white/30'
                    }`}
                  >
                    <span>{t('Share card')}</span>
                    <span>{t('export → PNG')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mock: how the post looks on X (image under caption — not inside the text box) */}
          <div className="min-w-0">
            <div
              className={`mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] ${
                isLight ? 'text-slate-500' : 'text-white/40'
              }`}
            >
              {t('Post preview')}
            </div>
            <div
              className={`overflow-hidden rounded-2xl border ${
                isLight ? 'border-[#d7dbdc] bg-white' : 'border-white/10 bg-[#111111]'
              }`}
            >
              <div className="flex gap-3 p-3">
                <div
                  className={`h-10 w-10 shrink-0 rounded-full ${
                    isLight ? 'bg-slate-200' : 'bg-white/15'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className={`text-[13px] font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    You <span className={`font-normal ${isLight ? 'text-slate-400' : 'text-white/40'}`}>@you</span>
                  </div>
                  <pre
                    className={`mt-1 whitespace-pre-wrap break-words font-sans text-[13px] leading-snug ${
                      isLight ? 'text-slate-800' : 'text-white/90'
                    }`}
                  >
                    {caption}
                  </pre>
                  <div
                    className={`mt-1 text-[13px] underline underline-offset-2 ${isLight ? 'text-slate-800' : 'text-white/80'}`}
                  >
                    {pageUrl.replace(/^https?:\/\//, '')}
                  </div>
                  <div
                    className={`mt-2 overflow-hidden rounded-2xl border ${
                      isLight ? 'border-slate-200' : 'border-white/15'
                    }`}
                  >
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt={`WHOIS card preview for ${data.domain}`}
                        className="block w-full h-auto"
                      />
                    ) : (
                      <div className="aspect-video animate-pulse bg-white/5" />
                    )}
                    <div
                      className={`border-t px-3 py-2 ${
                        isLight ? 'border-slate-100 bg-slate-50' : 'border-white/10 bg-black'
                      }`}
                    >
                      <div
                        className={`text-[10px] uppercase tracking-wide ${
                          isLight ? 'text-slate-400' : 'text-white/35'
                        }`}
                      >
                        {localShare ? 'localhost · not crawlable by X' : shareOrigin.replace(/^https?:\/\//, '')}
                      </div>
                      <div className={`text-[12px] font-semibold ${isLight ? 'text-slate-800' : 'text-white/80'}`}>
                        WHOIS · {data.domain}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: actions */}
        <div className="flex flex-col gap-3.5 min-w-0">
          <div>
            <div
              className={`text-[10px] font-bold uppercase tracking-[0.16em] mb-2 ${
                isLight ? 'text-slate-500' : 'text-white/40'
              }`}
            >
              {t('Card')}
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => void share('image')}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition disabled:opacity-50 ${
                isLight
                  ? 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800'
                  : 'border-white bg-white text-black hover:bg-white/90'
              }`}
            >
              <SocialIcon id="image" className="h-4 w-4" />
              {t('Share card image')}
            </button>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                disabled={busy}
                onClick={() => void share('download')}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-[11px] font-bold transition disabled:opacity-50 ${
                  isLight
                    ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    : 'border-white/10 bg-[#111111] text-white/80 hover:border-white/20'
                }`}
              >
                <SocialIcon id="download" className="h-3.5 w-3.5" />
                {t('Download PNG')}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void share('copyImage')}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-[11px] font-bold transition disabled:opacity-50 ${
                  isLight
                    ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    : 'border-white/10 bg-[#111111] text-white/80 hover:border-white/20'
                }`}
              >
                <SocialIcon id="copy" className="h-3.5 w-3.5" />
                {t('Copy image')}
              </button>
            </div>
          </div>

          <div>
            <div
              className={`text-[10px] font-bold uppercase tracking-[0.16em] mb-2 ${
                isLight ? 'text-slate-500' : 'text-white/40'
              }`}
            >
              {t('Post it')}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {socialIds.map((id) => {
                const conf = SOCIAL[id];
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={busy}
                    onClick={() => void share(id)}
                    aria-label={t('Share on {s}', { s: conf.label })}
                    title={
                      localShare
                        ? t('Opens {s} with caption + localhost link (no image card until public HTTPS)', { s: conf.label })
                        : t('Opens {s} with caption + share link (card image via Open Graph)', { s: conf.label })
                    }
                    className={`inline-flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2.5 text-[10px] font-bold transition disabled:opacity-50 ${
                      isLight
                        ? 'border-[#d7dbdc] bg-white text-slate-800 hover:bg-[#f4f5f5]'
                        : 'border-white/10 bg-[#111111] text-white/85 hover:bg-white/[0.06]'
                    }`}
                  >
                    <SocialIcon id={id} className="h-4 w-4" />
                    <span className="leading-none">{conf.chip ? t(conf.chip) : conf.chip}</span>
                  </button>
                );
              })}
            </div>
            <p className={`mt-2 text-[12px] leading-relaxed ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
              {t('Opens the compose window you already use. We never ask for a social password.')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              disabled={busy}
              onClick={() => void share('copy')}
              className={`rounded-xl border px-2 py-2 text-[11px] font-bold transition disabled:opacity-50 ${
                isLight
                  ? 'border-slate-200 bg-white text-slate-600'
                  : 'border-white/10 bg-[#0a0a0a] text-white/65'
              }`}
            >
              {t('Copy text')}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void share('copyLink')}
              className={`rounded-xl border px-2 py-2 text-[11px] font-bold transition disabled:opacity-50 ${
                isLight
                  ? 'border-slate-200 bg-white text-slate-600'
                  : 'border-white/10 bg-[#0a0a0a] text-white/65'
              }`}
            >
              {t('Copy link')}
            </button>
          </div>

          <pre
            className={`max-h-[120px] overflow-auto rounded-xl border p-3 text-[11px] leading-relaxed whitespace-pre-wrap break-words font-mono ${
              isLight ? 'border-slate-200 bg-white text-slate-600' : 'border-white/10 bg-black text-white/55'
            }`}
          >
            {postText}
          </pre>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  isLight,
  mono,
}: {
  label: string;
  value: string;
  isLight: boolean;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div
        className={`text-[9px] font-bold uppercase tracking-[0.14em] ${
          isLight ? 'text-slate-400' : 'text-white/35'
        }`}
      >
        {label}
      </div>
      <div
        className={`mt-0.5 text-[11px] font-semibold truncate ${mono ? 'font-mono' : ''} ${
          isLight ? 'text-slate-800' : 'text-white/85'
        }`}
        title={value}
      >
        {value}
      </div>
    </div>
  );
}
