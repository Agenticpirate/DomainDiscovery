import React from 'react';
import type { AffiliateAdCreative } from '@/lib/affiliateAds';

/** Strip creatives are live type so they stay sharp and full-bleed at any width. */
export function isCrispStrip(creative: Pick<AffiliateAdCreative, 'id'>): boolean {
  return creative.id === '1825519' || creative.id === '3832105';
}

/** Official Spaceship symbol: rounded cursor triangle with the base notch. */
export function SpaceshipMark({
  className = 'h-5 w-5 shrink-0 sm:h-6 sm:w-6',
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M11.9997 1.2529c1.0445 0 1.956.5689 2.441 1.4125l4.5883 7.9314 4.45 7.6915c.0466.074.2105.3585.27.4938.2216.4677.2505.9472.251 1.1595 0 1.5496-1.2587 2.8056-2.8116 2.8056-.2949 0-.579-.045-.8457-.129l-7.9011-2.6061a1.406 1.406 0 0 0-.4413-.0705 1.413 1.413 0 0 0-.442.0705L3.658 22.6183l-.1623.0456a2.8398 2.8398 0 0 1-.6838.0831c-1.5531 0-2.8119-1.256-2.8119-2.8056.002-.243.0234-.5533.168-.9578.0294-.0911.0743-.176.1115-.264.0712-.1487.1607-.2875.2411-.4313l4.4493-7.6916 4.5883-7.9313c.485-.8437 1.3971-1.4126 2.4416-1.4126z"
      />
    </svg>
  );
}

function SpaceshipStrip() {
  return (
    <div
      className="flex h-full min-h-[76px] min-[390px]:min-h-[82px] w-full flex-row items-center justify-between gap-2 min-[390px]:gap-3 px-3 min-[390px]:px-4 py-2.5 min-[390px]:py-3 sm:min-h-[112px] sm:gap-6 sm:px-8 sm:py-5"
      style={{
        background:
          'linear-gradient(100deg, #1d4ed8 0%, #2563eb 18%, #2dd4bf 48%, #3b82f6 72%, #1e40af 100%)',
      }}
    >
      {/* Left: Brand Logo */}
      <div className="flex shrink-0 items-center gap-1.5 text-white sm:gap-2.5">
        <SpaceshipMark className="h-4.5 w-4.5 sm:h-9 sm:w-9" />
        <span className="text-[12px] min-[380px]:text-[13px] font-bold leading-none tracking-[-0.03em] sm:text-[22px]">
          spaceship
        </span>
      </div>

      {/* Center: Copy */}
      <div className="min-w-0 flex-1 px-1 sm:px-2 text-left sm:text-center text-white">
        <p className="text-[11px] min-[380px]:text-[11.5px] font-semibold leading-[1.3] tracking-[-0.015em] sm:text-[22px] sm:font-semibold sm:leading-tight [text-rendering:geometricPrecision]">
          <span className="block sm:inline whitespace-nowrap">Want to manage your domain</span>{' '}
          <span className="block sm:inline whitespace-nowrap">easier, cheaper?</span>
        </p>
        <p className="mt-0.5 hidden text-[14px] font-medium leading-snug text-white/90 sm:mt-1 sm:block sm:text-[16px]">
          You&apos;re closer than you think
        </p>
      </div>

      {/* Right: CTA Button */}
      <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-2.5 min-[380px]:px-3.5 py-1.5 min-[380px]:py-2 text-[10.5px] min-[380px]:text-[11.5px] font-bold leading-none text-[#2563eb] shadow-md active:scale-95 transition-transform sm:px-6 sm:py-3 sm:text-[17px]">
        Register now
      </span>
    </div>
  );
}

function SpacemailStrip() {
  return (
    <div
      className="flex h-full min-h-[76px] min-[390px]:min-h-[82px] w-full flex-row items-center justify-between gap-2 min-[390px]:gap-3 px-3 min-[390px]:px-4 py-2.5 min-[390px]:py-3 sm:min-h-[112px] sm:gap-6 sm:px-8 sm:py-5"
      style={{
        background:
          'linear-gradient(90deg, #20163b 0%, #291a4c 28%, #352067 52%, #2a1b4e 78%, #291a4c 100%)',
      }}
    >
      {/* Left: Brand Logo */}
      <div className="flex shrink-0 items-center gap-1.5 text-white sm:flex-col sm:gap-1.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/ads/spacemail-mark.png"
          alt=""
          width={253}
          height={239}
          className="h-4.5 w-4.5 sm:h-12 sm:w-12"
          draggable={false}
        />
        <span className="text-[12px] min-[380px]:text-[13px] font-bold leading-none tracking-[-0.03em] sm:text-[16px]">
          spacemail
        </span>
      </div>

      {/* Center: Copy */}
      <div className="min-w-0 flex-1 px-1 sm:px-2 text-left sm:text-center text-white [text-rendering:geometricPrecision]">
        <p className="text-[11px] min-[380px]:text-[11.5px] font-semibold leading-[1.3] tracking-[-0.015em] sm:hidden">
          <span className="block whitespace-nowrap">Premium email for your</span>
          <span className="block whitespace-nowrap">domains, made simple.</span>
        </p>
        <p className="hidden text-[26px] font-semibold leading-tight tracking-[-0.03em] sm:block">
          Premium email for your domains,
          <br />
          made simple.
        </p>
      </div>

      {/* Right: CTA Button */}
      <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#793bff] px-2.5 min-[380px]:px-3.5 py-1.5 min-[380px]:py-2 text-[10.5px] min-[380px]:text-[11.5px] font-bold leading-none text-white shadow-md active:scale-95 transition-transform sm:px-7 sm:py-3 sm:text-[17px]">
        Start free
      </span>
    </div>
  );
}

export function CrispAffiliateStrip({ creative }: { creative: Pick<AffiliateAdCreative, 'id'> }) {
  if (creative.id === '3832105') return <SpacemailStrip />;
  return <SpaceshipStrip />;
}
