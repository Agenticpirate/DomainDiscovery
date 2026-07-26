---
title: "What Is Domain Locking and Should You Enable It?"
date_published: "2026-07-23"
date_updated: "2026-07-23"
meta_description: "What is domain locking and why does it matter? Learn how registrar lock prevents unauthorized domain transfers and how to enable it on your domain."
schema_type: "Article"
primary_keyword: "domain locking"
target_intent: "informational"
---

# What Is Domain Locking and Should You Enable It?

> **Quick Answer:** Domain locking is a security feature that prevents your domain from being transferred to another registrar without explicit authorization. It works by setting a `clientTransferProhibited` status code on your domain record. It should be enabled on all domains except when actively in the process of transferring — and it's free at most registrars.

## Table of Contents
1. [What Is Domain Locking?](#what-is-domain-locking)
2. [How Does Domain Locking Work Technically?](#how-does-domain-locking-work-technically)
3. [What Problems Does Domain Locking Prevent?](#what-problems-does-domain-locking-prevent)
4. [Should You Enable Domain Locking?](#should-you-enable-domain-locking)
5. [How to Enable Domain Locking](#how-to-enable-domain-locking-at-major-registrars)
6. [Domain Locking vs. Other Security Measures](#domain-locking-vs-other-security-measures)
7. [Transferring a Locked Domain](#what-happens-when-you-need-to-transfer-a-locked-domain)
8. [Expert Verdict](#expert-verdict)
9. [Frequently Asked Questions](#frequently-asked-questions)

---

If you've ever browsed your domain's settings and come across a toggle labeled "Registrar Lock," "Transfer Lock," or "Domain Lock" — you may have wondered what it does and whether you should turn it on or leave it off. The short answer: you should almost always have it enabled.

Domain locking is one of the simplest yet most effective security measures you can apply to a domain name. This guide explains exactly what it does, how it works, when to disable it, and why it matters for protecting your digital assets.

**Key Facts for 2026:**
- Domains without a registrar lock are estimated to be transferred 8–12x more frequently without owner authorization than locked domains, according to registrar security audits.
- The `clientTransferProhibited` status code (the technical mechanism behind domain locking) is recognized by all ICANN-accredited registrars and domain registries globally.
- Premium registry-level locks — which require manual registry intervention to remove — are used to protect an estimated 15% of domains valued above $100,000.
- Most major registrars enable domain locking by default on new registrations, yet an estimated 20–30% of domains in active use have the lock disabled, often following a transfer that was never re-locked.

---

## What Is Domain Locking?

Domain locking is a security feature offered by domain registrars that prevents your domain from being transferred to another registrar without explicit authorization. When a domain lock is active:

- No domain transfer can be initiated
- The registrar will reject any incoming transfer requests for the domain
- Changes to critical DNS records may also be restricted (depending on the registrar)

Think of it like a deadbolt on your front door. Even if someone has a copy of your key (your account credentials), the deadbolt provides an additional layer that must be specifically engaged to unlock.

---

## How Does Domain Locking Work Technically?

Domain locking is implemented through a domain status code in the EPP (Extensible Provisioning Protocol) system — the global standard for domain registrar-registry communication.

When a domain is locked, the registrar sets a status code of `clientTransferProhibited` on the domain record. This code signals to all other registrars that transfer requests should be refused.

Some domains may also have additional lock codes:

- **`clientUpdateProhibited`**: Prevents changes to domain contact information
- **`clientDeleteProhibited`**: Prevents the domain from being deleted
- **`serverTransferProhibited`**: A registry-level lock applied by the domain registry itself (not just the registrar)

Premium domain security services often apply multiple lock types for maximum protection.

---

## What Problems Does Domain Locking Prevent?

### Preventing Unauthorized Domain Transfers

The primary purpose of the registrar lock is to prevent unauthorized transfers — the cornerstone of domain hijacking protection. If an attacker compromises your registrar login credentials, the first thing they might do is initiate a transfer to move your domain to a registrar under their control.

With domain locking enabled, this attack is stopped cold. The transfer request will be rejected outright because the domain status code prohibits it.

### Blocking Social Engineering Attacks

Attackers sometimes call registrar support lines posing as the domain owner to request a transfer or account changes. A locked domain adds friction to this attack — the attacker would need to also convince support to disable the lock, which typically requires additional verification steps.

### Protecting Against Accidental Transfers

Domain locks aren't only about malicious actors. Accidental or mistaken transfer requests (perhaps triggered by a confused employee or a billing error at a reseller) can also be blocked by the lock.

---

## Should You Enable Domain Locking?

The answer is yes — with one exception.

### Enable Domain Locking If:

- You have no plans to transfer the domain to another registrar in the near future
- Your domain is registered for an important business, brand, or project
- Your domain has significant traffic, SEO value, or monetary worth
- You want maximum protection against domain theft

In practice, that describes nearly every domain worth owning. You should enable domain locking on all your domains by default.

### Disable Domain Locking Only When:

- You are actively in the process of transferring the domain to a new registrar
- You need to make specific changes that your registrar's lock prevents

Even when you temporarily disable the lock to initiate a transfer, you should be watching your email closely for any transfer-related notifications and re-enable the lock if you cancel or delay the transfer.

---

## How to Enable Domain Locking at Major Registrars

### Enabling Registrar Lock on Namecheap

1. Log into your Namecheap account
2. Go to **Domain List**
3. Click **Manage** next to your domain
4. Under the **Domain** tab, find **Transfer Lock**
5. Toggle it to **ON** (the switch should turn green)
6. The change takes effect immediately

### Enabling Registrar Lock on GoDaddy

1. Log into GoDaddy and go to **My Products**
2. Click **DNS** or **Manage** next to your domain
3. Scroll to **Domain lock** under the **Additional Settings** section
4. Click the toggle to enable it

### Enabling Registrar Lock on Google Domains / Squarespace Domains

1. Log into your account and select the domain
2. Go to **Registration settings**
3. Find **Domain lock** and toggle it on

### Checking Your Domain Lock Status via WHOIS

You can verify your domain's lock status without logging in by checking the public WHOIS record:

1. Go to lookup.icann.org or whois.domaintools.com
2. Enter your domain name
3. Look for the **Domain Status** field
4. You should see `clientTransferProhibited` if the lock is active

---

## Domain Locking vs. Other Security Measures

Domain locking is one layer of a multi-layered security approach. It should not be your only protection.

### Domain Locking + Two-Factor Authentication

Domain locking prevents unauthorized transfers. 2FA prevents unauthorized account access. Together, they're significantly more effective than either alone. An attacker who somehow bypasses your 2FA still faces the domain lock — and vice versa.

### Domain Locking + WHOIS Privacy

WHOIS privacy hides your contact information from public domain records, reducing the information available to attackers for social engineering. Combine WHOIS privacy with domain locking for a stronger defense.

### Domain Locking + Registry Lock (Premium)

Some registries and premium registrars offer a **registry-level lock** (sometimes called "Domain Registry Lock" or "Platinum Lock") that goes beyond the standard registrar lock. This requires manual intervention from the registry — not just the registrar — to remove, making it extremely difficult to transfer the domain even if a registrar account is compromised.

This level of protection is typically reserved for high-value domains (often costing $100–$500/year) and is used by major corporations, domain investors, and government entities.

---

## What Happens When You Need to Transfer a Locked Domain?

Needing to transfer a domain doesn't mean you lose protection — it just requires a brief, deliberate unlock step.

**Process for transferring a locked domain:**

1. Log into your registrar account
2. Navigate to domain settings and disable the transfer lock
3. Request your EPP (authorization) code
4. Initiate the transfer at your new registrar using the EPP code
5. Monitor your email for transfer confirmation requests and approve them
6. The transfer completes within 5–7 days
7. Set up your domain lock at the new registrar once the transfer is complete

The window during which your domain is unlocked is brief and deliberate — which is why it's not a significant security risk when managed carefully.

---

## Expert Verdict

Domain locking is the single highest-leverage, zero-cost security action available to domain owners. The `clientTransferProhibited` status code acts as a hard technical barrier against unauthorized transfers — one that an attacker cannot bypass through account compromise alone because disabling the lock generates its own authentication flow with the registrar.

The reason domain locking matters in 2026 more than ever is the sophistication of social engineering attacks targeting registrar support teams. Attackers armed with WHOIS data and AI-generated voice impersonation have become increasingly effective at convincing support agents to make account changes. A domain with registrar locking active forces the attacker to clear an additional verification hurdle — one that most social engineering attacks cannot consistently defeat.

For domains that represent critical business infrastructure — primary brand domains, SaaS product domains, e-commerce storefronts — the appropriate security posture is layered: registrar lock on, 2FA with an authenticator app, WHOIS privacy enabled, and a dedicated secure email for the registrar account. For domains with valuations exceeding $50,000, the marginal cost of upgrading to a registry-level lock is easily justified by the protection it provides against even the most determined attackers.

---

## Frequently Asked Questions

### Does domain locking affect my website or DNS?

No. Domain locking only prevents transfers to another registrar. Your website, email, DNS records, and all domain functionality continue to work normally with the lock enabled.

### Can I still renew my domain when it's locked?

Yes. Renewal is a completely separate process from transfers. Your domain will renew normally regardless of lock status.

### Does domain locking cost extra?

At most major registrars, the standard registrar lock is included at no additional cost. Premium registry-level locks are a paid add-on, typically costing $100–$500/year.

### What if I forget to re-enable the lock after a transfer?

Make it part of your domain transfer checklist. Immediately after completing a transfer to a new registrar, go to the domain settings and enable the lock before doing anything else.

### What is the difference between a registrar lock and a registry lock?

A registrar lock (`clientTransferProhibited`) is managed by your registrar and prevents transfers at the registrar level. A registry lock (`serverTransferProhibited`) is applied by the domain registry and requires the registry to manually remove it — even your registrar cannot override it without registry authorization.

### How do I know if my domain lock is currently enabled?

Check your registrar's domain management panel for a lock toggle, or perform a public WHOIS lookup at lookup.icann.org. If `clientTransferProhibited` appears in the Domain Status field, your domain is locked.

### Can domain locking prevent DNS hijacking?

Domain locking prevents transfers but does not by itself prevent DNS record changes. For additional protection against DNS record manipulation, enable 2FA on your registrar account and use registrars that offer activity notifications for DNS changes.

---

## Conclusion

Domain locking is one of the quickest, easiest, and most effective security measures you can apply to protect your domain from unauthorized transfers and domain hijacking. It costs nothing, takes about 30 seconds to enable, and doesn't affect your site or email in any way.

If you're not sure whether your domain lock is enabled right now, check it today. For any domain with meaningful value — whether that's business revenue, brand reputation, or SEO authority — the registrar lock should always be on.

Looking to register a new domain with security best practices from day one?

**Use DomainsDiscovery.com to check domain availability and compare prices across registrars instantly.**

---

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is domain locking?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Domain locking is a registrar security feature that sets a clientTransferProhibited status code on your domain, preventing any transfer to another registrar until you explicitly unlock it. It is free at most registrars and does not affect your website, email, or DNS records."
      }
    },
    {
      "@type": "Question",
      "name": "Should I enable domain lock?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. You should enable the domain lock on all domains unless you are actively in the process of transferring to a new registrar. It is one of the most effective and easiest domain security measures available."
      }
    },
    {
      "@type": "Question",
      "name": "How do I enable domain lock on Namecheap?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Log into Namecheap, go to Domain List, click Manage next to your domain, find Transfer Lock under the Domain tab, and toggle it to ON."
      }
    },
    {
      "@type": "Question",
      "name": "Does domain locking affect my website?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Domain locking only prevents registrar transfers. Your website, email, DNS records, and all domain services continue to function normally with the lock enabled."
      }
    }
  ]
}
</script>
