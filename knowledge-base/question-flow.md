# Question Flow

The intake form and conditional follow-up question logic for the royalty plan generator.

**Last Updated:** January 2026

---

## PART 1: INTAKE FORM (Static Questions)

Everyone answers these.

### Page 1: Basic Info

```
Q1: What is your artist/stage name?
TYPE: text
REQUIRED: yes

Q2: What is your legal name?
TYPE: text
REQUIRED: yes

Q3: How long have you been releasing music?
TYPE: single-select
OPTIONS:
  - Less than 6 months
  - 6 months to 2 years
  - 2-5 years
  - 5-10 years
  - 10+ years
REQUIRED: yes

Q4: Approximately how many songs have you released?
TYPE: single-select
OPTIONS:
  - 1-10
  - 11-25
  - 26-50
  - 51-100
  - 100+
REQUIRED: yes

Q5: What is your primary music distributor?
TYPE: single-select
OPTIONS:
  - DistroKid
  - TuneCore
  - CD Baby
  - AWAL
  - Ditto
  - UnitedMasters
  - Other
  - I don't have a distributor
REQUIRED: yes

Q6: What is your estimated monthly income from streaming/downloads?
TYPE: single-select
OPTIONS:
  - $0-100
  - $100-500
  - $500-1,000
  - $1,000-3,000
  - $3,000-10,000
  - $10,000+
REQUIRED: yes
```

### Page 2: Current Registrations

```
Q7: Are you a member of a PRO (Performing Rights Organization)?
TYPE: single-select
OPTIONS:
  - ASCAP
  - BMI
  - SESAC (invite only)
  - GMR (invite only)
  - None
  - Not sure
REQUIRED: yes

Q8: Are you registered with SoundExchange?
TYPE: single-select
OPTIONS:
  - Yes
  - No
  - Not sure / What's that?
REQUIRED: yes

Q9: Are you registered with The MLC (Mechanical Licensing Collective)?
TYPE: single-select
OPTIONS:
  - Yes
  - No
  - Not sure / What's that?
REQUIRED: yes

Q10: Do you currently use a publishing administrator?
TYPE: single-select
OPTIONS:
  - Songtrust
  - CD Baby Pro
  - TuneCore Publishing
  - Sentric
  - DistroKid (Note: not actually publishing admin)
  - Other
  - None
  - Not sure
REQUIRED: yes

Q11: Have you EVER used a publishing administrator in the past?
TYPE: single-select
OPTIONS:
  - Yes
  - No
  - Not sure
REQUIRED: yes
NOTE: Critical for detecting double-admin gotcha
```

### Page 3: Complexity Factors

```
Q12: Do any of your songs have co-writers (other people who helped write them)?
TYPE: single-select
OPTIONS:
  - Yes
  - No
REQUIRED: yes

Q13: Have you ever released music under a different artist name?
TYPE: single-select
OPTIONS:
  - Yes
  - No
REQUIRED: yes

Q14: Have any of your songs been recorded/released by other artists?
TYPE: single-select
OPTIONS:
  - Yes
  - No
  - Not sure
REQUIRED: yes

Q15: Are you managing music for someone else or an inherited catalog?
TYPE: single-select
OPTIONS:
  - No, this is my own music
  - Yes, I'm managing for someone else
  - Yes, I inherited this catalog
REQUIRED: yes

Q16: Are there any legal disputes or contested ownership of your songs?
TYPE: single-select
OPTIONS:
  - No
  - Yes
  - Possibly / Not sure
REQUIRED: yes
```

### Page 4: Optional Upload

```
Q17: Do you have a catalog spreadsheet or list you can upload?
TYPE: file upload (optional)
ACCEPTED: .csv, .xlsx, .xls
NOTE: If uploaded, AI will parse and reference in plan
```

---

## PART 2: FOLLOW-UP QUESTIONS (Conditional)

Based on intake answers, ask targeted follow-ups.

### If: Previous Publishing Admin = Yes (Q11)

```
F1: Which publishing administrator(s) did you use before?
TYPE: multi-select
OPTIONS:
  - Songtrust
  - CD Baby Pro
  - TuneCore Publishing
  - Sentric
  - Other (please specify)

F2: Did you formally cancel or close that account?
TYPE: single-select
OPTIONS:
  - Yes, I cancelled it
  - No, it might still be active
  - Not sure
```

**Logic:** If F2 = "No" or "Not sure" AND Q10 (current admin) != None → Trigger Gotcha #1 (Double Admin)

---

### If: PRO Member = Yes (Q7) AND Publishing Admin = Yes (Q10)

```
F3: Did you register your songs with your PRO yourself, or did your publishing admin do it?
TYPE: single-select
OPTIONS:
  - I registered them myself first
  - My publishing admin registered them
  - Both / Not sure
```

**Logic:** If F3 = "Both" or "I registered first" → Trigger Gotcha #2 (PRO + Admin Overlap)

---

### If: Has Co-Writers = Yes (Q12)

```
F4: Approximately how many of your songs have co-writers?
TYPE: single-select
OPTIONS:
  - 1-5 songs
  - 6-15 songs
  - 16-30 songs
  - Most or all of my songs

F5: Do you have signed split sheets documenting ownership percentages for co-written songs?
TYPE: single-select
OPTIONS:
  - Yes, for all of them
  - Yes, for some of them
  - No
  - What's a split sheet?

F6: Do you know if your co-writers have registered these songs with their PRO?
TYPE: single-select
OPTIONS:
  - Yes, they have registered
  - No, they haven't
  - Not sure
  - Some have, some haven't
```

**Logic:**
- If F5 = "No" or "some" → Trigger Gotcha #3 (Unconfirmed Splits)
- If F6 = "Yes" or "Not sure" → Trigger Gotcha #4 (Co-Writer Already Registered)

---

### If: Changed Artist Names = Yes (Q13)

```
F7: What were your previous artist names?
TYPE: text
PLACEHOLDER: "List all previous names, separated by commas"

F8: Approximately how many songs were released under each previous name?
TYPE: text
PLACEHOLDER: "e.g., 'Old Name 1: 15 songs, Old Name 2: 8 songs'"
```

**Logic:** If more than 2 previous names mentioned → Trigger Gotcha #8 (Multiple Names), recommend done-for-you

---

### If: Songs by Other Artists = Yes (Q14)

```
F9: Approximately how many of your songs have been recorded by other artists?
TYPE: single-select
OPTIONS:
  - 1-3 songs
  - 4-10 songs
  - 10+ songs

F10: Are you registered as the songwriter on those releases?
TYPE: single-select
OPTIONS:
  - Yes, I'm registered on all of them
  - Yes, on some of them
  - No
  - Not sure
```

**Logic:** If F10 = "No" or "Not sure" → Trigger Gotcha #10 (Songs by Others Unregistered)

---

### If: Previous Publishing Admin = Yes AND might be defunct

```
F11: Is the publishing company you previously used still in business?
TYPE: single-select
OPTIONS:
  - Yes, they're still active
  - No, they closed/went out of business
  - Not sure
  - They were acquired by another company
```

**Logic:** If F11 = "No" or "Not sure" or "Acquired" → Trigger Gotcha #9 (Dissolved Entity)

---

### If: Managing/Inherited = Yes (Q15)

```
F12: What is your relationship to the original artist/songwriter?
TYPE: single-select
OPTIONS:
  - Family member (child, spouse, sibling)
  - Designated representative
  - Business partner
  - Other

F13: Is the original artist/songwriter deceased?
TYPE: single-select
OPTIONS:
  - Yes
  - No
  - Prefer not to say

F14: Do you have legal authority (estate documents, power of attorney) to manage this catalog?
TYPE: single-select
OPTIONS:
  - Yes, I have documentation
  - In progress
  - No
  - Not sure what's needed
```

**Logic:** If managing for someone else or inherited → Trigger Gotcha #11 (Estate)

---

### If: Legal Disputes = Yes or Possibly (Q16)

```
F15: Can you briefly describe the dispute or ownership question?
TYPE: text (optional)
PLACEHOLDER: "Brief description - this helps us understand if DIY is appropriate"
```

**Logic:** Any dispute mentioned → Trigger Gotcha #12 (Legal Disputes)

---

### If: International audience indicated (future enhancement)

```
F16: Where is most of your audience located?
TYPE: single-select
OPTIONS:
  - Mostly US
  - Mostly outside US
  - Mix of US and international
  - Not sure
```

**Logic:** If "Mostly outside US" or "Mix" AND no publishing admin → Trigger Gotcha #15 (International)

---

### If: PRO Member = Yes (Q7) AND Publishing Admin = None (Q10)

```
F17: Have you set up a publishing entity with your PRO?
TYPE: single-select
OPTIONS:
  - Yes, I have a publishing entity
  - No, I'm only registered as a writer
  - What's a publishing entity?
  - Not sure
```

**Logic:** If F17 = "No" or "What's a publishing entity?" or "Not sure" → Trigger Gotcha #16 (Missing Publisher Share)

**IMPORTANT CONTEXT FOR AI:**
Performance royalties are split 50/50 between Writer and Publisher. If an indie artist has no publishing admin AND no publishing entity of their own, they're only collecting 50% of their performance royalties. Creating a publishing entity with ASCAP/BMI is FREE and takes ~15 minutes.

---

### If: SoundExchange = Yes (Q8)

```
F18: When you registered with SoundExchange, did you register as:
TYPE: single-select
OPTIONS:
  - Both Rights Owner AND Featured Artist
  - Rights Owner only
  - Featured Artist only
  - Not sure
```

**Logic:** If F18 = "Rights Owner only" or "Featured Artist only" or "Not sure" → Trigger Gotcha #7b (Only Registered One Side)

---

### Always Ask (Everyone):

```
F19: Do you know if your music has been played on SiriusXM (satellite radio)?
TYPE: single-select
OPTIONS:
  - Yes, I know it's been played on SXM
  - No, I don't think so
  - Not sure
```

**Logic:** If F19 = "Yes" AND Q8 (SoundExchange) = "No" → Escalate Gotcha #7 to CRITICAL priority. SXM royalties are ~$35/spin and can add up quickly.

**IMPORTANT CONTEXT:**
SiriusXM play is extremely valuable for royalties. Many artists don't realize:
1. They're getting SXM airplay (especially in genre-specific channels)
2. How much per-spin royalties are worth (~$35 total per spin)
3. That they need SoundExchange registration to collect these

If an artist confirms SXM play, SoundExchange becomes the #1 priority action item.

**IMPORTANT CONTEXT FOR AI:**
SoundExchange has TWO separate registrations:
1. Rights Owner (who owns the master recording) - 50% of royalties
2. Featured Artist (main performer on the recording) - 45% of royalties
(The remaining 5% goes to non-featured performers/session musicians via AFM/SAG-AFTRA fund)

Most indie artists who record their own music need BOTH registrations to collect 95% of what they're owed (the 5% goes to session musician fund regardless). Many artists only register once and miss roughly half their SoundExchange money.

---

## PART 3: QUESTION FLOW LOGIC

### Simplified Decision Tree

```
START
  │
  ├─▶ Intake Form (Q1-Q17)
  │
  ├─▶ Check: Previous publishing admin? (Q11)
  │     └─▶ YES → Ask F1, F2
  │           └─▶ Check: Still active + current admin? → GOTCHA #1
  │
  ├─▶ Check: PRO + Current Admin? (Q7 + Q10)
  │     └─▶ YES → Ask F3
  │           └─▶ Check: Registered self + admin? → GOTCHA #2
  │
  ├─▶ Check: Co-writers? (Q12)
  │     └─▶ YES → Ask F4, F5, F6
  │           ├─▶ Check: No split sheets? → GOTCHA #3
  │           └─▶ Check: Co-writer registered? → GOTCHA #4
  │
  ├─▶ Check: Name changes? (Q13)
  │     └─▶ YES → Ask F7, F8
  │           └─▶ Check: 3+ names? → GOTCHA #8
  │
  ├─▶ Check: Songs by others? (Q14)
  │     └─▶ YES → Ask F9, F10
  │           └─▶ Check: Not registered as writer? → GOTCHA #10
  │
  ├─▶ Check: Managing/inherited? (Q15)
  │     └─▶ YES → Ask F12, F13, F14 → GOTCHA #11
  │
  ├─▶ Check: Legal disputes? (Q16)
  │     └─▶ YES → Ask F15 → GOTCHA #12
  │
  ├─▶ Check: PRO member + No admin? (Q7 + Q10)
  │     └─▶ YES → Ask F17
  │           └─▶ Check: No publishing entity? → GOTCHA #16
  │
  ├─▶ Check: SoundExchange = Yes? (Q8)
  │     └─▶ YES → Ask F18
  │           └─▶ Check: Only one side? → GOTCHA #7b
  │
  └─▶ Generate Plan
```

### Auto-Detected Gotchas (No Follow-Up Needed)

These are detected directly from intake answers:

| Gotcha | Detection |
|--------|-----------|
| #5 DistroKid Confusion | Q5 = DistroKid AND Q10 = DistroKid or None |
| #6 No MLC | Q9 = No AND Q10 = None AND Q3 > 6 months |
| #7 No SoundExchange | Q8 = No |
| #13 High Income No Setup | Q6 > $3,000 AND (Q7 = None OR Q9 = No) |
| #14 New Artist | Q3 < 6 months AND Q4 < 10 AND Q6 < $100 |

---

## PART 4: QUESTION PRIORITY

If we need to limit follow-up questions (keep it short), prioritize:

**Must Ask (Critical Gotchas):**
1. Previous publishing admin status (F1, F2) - if applicable
2. Co-writer split documentation (F5) - if applicable
3. Estate/legal authority (F14) - if applicable
4. PRO publishing entity status (F17) - if PRO member with no admin (affects 50% of PRO income!)
5. SoundExchange registration type (F18) - if SoundExchange = yes (affects 50% of SE income!)

**Should Ask (Warning Gotchas):**
6. PRO vs admin registration order (F3) - if applicable
7. Co-writer registration status (F6) - if applicable
8. Songs by other artists registration (F10) - if applicable

**Nice to Have:**
9. Previous artist names details (F7, F8)
10. Number of co-writes (F4)
11. International audience (F16)

---

## PART 5: OUTPUT DATA STRUCTURE

After all questions answered, compile into structured data for plan generation:

```json
{
  "user": {
    "artist_name": "string",
    "legal_name": "string",
    "time_releasing": "string",
    "catalog_size": "string",
    "distributor": "string",
    "monthly_income": "string"
  },
  "registrations": {
    "pro": "ASCAP|BMI|SESAC|GMR|None|Not sure",
    "pro_registered_works": "boolean or null",
    "pro_has_publishing_entity": "boolean or null",
    "soundexchange": "boolean or null",
    "soundexchange_registered_as": "both|rights_owner_only|featured_artist_only|not_sure|null",
    "mlc": "boolean or null",
    "publishing_admin_current": "string or null",
    "publishing_admin_previous": "string or null",
    "previous_admin_cancelled": "boolean or null"
  },
  "complexity": {
    "has_cowriters": "boolean",
    "cowriter_count": "string or null",
    "split_sheets_status": "string or null",
    "cowriter_registered": "string or null",
    "name_changes": "boolean",
    "previous_names": "string or null",
    "songs_by_others": "boolean",
    "songs_by_others_count": "string or null",
    "registered_on_others": "string or null",
    "managing_for_other": "boolean",
    "inherited_catalog": "boolean",
    "legal_disputes": "boolean or string"
  },
  "gotchas_triggered": [
    {
      "id": 1,
      "name": "Double Publishing Admin",
      "severity": "critical"
    }
  ],
  "catalog_uploaded": "boolean",
  "catalog_data": "parsed data or null"
}
```

This data structure feeds into the plan generator.
