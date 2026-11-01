'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { stripLocalePrefix } from '@/lib/i18n/locales';

export type RailBox = {
  top: number;
  left: number;
  width: number;
  height: number;
};

/** Search is full-bleed, so the side banners would cover the field. */
function sideRailsFit(pathname: string) {
  if (window.innerWidth < 1200) return false;
  return stripLocalePrefix(pathname || '/') !== '/search';
}

/** Fixed viewport slot under the nav. Scroll does not change this. */
function viewportFrame() {
  const nav = document.querySelector('nav');
  const navBottom = nav ? nav.getBoundingClientRect().bottom : 76;
  const top = Math.max(Math.round(navBottom + 12), 76);
  const height = Math.max(0, Math.round(window.innerHeight - 12 - top));
  return { top, height };
}

/**
 * Space from `top` down to the footer wordmark.
 * The menu above that name stays clear for the ad spots.
 */
function heightAboveFooter(top: number, viewportHeight: number) {
  const brand = document.querySelector('[data-footer-brand]');
  const footer = document.querySelector('footer');
  const limitTop = brand
    ? brand.getBoundingClientRect().top
    : footer
      ? footer.getBoundingClientRect().top
      : Infinity;
  const untilLimit = Math.round(limitTop - 12 - top);
  return Math.max(0, Math.min(viewportHeight, untilLimit));
}

function sameBox(prev: RailBox | null, next: RailBox | null) {
  if (!next && !prev) return true;
  if (!next || !prev) return false;
  return (
    prev.top === next.top &&
    prev.left === next.left &&
    prev.width === next.width &&
    prev.height === next.height
  );
}

function watchRail(measure: () => void) {
  let frame = 0;
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(measure);
  };

  schedule();
  const later = [window.setTimeout(schedule, 250), window.setTimeout(schedule, 900)];
  window.addEventListener('resize', schedule);
  window.addEventListener('scroll', schedule, { passive: true });
  const observer =
    typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
  observer?.observe(document.body);

  return () => {
    cancelAnimationFrame(frame);
    later.forEach((id) => window.clearTimeout(id));
    window.removeEventListener('resize', schedule);
    window.removeEventListener('scroll', schedule);
    observer?.disconnect();
  };
}

/** Three full spots. The column never shrinks below this; it hides instead. */
const LEFT_HEIGHT_MIN = 484;
/** Right banner stays 160×600. It hides instead of cropping shorter. */
const RIGHT_HEIGHT = 600;

/**
 * Three-spot column in the empty left gutter.
 * Size stays fixed while scrolling. The column hides when the gutter
 * closes or the footer would force the spots to shrink.
 */
export function useLeftGutterBox(width: number) {
  const [box, setBox] = useState<RailBox | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const measure = () => {
      if (!sideRailsFit(pathname)) {
        setBox((prev) => (prev ? null : prev));
        return;
      }
      const frame = viewportFrame();
      const available = heightAboveFooter(frame.top, frame.height);
      const height = frame.height;
      const left = 12;
      // Height is the viewport slot, so scrolling does not compress the cards.
      // Once the footer wordmark would intersect that slot, hide the column.
      if (height < LEFT_HEIGHT_MIN || available < height) {
        setBox((prev) => (prev ? null : prev));
        return;
      }
      const next: RailBox = {
        top: frame.top,
        left,
        width,
        height,
      };
      setBox((prev) => (sameBox(prev, next) ? prev : next));
    };

    return watchRail(measure);
  }, [pathname, width]);

  return box;
}

/** Right skyscraper, only while the right gutter is empty. */
export function useRightSkyscraperBox() {
  const [box, setBox] = useState<RailBox | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const measure = () => {
      if (!sideRailsFit(pathname)) {
        setBox((prev) => (prev ? null : prev));
        return;
      }
      const frame = viewportFrame();
      const available = heightAboveFooter(frame.top, frame.height);
      const width = 160;
      const height = RIGHT_HEIGHT;
      const left = window.innerWidth - 12 - width;
      if (available < height) {
        setBox((prev) => (prev ? null : prev));
        return;
      }
      const next: RailBox = {
        top: frame.top,
        left,
        width,
        height,
      };
      setBox((prev) => (sameBox(prev, next) ? prev : next));
    };

    return watchRail(measure);
  }, [pathname]);

  return box;
}
