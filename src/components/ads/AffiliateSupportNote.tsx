import React from 'react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/components/i18n/LocaleProvider';
import type { LocaleId } from '@/lib/i18n/locales';

const AFFILIATE: Record<Exclude<LocaleId, 'en'>, { title: string; lead: string; rest: string }> = {
  zh: {
    title: '联盟披露',
    lead: '如果您通过我们的合作链接注册域名，我们可能从注册商获得佣金。',
    rest: '您支付的价格不变。这些优惠可能会更靠前展示，这份支持让 DomainDiscovery 保持免费。',
  },
  de: {
    title: 'Affiliate-Hinweis',
    lead: 'Wenn Sie eine Domain über unsere Partnerlinks registrieren, können wir eine Provision vom Registrar erhalten.',
    rest: 'Sie zahlen denselben Preis. Diese Angebote können prominenter angezeigt werden. So bleibt DomainDiscovery kostenlos.',
  },
  es: {
    title: 'Aviso de afiliados',
    lead: 'Si registra un dominio a través de nuestros enlaces de socios, podemos recibir una comisión del registrador.',
    rest: 'Usted paga el mismo precio. Esas ofertas pueden mostrarse con más destaque, y este apoyo mantiene DomainDiscovery gratis.',
  },
  ja: {
    title: 'アフィリエイトの開示',
    lead: '提携リンクからドメインを登録すると、レジストラから紹介料を受け取ることがあります。',
    rest: 'お支払い価格は同じです。これらの案内は目立つ位置に表示されることがあり、その支援で DomainDiscovery を無料に保っています。',
  },
  fr: {
    title: 'Divulgation d’affiliation',
    lead: 'Si vous enregistrez un domaine via nos liens partenaires, nous pouvons recevoir une commission du bureau d’enregistrement.',
    rest: 'Vous payez le même prix. Ces offres peuvent être mises en avant, et ce soutien garde DomainDiscovery gratuit.',
  },
  pt: {
    title: 'Divulgação de afiliados',
    lead: 'Se você registrar um domínio pelos nossos links de parceiros, podemos receber uma comissão da registradora.',
    rest: 'Você paga o mesmo preço. Essas ofertas podem aparecer com mais destaque, e esse apoio mantém o DomainDiscovery gratuito.',
  },
  hi: {
    title: 'सहयोगी प्रकटीकरण',
    lead: 'यदि आप हमारे साझेदार लिंक से डोमेन पंजीकृत करते हैं, तो हमें रजिस्ट्रार से कमीशन मिल सकता है।',
    rest: 'आप वही कीमत देते हैं। ये ऑफ़र अधिक प्रमुखता से दिख सकते हैं, और इसी सहयोग से DomainDiscovery मुफ़्त रहता है।',
  },
  ar: {
    title: 'إفصاح الشراكة',
    lead: 'إذا سجّلت نطاقاً عبر روابط شركائنا، فقد نحصل على عمولة من المسجّل.',
    rest: 'تدفع السعر نفسه. قد تُعرض هذه العروض بشكل أوضح، وهذا الدعم يُبقي DomainDiscovery مجانياً.',
  },
  ru: {
    title: 'Раскрытие партнерства',
    lead: 'Если вы регистрируете домен по нашим партнерским ссылкам, мы можем получить комиссию от регистратора.',
    rest: 'Вы платите ту же цену. Эти предложения могут показываться заметнее, и эта поддержка сохраняет DomainDiscovery бесплатным.',
  },
  bn: {
    title: 'অ্যাফিলিয়েট প্রকাশ',
    lead: 'আমাদের অংশীদার লিঙ্ক দিয়ে ডোমেইন নিবন্ধন করলে আমরা রেজিস্ট্রারের কাছ থেকে কমিশন পেতে পারি।',
    rest: 'আপনি একই দাম দেন। এই অফারগুলো আরও সামনে দেখানো হতে পারে, আর এই সহায়তায় DomainDiscovery বিনামূল্যে থাকে।',
  },
  ur: {
    title: 'ملحق انکشاف',
    lead: 'اگر آپ ہمارے پارٹنر لنکس سے ڈومین رجسٹر کریں تو ہمیں رجسٹرار سے کمیشن مل سکتا ہے۔',
    rest: 'آپ وہی قیمت ادا کرتے ہیں۔ یہ پیشکشیں نمایاں دکھائی جا سکتی ہیں، اور یہی تعاون DomainDiscovery کو مفت رکھتا ہے۔',
  },
};

/**
 * Footer affiliate disclosure. Sits on the same content edges as the columns below.
 * Copy follows the usual affiliate-site pattern: commission, no extra cost,
 * placement may be influenced, and why the links exist.
 */
export function AffiliateSupportNote({ className }: { className?: string }) {
  const { locale } = useLocale();
  const copy = locale === 'en' ? null : AFFILIATE[locale];
  return (
    <div
      role="note"
      className={cn(
        'w-full border-b border-white/[0.08] pb-4 sm:pb-5 [.light_&]:border-[#e6e6e6]',
        className
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45 [.light_&]:text-[#6e7679]">
        {copy?.title ?? 'Affiliate disclosure'}
      </p>
      <p className="mt-1.5 max-w-4xl text-[13px] leading-relaxed text-[#a1a4a5] sm:text-[14px] [.light_&]:text-[#52595b]">
        <span className="font-medium text-[#f0f0f0] [.light_&]:text-[#141517]">
          {copy?.lead ?? 'If you register a domain through our partner links, we may earn a commission from the registrar.'}
        </span>{' '}
        {copy?.rest ?? 'You pay the same price. Those offers may be shown more prominently, and this support keeps DomainDiscovery free.'}
      </p>
    </div>
  );
}
