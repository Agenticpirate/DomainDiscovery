---
name: "instant-domain-search"
displayName: "Instant Domain Search"
description: "Search domain availability instantly with sub-10ms lookups. Check bulk domains, generate brandable alternatives, and verify availability from authoritative sources."
keywords: ["domain", "domains", "availability", "bulk", "search", "registrar", "tld"]
author: "GoDaddy"
---

# Instant Domain Search

## Overview

This power connects to GoDaddy's domain API to provide real-time domain availability checking. Get instant domain availability checking with fast response times.

## Available MCP Tools

### domain_search
Search for available domains based on keywords.

**Parameters:**
- `query` (string, required): Keywords or domain name to search for

### check_availability
Check if specific domain names are available.

**Parameters:**
- `domain` (string, required): The domain name to check (e.g., "example.com")

## Common Workflows

### Workflow 1: Bulk Domain Search
Check availability for multiple domains at once.

1. Prepare your list of domains
2. Use `check_availability` for each domain
3. Results show availability status instantly

### Workflow 2: Find Available Alternatives
When your preferred domain is taken:

1. Use `domain_search` with your keyword
2. Review the suggested alternatives
3. Use `check_availability` to verify top choices

## Best Practices

- Check multiple TLDs to find available alternatives
- Use domain search for brandable options
- Verify availability before purchasing

## Configuration

**No additional configuration required** - the MCP server connects directly to GoDaddy's public API.

---

**MCP Server:** instant-domain-search
**API:** https://api.godaddy.com/v1/domains/mcp
