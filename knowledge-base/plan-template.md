# Royalty Health Report - Plan Template

This is the output template the AI fills in based on intake data. The customer receives this as their $49 product.

**Last Updated:** January 2026

---

## TEMPLATE START

---

# Royalty Health Report

**Prepared for:** {{artist_name}}
**Date:** {{current_date}}

---

## Quick Summary

| Metric | Value |
|--------|-------|
| **Registration Score** | {{score}}/10 |
| **Estimated Unclaimed Royalties** | {{estimate_low}} - {{estimate_high}} |
| **Ongoing Monthly Gap** | ~{{monthly_gap}}/month |
| **Situation Complexity** | {{complexity_level}} |
| **Recommended Path** | {{recommendation}} |

---

## Your Current Setup

### What You Have ✓

{{#each registrations_have}}
- ✅ **{{name}}** - {{description}}
{{/each}}

{{#if registrations_have.length == 0}}
- ❌ No royalty registrations detected
{{/if}}

### What You're Missing ✗

{{#each registrations_missing}}
- ❌ **{{name}}** - {{what_it_collects}}
{{/each}}

{{#if registrations_missing.length == 0}}
- ✅ You appear to have all major registrations covered
{{/if}}

---

## Understanding Your Royalty Streams

As a musician, you have multiple income streams. Here's what applies to you:

### 1. Distribution Income (Streaming/Downloads)
**Source:** Your distributor ({{distributor}})
**Status:** {{distribution_status}}
**What it is:** When someone streams your song on Spotify, Apple Music, etc., your distributor collects and pays you.

{{#if has_distributor}}
✅ You're collecting this.
{{else}}
❌ You need a distributor to release music and collect streaming income.
{{/if}}

### 2. Performance Royalties (PRO)
**Source:** ASCAP, BMI, or SESAC
**Status:** {{pro_status}}
**What it is:** When your song is played on radio, TV, in venues, or streamed, your PRO collects performance royalties for the *composition* (the song itself, not the recording).

**Important:** Performance royalties are split **50/50 between Writer and Publisher**:
- **Writer share (50%)** - Goes to you as the songwriter
- **Publisher share (50%)** - Goes to whoever publishes your music

If you don't have a publisher or publishing admin, you need to create your own **publishing entity** with your PRO to collect the publisher half. Otherwise, you're only getting 50% of your performance royalties! Creating a publishing entity is FREE and takes about 15 minutes.

{{#if has_pro}}
✅ You're registered with {{pro_name}}.
{{#if pro_works_registered}}
✅ Your works are registered.
{{/if}}
{{#if has_publishing_admin}}
✅ Your publishing admin ({{publishing_admin}}) collects your publisher share.
{{else if has_pro_publishing_entity}}
✅ You have a publishing entity to collect both shares.
{{else}}
⚠️ **You may be missing 50% of your PRO income.** Without a publishing entity, you're only collecting the Writer share. Set up a publishing entity with {{pro_name}} to collect both halves.
{{/if}}
{{else}}
❌ **You are not collecting performance royalties.** This is separate from what your distributor pays you.
{{/if}}

### 3. Mechanical Royalties (The MLC)
**Source:** The Mechanical Licensing Collective
**Status:** {{mlc_status}}
**What it is:** When your song is streamed on interactive services (Spotify, Apple Music, Amazon), mechanical royalties are generated for the *composition*. This is separate from what your distributor pays.

{{#if has_mlc}}
✅ You're registered with The MLC.
{{else if has_publishing_admin}}
✅ Your publishing administrator ({{publishing_admin}}) should be collecting this for you.
{{else}}
❌ **You are not collecting mechanical royalties.** At your income level, this could be {{mlc_estimate_monthly}}/month you're missing.
{{/if}}

### 4. Digital Performance Royalties (SoundExchange)
**Source:** SoundExchange
**Status:** {{soundexchange_status}}
**What it is:** When your *recording* is played on non-interactive digital radio (Pandora, SiriusXM, internet radio), SoundExchange collects royalties for the sound recording.

**Important:** SoundExchange has **TWO separate registrations**:
- **Rights Owner (50%)** - Who owns the master recording (typically you if you're indie)
- **Featured Artist (45%)** - Who performed on the recording (you)
- **Non-featured (5%)** - Goes to session musician fund (AFM/SAG-AFTRA)

If you record and perform your own music, you need to register as **BOTH** Rights Owner AND Featured Artist to collect your full 95%. Many artists only register once and miss roughly half their SoundExchange money!

Also note: **This applies to cover songs too!** If you recorded a cover of someone else's song, YOU own the Rights Owner and Featured Artist royalties for YOUR recording. (The composition royalties go to the original songwriter, but the master royalties are yours.)

SiriusXM plays are especially valuable - **~$35 per spin total** if you own 100% of both sides.

{{#if has_soundexchange}}
✅ You're registered with SoundExchange.
{{#if soundexchange_both_sides}}
✅ You're registered as both Rights Owner and Featured Artist.
{{else if soundexchange_one_side}}
⚠️ **You may be missing half your SoundExchange income.** You're only registered as {{soundexchange_registered_as}}. Register as the other side to collect your full royalties.
{{else}}
⚠️ Make sure you're registered as BOTH Rights Owner AND Featured Artist to collect your full royalties.
{{/if}}
{{else}}
❌ **You are not collecting digital performance royalties.** The amount varies by how much radio play you get, but SXM spins are extremely valuable (~$35/spin total at 100% ownership).
{{/if}}

---

## Estimated Money Left on the Table

Based on your reported income of **{{monthly_income}}**/month from streaming:

| Missing Registration | Estimated Monthly Loss | Estimated Total Lost |
|---------------------|----------------------|---------------------|
{{#each missing_estimates}}
| {{name}} | ~{{monthly}} | ~{{total}} |
{{/each}}
| **TOTAL** | **~{{total_monthly_loss}}** | **~{{total_loss_estimate}}** |

**How we calculated this:**
{{estimation_explanation}}

⚠️ **Important:** These are estimates based on industry averages. Actual amounts vary based on where your streams come from, radio play, and other factors. The only way to know for sure is to register and start collecting.

---

## ⚠️ Warnings & Red Flags

{{#if has_warnings}}
{{#each warnings}}
### {{icon}} {{title}}

{{description}}

**Why this matters:** {{consequence}}

**What to do:** {{action}}

{{/each}}
{{else}}
No major red flags detected in your situation. You can proceed with the action plan below.
{{/if}}

---

## Your Action Plan

{{#if is_critical}}
### 🛑 STOP - Complex Situation Detected

{{critical_message}}

**We recommend scheduling a consultation before taking any action.** Proceeding with DIY registration could make your situation worse.

[Book a Consultation →]({{consultation_link}})

{{else}}

### Priority 1: Do This Week (Critical)

{{#each actions_priority_1}}
#### {{number}}. {{title}}

**Why:** {{why}}

**How:**
{{instructions}}

**Link:** [{{link_text}}]({{link_url}})

**Time needed:** {{time_estimate}}

**What you'll need:**
{{#each requirements}}
- {{this}}
{{/each}}

---
{{/each}}

{{#if actions_priority_2.length}}
### Priority 2: Do This Month (Important)

{{#each actions_priority_2}}
#### {{number}}. {{title}}

**Why:** {{why}}

**How:**
{{instructions}}

**Link:** [{{link_text}}]({{link_url}})

**Time needed:** {{time_estimate}}

---
{{/each}}
{{/if}}

{{#if actions_priority_3.length}}
### Priority 3: When You Have Time (Recommended)

{{#each actions_priority_3}}
#### {{number}}. {{title}}

**Why:** {{why}}

**How:**
{{instructions}}

---
{{/each}}
{{/if}}

{{/if}}

---

## Ongoing Maintenance

Once you complete the setup above, here's what you need to do going forward:

### Every New Release:
- Register new songs with your PRO as "works"
- If not using a publishing admin, register with The MLC
- Confirm co-writer splits are documented before release

### Quarterly:
- Check that royalty payments are arriving from all sources
- Log into each account to verify no issues

### Annually:
- Review your catalog for any missing registrations
- Update contact/payment info if changed

---

## DIY Estimated Time

If you follow this plan yourself:

| Task | Estimated Time |
|------|---------------|
{{#each diy_time_estimates}}
| {{task}} | {{time}} |
{{/each}}
| **Total** | **{{total_diy_time}}** |

---

## Your Options

### Option 1: DIY (Free)
You have everything you need in this report. Follow the action plan step by step.

**Best for:** People with straightforward situations and time to handle it themselves.

**Estimated time:** {{total_diy_time}}

---

### Option 2: Done-For-You ({{dfy_price}})

I'll execute this entire plan for you:
- Complete all registrations on your behalf
- Verify everything is set up correctly
- Handle any complications that arise
- Deliver a confirmation report when complete

**Best for:** {{dfy_best_for}}

**Typical turnaround:** 1-2 weeks

[Get Done-For-You →]({{dfy_link}})

---

### Option 3: Done-For-You + Ongoing Management ({{dfy_price}} + {{ongoing_price}}/month)

Everything in Option 2, plus:
- Quarterly royalty statement review
- New release registration reminders
- Ongoing monitoring for issues
- Direct access for questions
- Annual royalty health check

**Best for:** Artists who want to focus on music, not paperwork.

[Get Full Service →]({{full_service_link}})

---

## Questions?

**Not sure which option is right for you?**

Book a free 15-minute call to discuss your situation:
[Schedule a Call →]({{call_link}})

---

## Disclaimer

This report is for informational purposes only and does not constitute legal, tax, or financial advice. Estimates are based on industry averages and your reported information; actual royalties may vary. We recommend consulting with appropriate professionals for complex situations involving legal disputes, estates, or significant income.

---

**Report generated by [Your Brand Name]**

---

## TEMPLATE END

---

# TEMPLATE VARIABLES REFERENCE

## User Data (from intake)
- `{{artist_name}}` - Artist/stage name
- `{{legal_name}}` - Legal name
- `{{distributor}}` - Primary distributor
- `{{monthly_income}}` - Reported monthly streaming income
- `{{catalog_size}}` - Number of songs
- `{{time_releasing}}` - How long releasing music

## Calculated Fields
- `{{score}}` - Registration score out of 10
- `{{estimate_low}}` - Low end of unclaimed estimate
- `{{estimate_high}}` - High end of unclaimed estimate
- `{{monthly_gap}}` - Estimated ongoing monthly loss
- `{{complexity_level}}` - Simple / Moderate / Complex
- `{{recommendation}}` - DIY / Done-For-You / Consultation
- `{{total_diy_time}}` - Total estimated DIY time

## Status Fields
- `{{distribution_status}}` - Active / Not set up
- `{{pro_status}}` - Registered / Not registered / Not sure
- `{{pro_name}}` - ASCAP / BMI / etc.
- `{{mlc_status}}` - Registered / Not registered / Covered by admin
- `{{soundexchange_status}}` - Registered / Not registered
- `{{soundexchange_registered_as}}` - "Rights Owner" / "Featured Artist" / "Both" / null
- `{{publishing_admin}}` - Name of admin or null

## Boolean Flags
- `{{has_distributor}}` - true/false
- `{{has_pro}}` - true/false
- `{{pro_works_registered}}` - true/false/null
- `{{has_pro_publishing_entity}}` - true/false/null (has own publishing entity with PRO)
- `{{has_mlc}}` - true/false
- `{{has_publishing_admin}}` - true/false
- `{{has_soundexchange}}` - true/false
- `{{soundexchange_both_sides}}` - true/false (registered as both Rights Owner AND Featured Artist)
- `{{soundexchange_one_side}}` - true/false (registered as only one side)
- `{{has_warnings}}` - true/false
- `{{is_critical}}` - true/false (blocks DIY plan)

## Arrays
- `{{registrations_have}}` - List of what they have
- `{{registrations_missing}}` - List of what's missing
- `{{missing_estimates}}` - Estimates per missing registration
- `{{warnings}}` - List of triggered gotchas
- `{{actions_priority_1}}` - Critical actions
- `{{actions_priority_2}}` - Important actions
- `{{actions_priority_3}}` - Nice-to-have actions
- `{{diy_time_estimates}}` - Time breakdown

## Pricing (configurable)
- `{{dfy_price}}` - Done-for-you price ($399-599)
- `{{ongoing_price}}` - Monthly retainer price ($99-149)
- `{{consultation_link}}` - Booking link
- `{{dfy_link}}` - Purchase link
- `{{full_service_link}}` - Purchase link
- `{{call_link}}` - Free call booking link

---

# EXAMPLE OUTPUT: Simple Case (Marcus)

---

# Royalty Health Report

**Prepared for:** Marc Waves
**Date:** January 16, 2026

---

## Quick Summary

| Metric | Value |
|--------|-------|
| **Registration Score** | 3/10 |
| **Estimated Unclaimed Royalties** | $1,800 - $2,400 |
| **Ongoing Monthly Gap** | ~$120/month |
| **Situation Complexity** | Simple |
| **Recommended Path** | DIY or Done-For-You |

---

## Your Current Setup

### What You Have ✓

- ✅ **Distribution (DistroKid)** - Collecting streaming income from Spotify, Apple Music, etc.

### What You're Missing ✗

- ❌ **PRO Membership** - Performance royalties for your compositions
- ❌ **The MLC** - Mechanical royalties from US streaming
- ❌ **SoundExchange** - Digital radio royalties for your recordings

---

## Estimated Money Left on the Table

Based on your reported income of **$500-1,000**/month from streaming:

| Missing Registration | Estimated Monthly Loss | Estimated Total Lost |
|---------------------|----------------------|---------------------|
| PRO (Performance) | ~$25 | ~$600 (24 months) |
| The MLC (Mechanicals) | ~$75 | ~$1,500 (20 months*) |
| SoundExchange | ~$20 | ~$480 (24 months) |
| **TOTAL** | **~$120** | **~$1,800 - $2,400** |

*MLC launched January 2021

**How we calculated this:**
Mechanical royalties are typically 10-15% of distributor income. Performance royalties vary but average 3-5% for indie artists without significant radio play. SoundExchange varies widely based on digital radio exposure.

---

## Your Action Plan

### Priority 1: Do This Week (Critical)

#### 1. Join BMI or ASCAP

**Why:** You need PRO membership to collect performance royalties. Without this, you're leaving money on the table every time your music is played.

**How:**
Choose one (not both):
- BMI is free for writers
- ASCAP has a one-time $50 fee

Create an account and complete the application. Then add your songs as "works."

**Link:** [BMI.com/join](https://www.bmi.com/join) or [ASCAP.com/join](https://www.ascap.com/join)

**Time needed:** 15-20 minutes to join, plus 5-10 minutes per song to register works

**What you'll need:**
- Legal name and SSN
- Contact information
- Your song titles

---

#### 2. Register with The MLC

**Why:** The MLC collects mechanical royalties from streaming. Since you don't have a publishing admin, you need to register directly.

**How:**
Create a free account at themlc.com. Then add your songs with their ISRC codes (get these from DistroKid).

**Link:** [themlc.com](https://www.themlc.com)

**Time needed:** 30-60 minutes depending on catalog size

**What you'll need:**
- Your DistroKid catalog export (download from DistroKid)
- ISRC codes for each song

---

#### 3. Register with SoundExchange

**Why:** SoundExchange collects digital radio royalties (Pandora, SiriusXM, etc.) for your recordings.

**How:**
Create a free account as a "Featured Artist" and add your recordings.

**Link:** [soundexchange.com](https://www.soundexchange.com)

**Time needed:** 15-20 minutes

**What you'll need:**
- Legal name and SSN
- Your recordings/releases

---

### Priority 2: Do This Month (Important)

#### 4. Document Co-Writer Splits

**Why:** You mentioned some songs have co-writers. Before registering these anywhere, make sure you have written agreement on who owns what percentage.

**How:**
Use a simple split sheet for each co-written song. Get each co-writer to sign.

**Link:** [Split sheet template]({{split_sheet_link}})

**Time needed:** 15 minutes per song, plus time to coordinate with co-writers

---

## DIY Estimated Time

| Task | Estimated Time |
|------|---------------|
| Join PRO + register 10 songs | 1-2 hours |
| Register with MLC | 30-60 min |
| Register with SoundExchange | 20 min |
| Document co-writer splits | 1-2 hours |
| **Total** | **3-5 hours** |

---

## Your Options

### Option 1: DIY (Free)
You have everything you need in this report. Follow the action plan step by step.

**Best for:** People with straightforward situations and time to handle it themselves.

**Estimated time:** 3-5 hours

---

### Option 2: Done-For-You ($399)

I'll execute this entire plan for you:
- Complete all registrations on your behalf
- Verify everything is set up correctly
- Handle any complications that arise
- Deliver a confirmation report when complete

**Best for:** People who value their time or want to make sure it's done right.

**Typical turnaround:** 1-2 weeks

[Get Done-For-You →]({{dfy_link}})

---

### Option 3: Done-For-You + Ongoing Management ($399 + $99/month)

Everything in Option 2, plus:
- Quarterly royalty statement review
- New release registration reminders
- Ongoing monitoring for issues
- Direct access for questions

**Best for:** Artists who want to focus on music, not paperwork.

[Get Full Service →]({{full_service_link}})

---

# EXAMPLE OUTPUT: Complex Case (Triggers Critical Warning)

---

## ⚠️ Warnings & Red Flags

### 🔴 Multiple Publishing Administrators Detected

You indicated you currently use Songtrust, but also previously used CD Baby Pro and aren't sure if that account is closed.

**Why this matters:** If both services are active, they may both be registering your songs with PROs, creating conflicting ownership claims. This can freeze your royalties until resolved.

**What to do:** Do NOT register any new songs until this is resolved. You need to:
1. Confirm whether CD Baby Pro account is still active
2. If active, formally close it and request they withdraw registrations
3. Or close Songtrust and keep CD Baby Pro
4. Verify in your PRO account that there are no duplicate registrations

---

### 🛑 STOP - Complex Situation Detected

Your situation involves potential conflicting publishing registrations. Proceeding with DIY registration could make this worse by creating additional conflicts.

**We recommend scheduling a consultation before taking any action.**

[Book a Consultation →]({{consultation_link}})

---
