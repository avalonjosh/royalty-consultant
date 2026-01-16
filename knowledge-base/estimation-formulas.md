# Estimation Formulas

How to calculate missing royalty estimates based on intake data. These formulas are conservative - better to under-promise than over-promise.

**Last Updated:** January 2026

**Sources:**
- Industry averages from Music Business Worldwide
- Streaming royalty data from distributors
- SoundExchange rate information (SiriusXM: ~$35/spin total)
- Mechanical royalty percentages (~15.1% of streaming revenue)
- Performance royalty percentages (~5% of streaming revenue)

---

## Input: Monthly Income Conversion

Users select income ranges. Convert to midpoint for calculations:

| Selection | Use Value |
|-----------|-----------|
| $0-100 | $50 |
| $100-500 | $300 |
| $500-1,000 | $750 |
| $1,000-3,000 | $2,000 |
| $3,000-10,000 | $6,500 |
| $10,000+ | $12,000 (cap for estimates) |

```
monthly_income = midpoint of selected range
```

---

## Formula 1: Missing MLC (Mechanical Royalties)

**When to apply:**
- MLC registered = No AND
- Publishing admin = None AND
- Has been releasing music

**Formula:**
```
mlc_monthly = monthly_income × 0.12

mlc_months_missed = months since January 2021 OR months since first release (whichever is less)

mlc_total_missed = mlc_monthly × mlc_months_missed
```

**Range output:**
```
mlc_low = mlc_total_missed × 0.7
mlc_high = mlc_total_missed × 1.3
```

**Explanation for report:**
> Mechanical royalties from streaming are typically 10-15% of your distributor income. We estimate 12% as a conservative average. The MLC has been collecting these royalties since January 2021.

**Example:**
- Monthly income: $750
- Releasing since: March 2023 (34 months ago, but MLC only since Jan 2021)
- Months missed: 34 months
- MLC monthly: $750 × 0.12 = $90
- MLC total: $90 × 34 = $3,060
- Range: $2,142 - $3,978

---

## Formula 2: Missing SoundExchange (Digital Performance)

**When to apply:**
- SoundExchange registered = No AND
- Has released recordings

**Formula:**
```
base_rate = 0.03  # 3% of streaming income as baseline

# Genre multiplier (if known)
genre_multiplier = {
  "pop": 1.2,
  "hip-hop": 1.1,
  "country": 1.5,
  "rock": 1.3,
  "r&b": 1.2,
  "edm": 0.7,
  "indie": 0.8,
  "jazz": 0.5,
  "classical": 0.4,
  "other": 1.0,
  "unknown": 1.0
}

soundexchange_monthly = monthly_income × base_rate × genre_multiplier

months_missed = months since first release (cap at 60 months / 5 years)

soundexchange_total = soundexchange_monthly × months_missed
```

**Range output:**
```
soundexchange_low = soundexchange_total × 0.5   # High variance
soundexchange_high = soundexchange_total × 1.5
```

**Explanation for report:**
> SoundExchange royalties vary significantly based on how much your music is played on digital radio (Pandora, SiriusXM, internet radio stations). This estimate assumes modest radio play consistent with independent artists.

**Example:**
- Monthly income: $750
- Genre: Hip-hop (1.1x)
- Releasing since: March 2023 (34 months)
- SE monthly: $750 × 0.03 × 1.1 = $24.75
- SE total: $24.75 × 34 = $841.50
- Range: $421 - $1,262

---

## Formula 3: Missing PRO (Performance Royalties)

**When to apply:**
- PRO member = No AND
- Has been releasing music

**Formula:**
```
base_rate = 0.04  # 4% of streaming income as baseline for indie artist

# This is highly variable - radio play, venue play, TV use all affect it
# For indie artists without major radio, this is conservative

pro_monthly = monthly_income × base_rate

months_missed = months since first release (cap at 60 months)

pro_total = pro_monthly × months_missed
```

**Range output:**
```
pro_low = pro_total × 0.5
pro_high = pro_total × 2.0   # Wide range due to high variability
```

**Explanation for report:**
> Performance royalties depend heavily on radio play, TV placements, and venue plays. For independent artists without major radio presence, these are typically a smaller portion of income. Artists with radio play or sync placements may earn significantly more.

**Example:**
- Monthly income: $750
- Releasing since: March 2023 (34 months)
- PRO monthly: $750 × 0.04 = $30
- PRO total: $30 × 34 = $1,020
- Range: $510 - $2,040

---

## Formula 3b: Missing PRO Publisher Share

**When to apply:**
- PRO member = Yes AND
- Publishing admin = None AND
- Has NOT created own publishing entity with PRO

**IMPORTANT CONTEXT:**
Performance royalties are split 50/50 between Writer and Publisher:
- Writer share: 50% → Goes to the songwriter
- Publisher share: 50% → Goes to the publisher

If an indie artist has no publisher and no publishing admin, they're only collecting the Writer 50%. The Publisher 50% goes uncollected unless they create their own publishing entity with their PRO.

**Formula:**
```
# If they're collecting PRO royalties but missing publisher share,
# their current PRO income = only the Writer 50%
# So they're missing an EQUAL amount in Publisher share

pro_publisher_monthly = current_pro_income  # What they're getting = what they're missing

# If they don't know their PRO income, estimate based on streaming income
if current_pro_income unknown:
  pro_writer_monthly = monthly_income × 0.04  # Same as Formula 3
  pro_publisher_monthly = pro_writer_monthly  # Missing equal amount

months_missed = months since PRO registration (cap at 60 months)

pro_publisher_total = pro_publisher_monthly × months_missed
```

**Range output:**
```
pro_publisher_low = pro_publisher_total × 0.5
pro_publisher_high = pro_publisher_total × 2.0
```

**Explanation for report:**
> Performance royalties are split 50/50 between Writer and Publisher. Without a publishing entity, you're only collecting the Writer half. By creating a free publishing entity with your PRO, you can collect both halves - potentially doubling your PRO income.

**Example:**
- Currently earning $50/month from ASCAP (Writer share)
- Missing: $50/month (Publisher share)
- Registered 24 months ago
- Total missed: $50 × 24 = $1,200
- Range: $600 - $2,400

---

## Formula 3c: SoundExchange - Only Registered One Side

**When to apply:**
- SoundExchange registered = Yes AND
- Only registered as Rights Owner OR Featured Artist (not both)

**IMPORTANT CONTEXT:**
SoundExchange royalties are split:
- 50% to Rights Owner (master recording owner)
- 45% to Featured Artist (main performer)
- 5% to non-featured performers (AFM/SAG-AFTRA session musician fund)

Most indie artists who record their own music should be registered as BOTH Rights Owner AND Featured Artist to collect 95% of the total (the remaining 5% goes to session musician fund regardless).

If they only registered one side, they're collecting ~45-50% instead of ~95%.

**Formula:**
```
# If they're collecting SoundExchange but only one side,
# their current SE income = only ~45%
# So they're missing an EQUAL amount from the other side

soundexchange_missing_monthly = current_soundexchange_income  # ~equal to what they have

# If they don't know their SE income, estimate
if current_soundexchange_income unknown:
  soundexchange_one_side_monthly = monthly_income × 0.03 × genre_multiplier × 0.5
  soundexchange_missing_monthly = soundexchange_one_side_monthly

months_missed = months since SoundExchange registration (cap at 60 months)

soundexchange_missing_total = soundexchange_missing_monthly × months_missed
```

**Range output:**
```
soundexchange_missing_low = soundexchange_missing_total × 0.5
soundexchange_missing_high = soundexchange_missing_total × 1.5
```

**Explanation for report:**
> SoundExchange splits royalties between Rights Owner (50%) and Featured Artist (45%). Since you only registered as one, you're missing roughly half. Registering the other side could nearly double your SoundExchange income.

**Example:**
- Currently earning $30/month from SoundExchange (one side)
- Missing: ~$30/month (other side)
- Registered 36 months ago
- Total missed: $30 × 36 = $1,080
- Range: $540 - $1,620

---

## Formula 4: Songs by Other Artists (Unregistered)

**When to apply:**
- Songs recorded by others = Yes AND
- Registered as songwriter = No or Not sure

**Formula:**
```
# This is speculative - we don't know how successful the other artist is
# Use conservative flat estimate based on number of songs

songs_by_others_count = {
  "1-3": 2,
  "4-10": 7,
  "10+": 15
}

# Assume average song by mid-level artist generates ~$50/month in writer royalties
# But we have no visibility, so be very conservative

estimate_per_song_monthly = 25  # Very conservative
songs = songs_by_others_count[selection]

songs_by_others_monthly = songs × estimate_per_song_monthly

months_missed = 24  # Assume ~2 years average

songs_by_others_total = songs_by_others_monthly × months_missed
```

**Range output:**
```
# Wide range because we have no visibility
songs_by_others_low = songs_by_others_total × 0.3
songs_by_others_high = songs_by_others_total × 3.0
```

**Explanation for report:**
> When other artists record your songs, you're entitled to songwriter royalties. Without knowing how successful those releases are, we can only provide a rough estimate. If any of these artists have significant streaming numbers, this could be substantially higher.

**Example:**
- Songs by others: 4-10 (use 7)
- Monthly per song: $25
- Total monthly: $175
- Months: 24
- Total: $4,200
- Range: $1,260 - $12,600 (note wide range, flag for verification)

---

## Formula 5: Registration Score

**Calculate a simple score out of 10:**

```
score = 0

# Has distributor (basic requirement)
if has_distributor: score += 2

# Has PRO
if has_pro: score += 2
if has_pro AND works_registered: score += 1

# Has MLC or publishing admin covering it
if has_mlc OR has_publishing_admin: score += 2

# Has SoundExchange
if has_soundexchange: score += 2

# No critical gotchas
if no_critical_flags: score += 1
```

**Score interpretation:**
- 9-10: Excellent - you're well set up
- 7-8: Good - minor gaps to address
- 5-6: Fair - missing important registrations
- 3-4: Poor - missing multiple royalty streams
- 0-2: Critical - barely collecting anything

---

## Formula 6: Total Estimates

**Combine individual estimates:**

```
total_monthly_gap = (
  mlc_monthly +
  soundexchange_monthly +
  soundexchange_missing_monthly +  # If only registered one side
  pro_monthly +
  pro_publisher_monthly +  # If missing publisher share
  songs_by_others_monthly
)

total_missed_low = (
  mlc_low +
  soundexchange_low +
  soundexchange_missing_low +
  pro_low +
  pro_publisher_low +
  songs_by_others_low
)

total_missed_high = (
  mlc_high +
  soundexchange_high +
  soundexchange_missing_high +
  pro_high +
  pro_publisher_high +
  songs_by_others_high
)
```

**Note:** Only include applicable estimates. For example:
- If they have no PRO, include pro_monthly (Formula 3) but NOT pro_publisher_monthly
- If they have PRO but no publisher entity, include pro_publisher_monthly (Formula 3b) but NOT pro_monthly
- If they have no SoundExchange, include soundexchange_monthly (Formula 2) but NOT soundexchange_missing_monthly
- If they have SoundExchange but only one side, include soundexchange_missing_monthly (Formula 3c) but NOT soundexchange_monthly

**Display as:**
> Estimated Unclaimed: $X,XXX - $X,XXX

---

## Formula 7: DIY Time Estimates

**Based on catalog size and complexity:**

```
base_times = {
  "join_pro": 20,          # minutes
  "register_works_per_song": 5,  # minutes per song
  "join_mlc": 30,
  "register_mlc_per_song": 3,
  "join_soundexchange": 20,
  "document_splits_per_song": 15,  # co-written songs only
}

# Catalog size conversion
catalog_count = {
  "1-10": 5,
  "11-25": 18,
  "26-50": 38,
  "51-100": 75,
  "100+": 120
}

songs = catalog_count[catalog_size]
cowritten_songs = songs × cowriter_percentage  # estimate from intake

# Calculate times
pro_time = base_times.join_pro + (songs × base_times.register_works_per_song)
mlc_time = base_times.join_mlc + (songs × base_times.register_mlc_per_song)
soundexchange_time = base_times.join_soundexchange
splits_time = cowritten_songs × base_times.document_splits_per_song

total_time_minutes = pro_time + mlc_time + soundexchange_time + splits_time
total_time_hours = total_time_minutes / 60
```

**Display as:**
> Estimated DIY Time: X-Y hours

(Add 20% buffer for range)

---

## Formula 8: Complexity Score

**Determines Simple / Moderate / Complex:**

```
complexity_points = 0

# Catalog size
if catalog_size > 50: complexity_points += 1
if catalog_size > 100: complexity_points += 1

# Co-writers
if has_cowriters: complexity_points += 1
if cowriter_count > 15: complexity_points += 1
if splits_not_documented: complexity_points += 1

# Name changes
if changed_names: complexity_points += 1
if name_count > 2: complexity_points += 1

# Publishing admin history
if has_previous_admin: complexity_points += 1
if admin_status_unclear: complexity_points += 2

# Songs by others
if songs_by_others: complexity_points += 1

# Income level (higher = higher stakes)
if monthly_income > 3000: complexity_points += 1

# Critical gotchas
if any_critical_gotcha: complexity_points += 5

# Determine level
if complexity_points >= 5:
  complexity = "Complex"
  recommendation = "Done-For-You" or "Consultation"
elif complexity_points >= 2:
  complexity = "Moderate"
  recommendation = "DIY possible, Done-For-You recommended"
else:
  complexity = "Simple"
  recommendation = "DIY"
```

---

## Formula 9: Recommendation Logic

```
if has_critical_gotcha:
  recommendation = "Consultation"
  block_diy_plan = true

elif complexity == "Complex" OR monthly_income > 5000:
  recommendation = "Done-For-You Recommended"
  show_diy_plan = true
  emphasize_dfy = true

elif complexity == "Moderate":
  recommendation = "DIY or Done-For-You"
  show_diy_plan = true

else:  # Simple
  recommendation = "DIY"
  show_diy_plan = true
```

---

## Output Summary

For the plan template, provide:

```json
{
  "estimates": {
    "mlc": {
      "monthly": 90,
      "total_low": 2142,
      "total_high": 3978,
      "months_missed": 34,
      "applicable": true
    },
    "soundexchange": {
      "monthly": 25,
      "total_low": 421,
      "total_high": 1262,
      "months_missed": 34,
      "applicable": true
    },
    "soundexchange_missing_side": {
      "monthly": 25,
      "total_low": 420,
      "total_high": 1260,
      "months_missed": 34,
      "applicable": false,
      "note": "Only applies if registered but only on one side"
    },
    "pro": {
      "monthly": 30,
      "total_low": 510,
      "total_high": 2040,
      "months_missed": 34,
      "applicable": true
    },
    "pro_publisher_share": {
      "monthly": 30,
      "total_low": 510,
      "total_high": 2040,
      "months_missed": 34,
      "applicable": false,
      "note": "Only applies if PRO member but no publishing entity"
    },
    "songs_by_others": {
      "monthly": 0,
      "total_low": 0,
      "total_high": 0,
      "applicable": false
    },
    "total": {
      "monthly_gap": 145,
      "total_low": 3073,
      "total_high": 7280
    }
  },
  "score": 3,
  "score_label": "Poor",
  "complexity": "Simple",
  "complexity_points": 1,
  "recommendation": "DIY",
  "diy_time_hours_low": 3,
  "diy_time_hours_high": 5,
  "block_diy": false
}
```

---

## Important Notes

### Always Be Conservative
- Under-promise, over-deliver
- Wide ranges are better than false precision
- When in doubt, use the lower estimate for headlines

### Caveats to Include
- "These are estimates based on industry averages"
- "Actual amounts vary based on streaming distribution, radio play, etc."
- "The only way to know for sure is to register and start collecting"

### Red Flags for Estimates
- If total estimate is very high ($10k+), add extra caveat
- If songs_by_others is large factor, emphasize uncertainty
- If genre is unknown, note that SoundExchange estimate is rough

### What We Can't Estimate
- Sync royalties (no data)
- International royalties beyond what MLC/PRO cover
- Neighboring rights (not applicable in US)
- Historical royalties that may have been redistributed

---

## Example: Full Calculation for Marcus

**Inputs:**
- Monthly income: $500-1,000 → $750
- PRO: None
- MLC: None
- SoundExchange: None
- Publishing admin: None
- Catalog: 10 songs
- Releasing since: January 2024 (24 months)
- Co-writers: Yes, ~30% of songs (3 songs)
- Genre: Hip-hop

**Calculations:**

MLC:
- Monthly: $750 × 0.12 = $90
- Months: 24 (all since MLC existed)
- Total: $2,160
- Range: $1,512 - $2,808

SoundExchange:
- Monthly: $750 × 0.03 × 1.1 = $24.75
- Months: 24
- Total: $594
- Range: $297 - $891

PRO:
- Monthly: $750 × 0.04 = $30
- Months: 24
- Total: $720
- Range: $360 - $1,440

Songs by others: N/A

**Totals:**
- Monthly gap: $90 + $25 + $30 = $145
- Total low: $1,512 + $297 + $360 = $2,169
- Total high: $2,808 + $891 + $1,440 = $5,139

**Score:** 2/10 (only has distributor)

**Complexity:** Simple (1 point for co-writers)

**DIY Time:**
- PRO: 20 + (10 × 5) = 70 min
- MLC: 30 + (10 × 3) = 60 min
- SoundExchange: 20 min
- Splits: 3 × 15 = 45 min
- Total: 195 min = 3.25 hours
- Range: 3-4 hours

**Output for report:**
> **Estimated Unclaimed:** $2,100 - $5,100
> **Monthly Gap:** ~$145/month
> **Registration Score:** 2/10
> **Complexity:** Simple
> **DIY Time:** 3-4 hours
