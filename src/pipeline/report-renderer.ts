import type { ReportData } from "../types/report.js";

// =============================================================================
// REPORT RENDERER - Generates Markdown Output
// =============================================================================

/**
 * Render complete Royalty Health Report as Markdown
 */
export function renderReport(data: ReportData): string {
  const sections: string[] = [];

  // Header
  sections.push(renderHeader(data));

  // Quick Summary
  sections.push(renderQuickSummary(data));

  // Current Setup
  sections.push(renderCurrentSetup(data));

  // Understanding Your Royalty Streams
  sections.push(renderRoyaltyStreams(data));

  // Estimated Money Left on Table
  sections.push(renderEstimates(data));

  // Warnings & Red Flags
  if (data.hasWarnings) {
    sections.push(renderWarnings(data));
  }

  // Action Plan (or Critical Block)
  sections.push(renderActionPlan(data));

  // Ongoing Maintenance
  if (!data.isCritical) {
    sections.push(renderOngoingMaintenance(data));
  }

  // DIY Time Estimates
  if (!data.isCritical && data.diyTimeEstimates.length > 0) {
    sections.push(renderDiyTime(data));
  }

  // Your Options
  sections.push(renderOptions(data));

  // Questions & Disclaimer
  sections.push(renderFooter(data));

  return sections.join("\n\n");
}

function renderHeader(data: ReportData): string {
  return `# Royalty Health Report

**Prepared for:** ${data.artistName}
**Date:** ${data.currentDate}

---`;
}

function renderQuickSummary(data: ReportData): string {
  return `## Quick Summary

| Metric | Value |
|--------|-------|
| **Registration Score** | ${data.score}/10 (${data.scoreLabel}) |
| **Estimated Unclaimed Royalties** | ${data.estimateLow} - ${data.estimateHigh} |
| **Ongoing Monthly Gap** | ~${data.monthlyGap}/month |
| **Situation Complexity** | ${data.complexity} |
| **Recommended Path** | ${data.recommendation} |

---`;
}

function renderCurrentSetup(data: ReportData): string {
  let content = `## Your Current Setup

### What You Have ✓

`;

  if (data.registrationsHave.length > 0) {
    for (const reg of data.registrationsHave) {
      content += `- ✅ **${reg.name}** - ${reg.description}\n`;
    }
  } else {
    content += `- ❌ No royalty registrations detected\n`;
  }

  content += `
### What You're Missing ✗

`;

  if (data.registrationsMissing.length > 0) {
    for (const reg of data.registrationsMissing) {
      content += `- ❌ **${reg.name}** - ${reg.whatItCollects}\n`;
    }
  } else {
    content += `- ✅ You appear to have all major registrations covered\n`;
  }

  content += `
---`;

  return content;
}

function renderRoyaltyStreams(data: ReportData): string {
  let content = `## Understanding Your Royalty Streams

As a musician, you have multiple income streams. Here's what applies to you:

### 1. Distribution Income (Streaming/Downloads)
**Source:** Your distributor (${data.distributor})
**What it is:** When someone streams your song on Spotify, Apple Music, etc., your distributor collects and pays you.

`;

  if (data.hasDistributor) {
    content += `✅ You're collecting this.\n`;
  } else {
    content += `❌ You need a distributor to release music and collect streaming income.\n`;
  }

  content += `
### 2. Performance Royalties (PRO)
**Source:** ASCAP, BMI, or SESAC
**What it is:** When your song is played on radio, TV, in venues, or streamed, your PRO collects performance royalties for the *composition* (the song itself, not the recording).

**Important:** Performance royalties are split **50/50 between Writer and Publisher**:
- **Writer share (50%)** - Goes to you as the songwriter
- **Publisher share (50%)** - Goes to whoever publishes your music

If you don't have a publisher or publishing admin, you need to create your own **publishing entity** with your PRO to collect the publisher half. Otherwise, you're only getting 50% of your performance royalties! Creating a publishing entity is FREE and takes about 15 minutes.

`;

  if (data.hasPro) {
    content += `✅ You're registered with ${data.proName}.\n`;
    if (data.hasPublishingAdmin) {
      content += `✅ Your publishing admin (${data.publishingAdmin}) collects your publisher share.\n`;
    } else if (data.hasProPublishingEntity) {
      content += `✅ You have a publishing entity to collect both shares.\n`;
    } else {
      content += `⚠️ **You may be missing 50% of your PRO income.** Without a publishing entity, you're only collecting the Writer share. Set up a publishing entity with ${data.proName} to collect both halves.\n`;
    }
  } else {
    content += `❌ **You are not collecting performance royalties.** This is separate from what your distributor pays you.\n`;
  }

  content += `
### 3. Mechanical Royalties (The MLC)
**Source:** The Mechanical Licensing Collective
**What it is:** When your song is streamed on interactive services (Spotify, Apple Music, Amazon), mechanical royalties are generated for the *composition*. This is separate from what your distributor pays.

`;

  if (data.hasMlc) {
    if (data.hasPublishingAdmin) {
      content += `✅ Your publishing administrator (${data.publishingAdmin}) should be collecting this for you.\n`;
    } else {
      content += `✅ You're registered with The MLC.\n`;
    }
  } else {
    content += `❌ **You are not collecting mechanical royalties.** This could be significant money accumulating unclaimed.\n`;
  }

  content += `
### 4. Digital Performance Royalties (SoundExchange)
**Source:** SoundExchange
**What it is:** When your *recording* is played on non-interactive digital radio (Pandora, SiriusXM, internet radio), SoundExchange collects royalties for the sound recording.

**Important:** SoundExchange has **TWO separate registrations**:
- **Rights Owner (50%)** - Who owns the master recording (typically you if you're indie)
- **Featured Artist (45%)** - Who performed on the recording (you)
- **Non-featured (5%)** - Goes to session musician fund (AFM/SAG-AFTRA)

If you record and perform your own music, you need to register as **BOTH** Rights Owner AND Featured Artist to collect your full 95%. Many artists only register once and miss roughly half their SoundExchange money!

Also note: **This applies to cover songs too!** If you recorded a cover of someone else's song, YOU own the Rights Owner and Featured Artist royalties for YOUR recording. (The composition royalties go to the original songwriter, but the master royalties are yours.)

SiriusXM plays are especially valuable - **~$35 per spin total** if you own 100% of both sides.

`;

  if (data.hasSoundexchange) {
    content += `✅ You're registered with SoundExchange.\n`;
    if (data.soundexchangeBothSides) {
      content += `✅ You're registered as both Rights Owner and Featured Artist.\n`;
    } else if (data.soundexchangeOneSide) {
      content += `⚠️ **You may be missing half your SoundExchange income.** You're only registered as ${data.soundexchangeRegisteredAs}. Register as the other side to collect your full royalties.\n`;
    } else {
      content += `⚠️ Make sure you're registered as BOTH Rights Owner AND Featured Artist to collect your full royalties.\n`;
    }
  } else {
    content += `❌ **You are not collecting digital performance royalties.** The amount varies by how much radio play you get, but SXM spins are extremely valuable (~$35/spin total at 100% ownership).\n`;
  }

  content += `
---`;

  return content;
}

function renderEstimates(data: ReportData): string {
  let content = `## Estimated Money Left on the Table

Based on your reported income of **${data.monthlyIncome}**/month from streaming:

| Missing Registration | Estimated Monthly Loss | Estimated Total Lost |
|---------------------|----------------------|---------------------|
`;

  for (const estimate of data.missingEstimates) {
    content += `| ${estimate.name} | ${estimate.monthly} | ${estimate.total} |\n`;
  }

  content += `| **TOTAL** | **~${data.totalMonthlyLoss}** | **~${data.totalLossEstimate}** |

**How we calculated this:**
${data.estimationExplanation}

⚠️ **Important:** These are estimates based on industry averages. Actual amounts vary based on where your streams come from, radio play, and other factors. The only way to know for sure is to register and start collecting.

---`;

  return content;
}

function renderWarnings(data: ReportData): string {
  let content = `## ⚠️ Warnings & Red Flags

`;

  for (const warning of data.warnings) {
    content += `### ${warning.icon} ${warning.title}

${warning.description}

**Why this matters:** ${warning.consequence}

**What to do:** ${warning.action}

---

`;
  }

  return content;
}

function renderActionPlan(data: ReportData): string {
  if (data.isCritical) {
    return `## Your Action Plan

### 🛑 STOP - Complex Situation Detected

${data.criticalMessage}

**We recommend scheduling a consultation before taking any action.** Proceeding with DIY registration could make your situation worse.

[Book a Consultation →](${data.consultationLink})

---`;
  }

  let content = `## Your Action Plan

`;

  if (data.actionsPriority1.length > 0) {
    content += `### Priority 1: Do This Week (Critical)

`;
    for (const action of data.actionsPriority1) {
      content += renderAction(action);
    }
  }

  if (data.actionsPriority2.length > 0) {
    content += `### Priority 2: Do This Month (Important)

`;
    for (const action of data.actionsPriority2) {
      content += renderAction(action);
    }
  }

  if (data.actionsPriority3.length > 0) {
    content += `### Priority 3: When You Have Time (Recommended)

`;
    for (const action of data.actionsPriority3) {
      content += renderAction(action);
    }
  }

  content += `---`;

  return content;
}

function renderAction(action: {
  number: number;
  title: string;
  why: string;
  instructions: string;
  linkText?: string;
  linkUrl?: string;
  timeEstimate: string;
  requirements?: string[];
}): string {
  let content = `#### ${action.number}. ${action.title}

**Why:** ${action.why}

**How:**
${action.instructions}

`;

  if (action.linkText && action.linkUrl) {
    content += `**Link:** [${action.linkText}](${action.linkUrl})

`;
  }

  content += `**Time needed:** ${action.timeEstimate}

`;

  if (action.requirements && action.requirements.length > 0) {
    content += `**What you'll need:**
`;
    for (const req of action.requirements) {
      content += `- ${req}\n`;
    }
    content += `
`;
  }

  content += `---

`;

  return content;
}

function renderOngoingMaintenance(data: ReportData): string {
  return `## Ongoing Maintenance

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

---`;
}

function renderDiyTime(data: ReportData): string {
  let content = `## DIY Estimated Time

If you follow this plan yourself:

| Task | Estimated Time |
|------|---------------|
`;

  for (const estimate of data.diyTimeEstimates) {
    content += `| ${estimate.task} | ${estimate.time} |\n`;
  }

  content += `| **Total** | **${data.totalDiyTime}** |

---`;

  return content;
}

function renderOptions(data: ReportData): string {
  if (data.isCritical) {
    return `## Your Options

Given the complexity of your situation, we recommend:

### Consultation ($49)
A 30-minute call to discuss your specific situation and create a custom action plan.

[Book a Consultation →](${data.consultationLink})

---`;
  }

  return `## Your Options

### Option 1: DIY (Free)
You have everything you need in this report. Follow the action plan step by step.

**Best for:** People with straightforward situations and time to handle it themselves.

**Estimated time:** ${data.totalDiyTime}

---

### Option 2: Done-For-You (${data.dfyPrice})

I'll execute this entire plan for you:
- Complete all registrations on your behalf
- Verify everything is set up correctly
- Handle any complications that arise
- Deliver a confirmation report when complete

**Best for:** ${data.dfyBestFor}

**Typical turnaround:** 1-2 weeks

[Get Done-For-You →](${data.dfyLink})

---

### Option 3: Done-For-You + Ongoing Management (${data.dfyPrice} + ${data.ongoingPrice}/month)

Everything in Option 2, plus:
- Quarterly royalty statement review
- New release registration reminders
- Ongoing monitoring for issues
- Direct access for questions
- Annual royalty health check

**Best for:** Artists who want to focus on music, not paperwork.

[Get Full Service →](${data.fullServiceLink})

---`;
}

function renderFooter(data: ReportData): string {
  return `## Questions?

**Not sure which option is right for you?**

Book a free 15-minute call to discuss your situation:
[Schedule a Call →](${data.callLink})

---

## Disclaimer

This report is for informational purposes only and does not constitute legal, tax, or financial advice. Estimates are based on industry averages and your reported information; actual royalties may vary. We recommend consulting with appropriate professionals for complex situations involving legal disputes, estates, or significant income.

---

**Report generated by The Royalty Guy**`;
}
