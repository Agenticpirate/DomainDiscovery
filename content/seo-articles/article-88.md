---
title: "How to Set Up a Custom Domain for Your Website"
date_published: "2026-07-23"
date_updated: "2026-07-23"
schema_type: "HowTo"
primary_keyword: "how to set up a custom domain"
target_intent: "informational / how-to"
meta_description: "Learn how to set up a custom domain for your website step by step. Connect your domain to any website builder, hosting platform, or CMS with this guide."
---

# How to Set Up a Custom Domain for Your Website

> **Quick Answer:** To set up a custom domain for your website, register a domain name, then either update your nameservers to point to your website platform (simplest option for Squarespace, Wix, or Shopify) or add specific A and CNAME records at your registrar pointing to your hosting server's IP address. DNS propagation completes in 24–48 hours, after which your custom domain goes live.

## Table of Contents
- [What Is a Custom Domain?](#what-is-a-custom-domain)
- [What You Need Before You Start](#what-you-need-before-you-start)
- [How Domain Connection Works](#understanding-how-domain-connection-works)
- [Step-by-Step: Connecting to Common Platforms](#step-by-step-how-to-connect-your-domain-to-common-platforms)
- [Setting Up www vs. Non-www](#setting-up-www-vs-non-www)
- [Setting Up SSL After Connecting Your Domain](#setting-up-ssl-after-connecting-your-domain)
- [Troubleshooting Common Issues](#troubleshooting-common-custom-domain-setup-issues)
- [Expert Verdict](#expert-verdict)
- [FAQ](#frequently-asked-questions)

Having a professional website isn't just about the content — it's about the address people use to find it. A custom domain (like "yourbusiness.com") tells the world you're serious. A generic subdomain (like "yourbusiness.wordpress.com" or "yourbusiness.wixsite.com") signals that you haven't committed to your online presence yet.

Setting up a custom domain is one of the highest-impact things you can do for your website's credibility. And it's much simpler than most people expect.

This guide walks you through exactly how to set up a custom domain for your website, regardless of whether you're using WordPress, Squarespace, Wix, Shopify, Webflow, or custom hosting.

**Key Facts for 2026:**
- Websites with custom domains rank significantly better in search engines than equivalent sites on platform subdomains — Google treats custom domains as more credible authority signals
- SSL certificates (HTTPS) are provided free by all major website platforms via Let's Encrypt and activate automatically within 1–24 hours of a successful domain connection
- The average custom domain setup takes under 30 minutes of active configuration work; the remaining wait time is DNS propagation (24–48 hours) which requires no action
- Changing nameservers is the simplest connection method for all-in-one platforms (Squarespace, Wix, Shopify) — adding individual DNS records is more flexible but requires more technical steps

---

## What Is a Custom Domain?

A custom domain is a web address that you own and control, registered through a domain registrar. It replaces the default URL that website builders assign automatically.

**Examples**:
- Generic URL: "yourstore.myshopify.com" → Custom domain: "yourstore.com"
- Generic URL: "mysite.wordpress.com" → Custom domain: "mysite.com"
- Generic URL: "mybiz.squarespace.com" → Custom domain: "mybiz.com"

Custom domains make your brand look professional, improve trust with visitors, and significantly help with SEO — search engines treat custom domains as more credible than subdomains of third-party platforms.

---

## What You Need Before You Start

Before you can connect a domain to your website, you need two things:

1. **A registered domain name**: If you don't have one yet, register it through a reputable registrar. Prices typically range from $8–$20 per year for a .com domain.

2. **A hosting platform or website builder**: This is where your website lives. Examples include Squarespace, Wix, WordPress.com, WordPress.org (self-hosted), Shopify, Webflow, GitHub Pages, or a traditional hosting provider like SiteGround or Bluehost.

---

## Understanding How Domain Connection Works

When you connect a custom domain to your website, you're telling the internet's DNS (Domain Name System) to point your domain to the server where your website is hosted.

There are two main methods:

### Method 1: Change Nameservers (Full DNS Control)

You change your domain's nameservers to point to your website platform. The platform then manages all your DNS settings.

**Best for**: Squarespace, Wix, Shopify, and other all-in-one platforms that offer to manage DNS for you.

**Pros**: Simpler, platform handles the technical details.

**Cons**: You give up DNS control — harder to add third-party email or other DNS records.

### Method 2: Update DNS Records at Your Registrar (Keep DNS at Registrar)

You keep your domain's DNS at your registrar and add A records, CNAME records, or other records provided by your hosting platform.

**Best for**: WordPress self-hosting, Webflow, or any situation where you want to maintain full DNS control for email, subdomains, and other services.

**Pros**: Full control, flexible.

**Cons**: Slightly more technical setup.

---

## Step-by-Step: How to Connect Your Domain to Common Platforms

### Connecting a Domain to Squarespace

1. Log into your Squarespace account
2. Go to **Settings → Domains**
3. Click **Use a Domain I Own**
4. Enter your domain name and click **Connect**
5. Squarespace provides you with nameserver values (typically "ns1.squarespace.com" and similar)
6. Log into your domain registrar
7. Navigate to **Nameservers** in your domain settings
8. Replace the existing nameservers with Squarespace's nameservers
9. Save changes and wait 24–48 hours for DNS propagation

### Connecting a Domain to WordPress.com

1. Log into WordPress.com
2. Go to **My Site → Upgrades → Domains**
3. Click **Use a Domain You Already Own**
4. Enter your domain
5. WordPress.com shows you which DNS records to add (or offers to manage nameservers)
6. Either update your nameservers or add the A/CNAME records at your registrar
7. Wait for propagation (usually 15 minutes to 24 hours)

### Connecting a Domain to Shopify

1. From your Shopify admin, go to **Settings → Domains**
2. Click **Connect Existing Domain**
3. Enter your domain name
4. Shopify displays the records you need to add at your registrar:
   - An A record pointing to Shopify's IP address
   - A CNAME record for "www" pointing to "shops.myshopify.com"
5. Log into your registrar and add these records
6. Back in Shopify, click **Verify Connection**
7. Wait up to 48 hours for full propagation

### Connecting a Domain to Wix

1. In your Wix dashboard, go to **Settings → Domains → Connect Domain**
2. Choose **Connect a Domain You Already Own**
3. Enter your domain and click **Connect**
4. Wix will ask whether you want to update nameservers (recommended) or point with DNS
5. If updating nameservers: update them at your registrar to Wix's servers
6. If pointing with DNS: add the Wix-provided A record and CNAME at your registrar
7. Return to Wix and click **Refresh**
8. Wait 24–72 hours for full propagation

### Connecting a Domain to Webflow

1. In the Webflow designer, go to **Project Settings → Hosting → Custom Domain**
2. Add your custom domain (e.g., "example.com")
3. Webflow displays the DNS records you need to add:
   - An A record for the apex domain (@)
   - A CNAME record for "www"
4. Log into your registrar and add these records
5. Back in Webflow, click **Publish** and then **Check DNS Records**
6. Wait for DNS propagation

### Connecting a Domain to Self-Hosted WordPress (cPanel Hosting)

This is the most flexible setup but requires a few more steps.

1. Log into your hosting control panel (cPanel, DirectAdmin, etc.)
2. Find your hosting server's IP address (usually displayed on the main dashboard)
3. Log into your domain registrar
4. In DNS management, find your domain's A record
5. Update the A record to point to your hosting server's IP address
6. Also add a "www" CNAME record pointing to your domain (@)
7. Wait for DNS propagation (1–48 hours)
8. Install WordPress via your hosting panel's one-click installer
9. During installation, set your domain as the WordPress site URL

---

## Setting Up www vs. Non-www

Most websites need to work with both the "www" version and the bare/apex version of their domain.

**Best practice**: Pick one as your primary (most modern sites prefer the non-www "example.com") and redirect the other to it automatically.

- Most website platforms handle this redirect automatically when you connect your domain
- If you're self-hosting, you can configure this redirect in your web server settings (Apache or Nginx) or through your DNS provider

---

## Setting Up SSL After Connecting Your Domain

Modern websites require SSL (HTTPS), and the good news is that most platforms provide free SSL automatically through Let's Encrypt.

### Steps to enable SSL after domain connection:

1. Wait for DNS propagation to complete
2. On most platforms (Squarespace, Webflow, Shopify, etc.), SSL activates automatically within 1–24 hours
3. On self-hosted WordPress, install a plugin like Really Simple SSL or use your host's built-in SSL tool
4. Verify your site loads with "https://" in the address bar
5. Set up HTTPS redirect so "http://" automatically redirects to "https://"

---

## Troubleshooting Common Custom Domain Setup Issues

**Domain shows "site not found" after setup**: DNS propagation is still in progress. Wait 24–48 hours.

**SSL certificate not issuing**: Make sure your DNS records are correct and propagated. SSL can't issue until the domain resolves to the correct server.

**www version doesn't redirect**: Configure a CNAME record for "www" if your platform doesn't handle it automatically.

**Email stopped working after changing nameservers**: When you change nameservers, all DNS moves to the new provider. Re-add your email MX records at the new nameserver location.

---

## Expert Verdict

Connecting a custom domain to a website is one of the most universally beneficial technical operations a business owner can perform. The credibility gap between a site at "yourbrand.com" and "yourbrand.wordpress.com" is significant in the eyes of both search engines and human visitors — and the technical barrier to crossing it is smaller than almost anyone imagines.

The single most important decision in the setup process is choosing between nameserver transfer and direct DNS record management. For users on all-in-one platforms like Squarespace, Wix, or Shopify, nameserver transfer is unambiguously the simpler path — the platform manages everything, propagation happens in the same 24–48 hour window, and SSL activates automatically. The only meaningful downside is reduced flexibility for adding third-party services that require custom DNS records.

For users on self-hosted platforms or anyone who needs granular DNS control (for custom email, CDN configuration, or multiple subdomains), keeping DNS at the registrar and adding specific A and CNAME records is the correct approach. This requires matching the exact record format provided by the hosting platform — a typo in an A record IP address or a misformatted CNAME is the most common source of failed domain connections. Copy and paste from the platform's documentation rather than typing IP addresses manually.

---

## Frequently Asked Questions

### How do I connect a domain I already own to my website?
Log into your domain registrar and either change the nameservers to those provided by your website platform (recommended for Squarespace, Wix, Shopify) or add the specific A and CNAME records provided by your platform. The platform's setup guide provides the exact values to enter. Changes propagate within 24–48 hours.

### How long does it take for a custom domain to work after setup?
Most users see their custom domain working within 2–4 hours of making DNS changes. Full global propagation takes up to 48 hours. You can speed up propagation by lowering your domain's TTL (Time to Live) to 300 seconds before making changes, though this requires 48 hours of notice before it takes effect.

### Do I need to buy SSL separately for my custom domain?
No. All major website platforms (Squarespace, Wix, Shopify, Webflow, WordPress.com) provide free SSL certificates via Let's Encrypt and activate HTTPS automatically within 1–24 hours of a successful domain connection. For self-hosted WordPress, your hosting provider typically provides free SSL via Certbot or a one-click installer in cPanel.

### What is the difference between changing nameservers and adding DNS records?
Changing nameservers moves all DNS management to your website platform — simpler but less flexible. Adding DNS records (A, CNAME, MX) at your registrar keeps DNS management at your registrar — more flexible but requires manually entering each record. Use nameservers for all-in-one platforms; use DNS records when you need to run email, subdomains, or other services independently.

### Why did my email stop working after I connected my domain?
Email stopped working because you changed nameservers and the new DNS provider doesn't have your email MX records. When you change nameservers, all DNS records — including email records — must be recreated at the new location. Log into your website platform's DNS management, find the MX records required by your email provider, and add them there.

### Can I use a custom domain with a free website plan?
Most website platforms require a paid plan to use a custom domain. Squarespace, Wix, Shopify, and WordPress.com all require a paid subscription to connect an external domain. Some platforms like GitHub Pages (for static sites) allow custom domains for free. Check your specific platform's plan requirements before purchasing a domain.

### What happens if I set up my domain incorrectly?
An incorrect DNS configuration typically results in one of three outcomes: the domain shows a generic registrar page (wrong nameservers), a "site not found" error (missing or incorrect A record), or the www version doesn't work (missing CNAME). None of these are permanent — simply correct the DNS records or nameservers and propagation restores normal function within a few hours.

---

## Start with the Right Domain

A custom domain setup is only as good as the domain you're connecting. Choosing a strong, memorable, and available domain name is the first step.

Use DomainsDiscovery.com to check domain availability and compare prices across registrars instantly. Find your perfect custom domain, compare pricing across providers, and get your professional online presence started today.

---

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Set Up a Custom Domain for Your Website",
  "description": "Step-by-step guide to connecting a custom domain name to any website builder or hosting platform, including Squarespace, Shopify, Wix, Webflow, and WordPress.",
  "totalTime": "PT48H",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": "8-20"
  },
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Register a Domain Name",
      "text": "If you do not already have a domain, register one at a reputable registrar. .com domains typically cost $8–$20 per year. Choose a name that is short, memorable, and reflects your brand."
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Choose Your Connection Method",
      "text": "Decide whether to change your nameservers (simplest for Squarespace, Wix, Shopify) or add specific A and CNAME records at your registrar (best for self-hosted WordPress and Webflow). Nameservers are easier; individual records give more control."
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Get DNS Values from Your Website Platform",
      "text": "Log into your website platform's domain or hosting settings. Locate the nameserver values or DNS record values (A record IP address and CNAME targets) that the platform requires. Copy them exactly."
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "Update DNS at Your Domain Registrar",
      "text": "Log into your domain registrar. If using nameservers: navigate to nameserver settings and replace existing nameservers with those from your platform. If using DNS records: go to DNS management and add the A record and CNAME record provided by your platform."
    },
    {
      "@type": "HowToStep",
      "position": 5,
      "name": "Verify the Connection in Your Website Platform",
      "text": "Return to your website platform's domain settings and click Verify or Check DNS. The platform confirms when your domain points to it correctly. This may take a few hours."
    },
    {
      "@type": "HowToStep",
      "position": 6,
      "name": "Wait for DNS Propagation",
      "text": "DNS changes propagate globally within 24–48 hours. Most users see the domain working within 2–4 hours. During propagation, some visitors may see the old site while others see the new one — this is normal."
    },
    {
      "@type": "HowToStep",
      "position": 7,
      "name": "Confirm SSL (HTTPS) Is Active",
      "text": "After propagation, verify your site loads with https:// in the address bar. Most platforms activate SSL automatically within 1–24 hours. For self-hosted WordPress, install a free SSL certificate via your hosting provider or cPanel."
    }
  ]
}
</script>
