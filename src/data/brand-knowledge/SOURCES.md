# Open-source branding knowledge — sources

Integrated into AI Domain Assistant **without paid APIs**. Attribution for free/public resources that inform our curated datasets.

## In-repo data we wire in

| File | Origin / inspiration | Use |
|------|----------------------|-----|
| `src/data/generator-keywords.json` | Lean Domain Search–style affixes, Instant Domain modifiers, curated seeds/semantic maps | Prefixes, suffixes, industry seeds, semantic neighbors |
| `src/data/keyword-tool.json` | Same family as generator affixes | Keyword tool + agent generation |
| `src/data/brand-knowledge/open-source-branding.json` | Curated from free brand/domain naming practice + open word-list patterns (below) | Vertical roots, Latin/Greek brand roots, positive modifiers, radio-friendly syllables |

## Free / open resources (reference + patterns)

| Resource | License / notes | How we use it |
|----------|-----------------|---------------|
| [dariusk/corpora](https://github.com/dariusk/corpora) | CC0 | Category structure (foods, animals, technology) → vertical roots |
| [dwyl/english-words](https://github.com/dwyl/english-words) | Unlicense-style free word list | *Not* bulk-imported (too large); informs length/word filters |
| [wordnik/wordlist](https://github.com/wordnik/wordlist) | MIT | Common English brandable word patterns |
| [CMU Pronouncing Dictionary](http://www.speech.cs.cmu.edu/cgi-bin/cmudict) | Free for commercial use | Radio-test / pronounceability heuristics |
| Latin/Greek roots for branding | Public domain etymology (standard school lists) | `latinRoots`, `greekRoots` compounds |
| Lean Domain Search / Instant Domain public affix patterns | Industry-common free UX patterns | Prefix/suffix generation style already in generator-keywords |

## Not used

- Paid NameBio / Afternic dumps as training data  
- Scraped private trademark databases  
- Paid LLM fine-tunes  

## Runtime integration

`src/lib/agent/openSourceBrandKnowledge.ts` loads JSON and feeds:

- vertical expansion  
- domain candidate generation  
- semantic neighbor keywords  

## Brand Brain (2026-07-24)

Runtime module `src/lib/agent/brandBrain.ts`:

- Offline invention (Latin/Greek + syllables + fashion evocatives) — **no API**
- Optional Anthropic label invention when `ADA_ALLOW_PAID_LLM` + key
- Filters generic keyword mashups (`clothingthread`, `cartcloth`…)
- Availability-check prioritization so API budget is spent on inventives first

Last integrated: 2026-07-24
