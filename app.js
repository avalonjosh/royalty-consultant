import { marked } from 'marked';
import { runPipeline } from './src/pipeline/index.ts';
import { CONFIG } from './src/types/report.ts';

// Current page state
let currentPage = 1;
const totalPages = 5;

// Form data storage
let formData = {};
let followUpData = {};
let generatedReport = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateProgress();
  setupDynamicQ11Label();
});

// Dynamically update Q11 label based on Q10 selection
function setupDynamicQ11Label() {
  const q10Radios = document.querySelectorAll('input[name="q10_publishing_admin"]');
  q10Radios.forEach(radio => {
    radio.addEventListener('change', updateQ11Label);
  });
}

function updateQ11Label() {
  const q10Value = getRadioValue('q10_publishing_admin');
  const q11Label = document.getElementById('q11_label');
  const q11Help = document.getElementById('q11_help');

  // If user has a current publishing admin (not none, distrokid, or not_sure)
  const hasCurrentAdmin = q10Value && !['none', 'not_sure', 'distrokid'].includes(q10Value);

  if (hasCurrentAdmin) {
    q11Label.textContent = 'Have you used a DIFFERENT publishing administrator before your current one? *';
    q11Help.textContent = 'This helps us check for potential conflicts with previous administrators.';
  } else {
    q11Label.textContent = 'Have you EVER used a publishing administrator in the past? *';
    q11Help.textContent = 'This is important to check for potential conflicts.';
  }
}

// Page Navigation
window.nextPage = function(fromPage) {
  if (!validatePage(fromPage)) {
    return;
  }

  collectPageData(fromPage);

  if (fromPage === 3) {
    // Before going to follow-ups, generate the dynamic questions
    generateFollowUpQuestions();
  }

  currentPage = fromPage + 1;
  showPage(currentPage);
  updateProgress();
};

window.prevPage = function(fromPage) {
  currentPage = fromPage - 1;
  showPage(currentPage);
  updateProgress();
};

function showPage(pageNum) {
  // Hide all pages
  document.querySelectorAll('.form-page').forEach(page => {
    page.classList.remove('active');
  });

  // Show target page
  document.getElementById(`page-${pageNum}`).classList.add('active');

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress() {
  const progressFill = document.getElementById('progress-fill');
  const percentage = (currentPage / totalPages) * 100;
  progressFill.style.width = `${percentage}%`;

  // Update step indicators
  document.querySelectorAll('.step').forEach((step, index) => {
    step.classList.remove('active', 'completed');
    if (index + 1 === currentPage) {
      step.classList.add('active');
    } else if (index + 1 < currentPage) {
      step.classList.add('completed');
    }
  });
}

// Validation
function validatePage(pageNum) {
  let isValid = true;

  if (pageNum === 1) {
    isValid = validateRequired('q1_artist_name', 'text') &&
              validateRequired('q2_legal_name', 'text') &&
              validateRequired('q3_time_releasing', 'radio') &&
              validateRequired('q4_catalog_size', 'radio') &&
              validateRequired('q5_distributor', 'radio') &&
              validateRequired('q6_monthly_income', 'radio');
  } else if (pageNum === 2) {
    isValid = validateRequired('q7_pro', 'radio') &&
              validateRequired('q8_soundexchange', 'radio') &&
              validateRequired('q9_mlc', 'radio') &&
              validateRequired('q10_publishing_admin', 'radio') &&
              validateRequired('q11_previous_admin', 'radio') &&
              validateRequired('q17_sxm_play', 'radio');
  } else if (pageNum === 3) {
    isValid = validateRequired('q12_has_cowriters', 'radio') &&
              validateRequired('q13_changed_names', 'radio') &&
              validateRequired('q14_songs_by_others', 'radio') &&
              validateRequired('q15_managing_for', 'radio') &&
              validateRequired('q16_disputes', 'radio');
  }

  return isValid;
}

function validateRequired(name, type) {
  if (type === 'text') {
    const input = document.getElementById(name);
    if (!input.value.trim()) {
      showError(input);
      return false;
    }
    clearError(input);
    return true;
  } else if (type === 'radio') {
    const selected = document.querySelector(`input[name="${name}"]:checked`);
    if (!selected) {
      const group = document.querySelector(`input[name="${name}"]`).closest('.form-group');
      group.classList.add('error');
      return false;
    }
    const group = document.querySelector(`input[name="${name}"]`).closest('.form-group');
    group.classList.remove('error');
    return true;
  }
  return true;
}

function showError(input) {
  input.closest('.form-group').classList.add('error');
}

function clearError(input) {
  input.closest('.form-group').classList.remove('error');
}

// Data Collection
function collectPageData(pageNum) {
  if (pageNum === 1) {
    formData.q1_artist_name = document.getElementById('q1_artist_name').value;
    formData.q2_legal_name = document.getElementById('q2_legal_name').value;
    formData.q3_time_releasing = getRadioValue('q3_time_releasing');
    formData.q4_catalog_size = getRadioValue('q4_catalog_size');
    formData.q5_distributor = getRadioValue('q5_distributor');
    formData.q6_monthly_income = getRadioValue('q6_monthly_income');
  } else if (pageNum === 2) {
    formData.q7_pro = getRadioValue('q7_pro');
    formData.q8_soundexchange = getRadioValue('q8_soundexchange');
    formData.q9_mlc = getRadioValue('q9_mlc');
    formData.q10_publishing_admin = getRadioValue('q10_publishing_admin');
    formData.q11_previous_admin = getRadioValue('q11_previous_admin');
    formData.q17_sxm_play = getRadioValue('q17_sxm_play');
  } else if (pageNum === 3) {
    formData.q12_has_cowriters = getRadioValue('q12_has_cowriters');
    formData.q13_changed_names = getRadioValue('q13_changed_names');
    formData.q14_songs_by_others = getRadioValue('q14_songs_by_others');
    formData.q15_managing_for = getRadioValue('q15_managing_for');
    formData.q16_disputes = getRadioValue('q16_disputes');
  } else if (pageNum === 4) {
    collectFollowUpData();
  }
}

function getRadioValue(name) {
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  return selected ? selected.value : null;
}

// Follow-up Questions
function generateFollowUpQuestions() {
  const container = document.getElementById('followup-questions');
  container.innerHTML = '';

  const questions = [];

  // F1-F2: Previous admin details
  if (formData.q11_previous_admin === 'yes') {
    questions.push({
      id: 'f1_previous_admins',
      question: 'Which publishing administrator(s) did you use before?',
      type: 'checkbox',
      options: [
        { value: 'songtrust', label: 'Songtrust' },
        { value: 'cd_baby_pro', label: 'CD Baby Pro' },
        { value: 'tunecore_publishing', label: 'TuneCore Publishing' },
        { value: 'sentric', label: 'Sentric' },
        { value: 'other', label: 'Other' },
      ]
    });

    questions.push({
      id: 'f2_admin_cancelled',
      question: 'Did you formally cancel or close that account?',
      type: 'radio',
      options: [
        { value: 'yes_cancelled', label: 'Yes, I cancelled it' },
        { value: 'no_might_be_active', label: 'No, it might still be active' },
        { value: 'not_sure', label: 'Not sure' },
      ]
    });
  }

  // F17: PRO publishing entity
  if (formData.q7_pro !== 'none' && formData.q7_pro !== 'not_sure' &&
      (formData.q10_publishing_admin === 'none' || formData.q10_publishing_admin === 'not_sure' || formData.q10_publishing_admin === 'distrokid')) {
    questions.push({
      id: 'f17_pro_publishing_entity',
      question: 'Have you set up a publishing entity with your PRO?',
      helpText: 'This is different from being a member. A publishing entity lets you collect both the writer AND publisher share of your royalties.',
      type: 'radio',
      options: [
        { value: 'yes_have_publishing_entity', label: 'Yes, I have a publishing entity' },
        { value: 'no_only_writer', label: 'No, I\'m only registered as a writer' },
        { value: 'whats_a_publishing_entity', label: 'What\'s a publishing entity?' },
        { value: 'not_sure', label: 'Not sure' },
      ]
    });
  }

  // F18: SoundExchange registration type
  if (formData.q8_soundexchange === 'yes') {
    questions.push({
      id: 'f18_soundexchange_registration_type',
      question: 'When you registered with SoundExchange, did you register as:',
      helpText: 'SoundExchange has two sides: Rights Owner (who owns the master) and Featured Artist (who performed). Most indie artists need both.',
      type: 'radio',
      options: [
        { value: 'both_rights_owner_and_featured_artist', label: 'Both Rights Owner AND Featured Artist' },
        { value: 'rights_owner_only', label: 'Rights Owner only' },
        { value: 'featured_artist_only', label: 'Featured Artist only' },
        { value: 'not_sure', label: 'Not sure' },
      ]
    });
  }

  // F4-F6: Co-writer details
  if (formData.q12_has_cowriters === 'yes') {
    questions.push({
      id: 'f4_cowriter_count',
      question: 'Approximately how many of your songs have co-writers?',
      type: 'radio',
      options: [
        { value: '1_to_5', label: '1-5 songs' },
        { value: '6_to_15', label: '6-15 songs' },
        { value: '16_to_30', label: '16-30 songs' },
        { value: 'most_or_all', label: 'Most or all of my songs' },
      ]
    });

    questions.push({
      id: 'f5_split_sheets_status',
      question: 'Do you have signed split sheets documenting ownership percentages?',
      type: 'radio',
      options: [
        { value: 'yes_all', label: 'Yes, for all of them' },
        { value: 'yes_some', label: 'Yes, for some of them' },
        { value: 'no', label: 'No' },
        { value: 'whats_a_split_sheet', label: 'What\'s a split sheet?' },
      ]
    });

    questions.push({
      id: 'f6_cowriter_registered',
      question: 'Do you know if your co-writers have registered these songs with their PRO?',
      type: 'radio',
      options: [
        { value: 'yes_they_registered', label: 'Yes, they have registered' },
        { value: 'no_they_havent', label: 'No, they haven\'t' },
        { value: 'not_sure', label: 'Not sure' },
        { value: 'some_have_some_havent', label: 'Some have, some haven\'t' },
      ]
    });
  }

  // F7-F8: Name change details - allow multiple entries
  if (formData.q13_changed_names === 'yes') {
    questions.push({
      id: 'f7_previous_names',
      question: 'What were your previous artist names?',
      type: 'multi_text',
      placeholder: 'Enter artist name'
    });
  }

  // F16: Audience location
  questions.push({
    id: 'f16_audience_location',
    question: 'Where is most of your audience located?',
    type: 'radio',
    options: [
      { value: 'mostly_us', label: 'Mostly US' },
      { value: 'mostly_outside_us', label: 'Mostly outside US' },
      { value: 'mix', label: 'Mix of US and international' },
      { value: 'not_sure', label: 'Not sure' },
    ]
  });

  // Render questions
  if (questions.length === 0) {
    container.innerHTML = '<p>No additional questions needed. Click "Generate My Report" to continue.</p>';
  } else {
    questions.forEach(q => {
      container.appendChild(renderQuestion(q));
    });
  }
}

function renderQuestion(q) {
  const div = document.createElement('div');
  div.className = 'form-group';

  let html = `<label>${q.question}</label>`;

  if (q.helpText) {
    html += `<span class="help-text">${q.helpText}</span>`;
  }

  if (q.type === 'radio') {
    html += '<div class="radio-group">';
    q.options.forEach(opt => {
      html += `
        <label class="radio-option">
          <input type="radio" name="${q.id}" value="${opt.value}">
          <span>${opt.label}</span>
        </label>
      `;
    });
    html += '</div>';
  } else if (q.type === 'checkbox') {
    html += '<div class="checkbox-group">';
    q.options.forEach(opt => {
      html += `
        <label class="checkbox-option">
          <input type="checkbox" name="${q.id}" value="${opt.value}">
          <span>${opt.label}</span>
        </label>
      `;
    });
    html += '</div>';
  } else if (q.type === 'text') {
    html += `<input type="text" id="${q.id}" placeholder="${q.placeholder || ''}">`;
  } else if (q.type === 'multi_text') {
    html += `
      <div class="multi-input-container" id="${q.id}_container">
        <div class="multi-input-row">
          <input type="text" class="multi-input" name="${q.id}" placeholder="${q.placeholder || ''}">
          <button type="button" class="btn btn-small btn-remove" onclick="removeMultiInput(this)" style="display: none;">×</button>
        </div>
      </div>
      <button type="button" class="btn btn-small btn-add" onclick="addMultiInput('${q.id}', '${q.placeholder || ''}')">+ Add another name</button>
    `;
  }

  div.innerHTML = html;
  return div;
}

// Multi-input handlers for multiple artist names
window.addMultiInput = function(fieldId, placeholder) {
  const container = document.getElementById(`${fieldId}_container`);
  const newRow = document.createElement('div');
  newRow.className = 'multi-input-row';
  newRow.innerHTML = `
    <input type="text" class="multi-input" name="${fieldId}" placeholder="${placeholder}">
    <button type="button" class="btn btn-small btn-remove" onclick="removeMultiInput(this)">×</button>
  `;
  container.appendChild(newRow);

  // Show remove button on all rows when there's more than one
  updateRemoveButtons(container);
};

window.removeMultiInput = function(button) {
  const row = button.closest('.multi-input-row');
  const container = row.closest('.multi-input-container');
  row.remove();

  // Update remove button visibility
  updateRemoveButtons(container);
};

function updateRemoveButtons(container) {
  const rows = container.querySelectorAll('.multi-input-row');
  rows.forEach(row => {
    const removeBtn = row.querySelector('.btn-remove');
    if (removeBtn) {
      removeBtn.style.display = rows.length > 1 ? 'inline-block' : 'none';
    }
  });
}

function collectFollowUpData() {
  // Collect all follow-up answers
  const followUpQuestions = [
    'f1_previous_admins', 'f2_admin_cancelled', 'f3_pro_registration_order',
    'f4_cowriter_count', 'f5_split_sheets_status', 'f6_cowriter_registered',
    'f7_previous_names', 'f8_songs_per_name', 'f9_songs_by_others_count',
    'f10_registered_on_others', 'f11_previous_admin_status',
    'f12_relationship', 'f13_deceased', 'f14_legal_authority',
    'f15_dispute_description', 'f16_audience_location',
    'f17_pro_publishing_entity', 'f18_soundexchange_registration_type'
  ];

  followUpQuestions.forEach(id => {
    // Check for radio
    const radioSelected = document.querySelector(`input[name="${id}"]:checked`);
    if (radioSelected) {
      followUpData[id] = radioSelected.value;
    }

    // Check for checkbox (multi-select)
    const checkboxes = document.querySelectorAll(`input[name="${id}"]:checked`);
    if (checkboxes.length > 0) {
      followUpData[id] = Array.from(checkboxes).map(cb => cb.value);
    }

    // Check for text input (single)
    const textInput = document.getElementById(id);
    if (textInput && textInput.value) {
      followUpData[id] = textInput.value;
    }

    // Check for multi-text inputs (multiple artist names)
    const multiInputs = document.querySelectorAll(`input.multi-input[name="${id}"]`);
    if (multiInputs.length > 0) {
      const values = Array.from(multiInputs)
        .map(input => input.value.trim())
        .filter(val => val !== '');
      if (values.length > 0) {
        followUpData[id] = values;
      }
    }
  });
}

// Report Generation
let lastReportData = null; // Store for chat context

window.generateReport = function() {
  collectPageData(4);

  // Show loading
  document.getElementById('loading-overlay').classList.add('active');

  // Small delay for UX
  setTimeout(() => {
    try {
      // Run the pipeline
      const result = runPipeline(formData, followUpData, CONFIG);
      generatedReport = result.reportMarkdown;

      // Save report data for chat context
      lastReportData = result.reportData;

      // Render the report
      const reportContent = document.getElementById('report-content');
      reportContent.innerHTML = marked.parse(generatedReport);

      // Reset chat for new report
      resetChat();

      // Hide loading and show report
      document.getElementById('loading-overlay').classList.remove('active');
      currentPage = 5;
      showPage(5);
      updateProgress();
    } catch (error) {
      console.error('Error generating report:', error);
      document.getElementById('loading-overlay').classList.remove('active');
      alert('Error generating report. Please check your answers and try again.');
    }
  }, 1000);
};

// Report Actions
window.copyReport = function() {
  navigator.clipboard.writeText(generatedReport).then(() => {
    alert('Report copied to clipboard!');
  });
};

window.downloadReport = function() {
  const blob = new Blob([generatedReport], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `royalty-health-report-${formData.q1_artist_name.replace(/\s+/g, '-').toLowerCase()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

window.startOver = function() {
  formData = {};
  followUpData = {};
  generatedReport = '';
  lastReportData = null;
  resetChat();

  // Reset form
  document.querySelectorAll('input').forEach(input => {
    if (input.type === 'radio' || input.type === 'checkbox') {
      input.checked = false;
    } else {
      input.value = '';
    }
  });

  currentPage = 1;
  showPage(1);
  updateProgress();
};

// =============================================================================
// CHAT FUNCTIONALITY
// =============================================================================

let chatHistory = [];

function resetChat() {
  chatHistory = [];
  const messagesContainer = document.getElementById('chat-messages');
  if (messagesContainer) {
    messagesContainer.innerHTML = `
      <div class="chat-message assistant-message">
        <div class="message-content">
          I've analyzed your royalty setup. Feel free to ask me anything about your report, what the different royalty types mean, or which actions to prioritize!
        </div>
      </div>
    `;
  }
}

function appendChatMessage(role, content) {
  const messagesContainer = document.getElementById('chat-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${role}-message`;

  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';

  // Parse markdown for assistant messages
  if (role === 'assistant') {
    contentDiv.innerHTML = marked.parse(content);
  } else {
    contentDiv.textContent = content;
  }

  messageDiv.appendChild(contentDiv);
  messagesContainer.appendChild(messageDiv);

  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showChatLoading() {
  document.getElementById('chat-loading').style.display = 'flex';
}

function hideChatLoading() {
  document.getElementById('chat-loading').style.display = 'none';
}

window.handleChatKeypress = function(event) {
  if (event.key === 'Enter') {
    sendChatMessage();
  }
};

window.sendChatMessage = async function() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();

  if (!message) return;

  // Check if we have report data
  if (!lastReportData) {
    alert('Please generate a report first before asking questions.');
    return;
  }

  // Add user message to UI
  appendChatMessage('user', message);
  input.value = '';

  // Show loading
  showChatLoading();

  try {
    // Build context for API
    const context = {
      formData: formData,
      followUpData: followUpData,
      reportData: lastReportData
    };

    // Call chat API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        context: context,
        chatHistory: chatHistory
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Update history
    chatHistory.push({ role: 'user', content: message });
    chatHistory.push({ role: 'assistant', content: data.response });

    // Display response
    hideChatLoading();
    appendChatMessage('assistant', data.response);

  } catch (error) {
    console.error('Chat error:', error);
    hideChatLoading();
    appendChatMessage('assistant', "I'm sorry, I encountered an error. Please try again in a moment.");
  }
};
