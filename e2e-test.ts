import { chromium } from 'playwright';

const BASE_URL = 'https://royalty-consultant.vercel.app/';

// Test persona: Marcus Beat - a newer artist with minimal setup (should trigger fewer follow-ups)
const testArtist = {
  // Page 1: Basic Info
  artistName: 'Marcus Beat',
  legalName: 'Marcus Johnson',
  timeReleasing: '6_months_to_2_years',
  catalogSize: '11_to_25',
  distributor: 'tunecore',
  monthlyIncome: '100_to_500',

  // Page 2: Registrations
  pro: 'bmi',
  soundexchange: 'no',        // No SoundExchange - won't trigger F18
  mlc: 'not_sure',
  publishingAdmin: 'songtrust', // Has a publishing admin - won't trigger F17
  previousAdmin: 'no',        // No previous admin - won't trigger F1/F2

  // Page 3: Situation
  hasCowriters: 'no',         // No cowriters - won't trigger F4/F5/F6
  changedNames: 'no',         // No name changes - won't trigger F7
  songsByOthers: 'no',
  managingFor: 'own_music',
  disputes: 'no',
};

// Expected follow-up questions based on the answers above
// This artist should only see the audience location question
const expectedFollowUps = [
  'f16_audience_location',    // Always shown
];

async function runTest() {
  console.log('🚀 Starting E2E test for Royalty Consultant...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navigate to site
    console.log('📍 Navigating to', BASE_URL);
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Verify we're on page 1
    const header = await page.textContent('h2');
    console.log('✅ Page loaded. Header:', header);

    // =========== PAGE 1: Basic Info ===========
    console.log('\n📝 PAGE 1: Basic Info');

    await page.fill('#q1_artist_name', testArtist.artistName);
    console.log('  - Filled artist name:', testArtist.artistName);

    await page.fill('#q2_legal_name', testArtist.legalName);
    console.log('  - Filled legal name:', testArtist.legalName);

    await page.click(`input[name="q3_time_releasing"][value="${testArtist.timeReleasing}"]`);
    console.log('  - Selected time releasing:', testArtist.timeReleasing);

    await page.click(`input[name="q4_catalog_size"][value="${testArtist.catalogSize}"]`);
    console.log('  - Selected catalog size:', testArtist.catalogSize);

    await page.click(`input[name="q5_distributor"][value="${testArtist.distributor}"]`);
    console.log('  - Selected distributor:', testArtist.distributor);

    await page.click(`input[name="q6_monthly_income"][value="${testArtist.monthlyIncome}"]`);
    console.log('  - Selected monthly income:', testArtist.monthlyIncome);

    // Click Continue (page 1)
    await page.click('#page-1 button:has-text("Continue")');
    await page.waitForTimeout(500);
    console.log('  ➡️ Clicked Continue');

    // =========== PAGE 2: Registrations ===========
    console.log('\n📝 PAGE 2: Registrations');

    await page.click(`input[name="q7_pro"][value="${testArtist.pro}"]`);
    console.log('  - Selected PRO:', testArtist.pro);

    await page.click(`input[name="q8_soundexchange"][value="${testArtist.soundexchange}"]`);
    console.log('  - Selected SoundExchange:', testArtist.soundexchange);

    await page.click(`input[name="q9_mlc"][value="${testArtist.mlc}"]`);
    console.log('  - Selected MLC:', testArtist.mlc);

    await page.click(`input[name="q10_publishing_admin"][value="${testArtist.publishingAdmin}"]`);
    console.log('  - Selected Publishing Admin:', testArtist.publishingAdmin);

    await page.click(`input[name="q11_previous_admin"][value="${testArtist.previousAdmin}"]`);
    console.log('  - Selected Previous Admin:', testArtist.previousAdmin);

    // Click Continue (page 2)
    await page.click('#page-2 button:has-text("Continue")');
    await page.waitForTimeout(500);
    console.log('  ➡️ Clicked Continue');

    // =========== PAGE 3: Situation ===========
    console.log('\n📝 PAGE 3: Your Situation');

    await page.click(`input[name="q12_has_cowriters"][value="${testArtist.hasCowriters}"]`);
    console.log('  - Selected has cowriters:', testArtist.hasCowriters);

    await page.click(`input[name="q13_changed_names"][value="${testArtist.changedNames}"]`);
    console.log('  - Selected changed names:', testArtist.changedNames);

    await page.click(`input[name="q14_songs_by_others"][value="${testArtist.songsByOthers}"]`);
    console.log('  - Selected songs by others:', testArtist.songsByOthers);

    await page.click(`input[name="q15_managing_for"][value="${testArtist.managingFor}"]`);
    console.log('  - Selected managing for:', testArtist.managingFor);

    await page.click(`input[name="q16_disputes"][value="${testArtist.disputes}"]`);
    console.log('  - Selected disputes:', testArtist.disputes);

    // Click Continue (page 3)
    await page.click('#page-3 button:has-text("Continue")');
    await page.waitForTimeout(500);
    console.log('  ➡️ Clicked Continue');

    // =========== PAGE 4: Follow-up Questions ===========
    console.log('\n📝 PAGE 4: Follow-up Questions');

    // Check which follow-up questions appeared
    const followUpContainer = await page.$('#followup-questions');
    const foundQuestions: string[] = [];
    const missingQuestions: string[] = [];

    for (const expectedId of expectedFollowUps) {
      const questionExists = await page.$(`[name="${expectedId}"], #${expectedId}`);
      if (questionExists) {
        foundQuestions.push(expectedId);
        console.log(`  ✅ Found: ${expectedId}`);
      } else {
        missingQuestions.push(expectedId);
        console.log(`  ❌ MISSING: ${expectedId}`);
      }
    }

    // Get all question labels for debugging
    const allLabels = await page.$$eval('#followup-questions label:not(.radio-option):not(.checkbox-option)',
      labels => labels.map(l => l.textContent?.trim()).filter(Boolean)
    );
    console.log('\n  All questions shown:');
    allLabels.forEach(label => console.log(`    - ${label}`));

    // Answer the follow-up questions (only answer ones that exist)
    console.log('\n  Answering follow-up questions...');

    // Helper to safely click if exists
    const safeClick = async (selector: string, label: string) => {
      const exists = await page.$(selector);
      if (exists) {
        await page.click(selector);
        console.log(`    - ${label}`);
        return true;
      }
      return false;
    };

    // Helper to safely fill if exists
    const safeFill = async (selector: string, value: string, label: string) => {
      const exists = await page.$(selector);
      if (exists) {
        await page.fill(selector, value);
        console.log(`    - ${label}`);
        return true;
      }
      return false;
    };

    // Try to answer all possible follow-ups (only ones that exist will be answered)
    await safeClick('input[name="f1_previous_admins"][value="songtrust"]', 'Previous admin: Songtrust');
    await safeClick('input[name="f2_admin_cancelled"][value="no_might_be_active"]', 'Admin cancelled: No');
    await safeClick('input[name="f17_pro_publishing_entity"][value="no_only_writer"]', 'PRO entity: No');
    await safeClick('input[name="f18_soundexchange_registration_type"][value="featured_artist_only"]', 'SoundExchange: Featured artist only');
    await safeClick('input[name="f4_cowriter_count"][value="6_to_15"]', 'Cowriter count: 6-15');
    await safeClick('input[name="f5_split_sheets_status"][value="yes_some"]', 'Split sheets: Some');
    await safeClick('input[name="f6_cowriter_registered"][value="not_sure"]', 'Cowriter registered: Not sure');
    await safeFill('#f7_previous_names', 'Old Name', 'Previous names: Old Name');
    await safeClick('input[name="f16_audience_location"][value="mostly_us"]', 'Audience: Mostly US');

    // Click Generate Report
    console.log('\n  ➡️ Clicking "Generate My Report"...');
    await page.click('button:has-text("Generate My Report")');

    // Wait for loading to finish and report to appear
    await page.waitForTimeout(2000);
    await page.waitForSelector('#report-content h1', { timeout: 10000 });

    // =========== PAGE 5: Report ===========
    console.log('\n📝 PAGE 5: Report Generated!');

    // Get the report content
    const reportHTML = await page.$eval('#report-content', el => el.innerHTML);
    const reportText = await page.$eval('#report-content', el => el.textContent || '');

    // Check for expected content
    console.log('\n  Checking report content...');

    const expectedContent = [
      { label: 'Artist name', check: () => reportText.includes('Luna Waves') },
      { label: 'MLC missing', check: () => reportText.toLowerCase().includes('mlc') },
      { label: 'Score/rating', check: () => /score|rating|health/i.test(reportText) },
      { label: 'Action items', check: () => /action|step|todo|priority/i.test(reportText) },
      { label: 'Estimates', check: () => /\$[\d,]+/.test(reportText) },
    ];

    for (const item of expectedContent) {
      if (item.check()) {
        console.log(`  ✅ Report contains: ${item.label}`);
      } else {
        console.log(`  ❌ Report MISSING: ${item.label}`);
      }
    }

    // Print a snippet of the report
    console.log('\n  Report snippet (first 500 chars):');
    console.log('  ' + reportText.substring(0, 500).replace(/\n/g, '\n  '));

    // =========== SUMMARY ===========
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Follow-up questions found: ${foundQuestions.length}/${expectedFollowUps.length}`);
    if (missingQuestions.length > 0) {
      console.log(`Missing questions: ${missingQuestions.join(', ')}`);
    }
    console.log(`Report generated: ✅`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
  } finally {
    await browser.close();
    console.log('\n🏁 Test complete. Browser closed.');
  }
}

// Run the test
runTest();
