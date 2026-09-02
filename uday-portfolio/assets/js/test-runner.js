/* ==========================================================================
   INTERACTIVE PYTEST RUNNER SIMULATION
   Author: Uday B G (QA Automation Engineer)
   Simulates live Python Pytest automated test execution
   ========================================================================== */

const testSuites = {
  ecommerce: {
    name: "ShoppersStack E-Commerce (Selenium + Pytest POM)",
    command: "pytest -v --html=report.html tests/ecommerce/",
    tests: [
      { file: "test_auth_pom.py", name: "test_login_valid_credentials", time: "42ms", assertCount: 3 },
      { file: "test_catalog.py", name: "test_search_and_filter_products", time: "78ms", assertCount: 5 },
      { file: "test_cart_pom.py", name: "test_add_to_cart_and_verify_badge", time: "65ms", assertCount: 4 },
      { file: "test_checkout.py", name: "test_checkout_address_and_payment_flow", time: "112ms", assertCount: 6 },
      { file: "test_regression.py", name: "test_empty_cart_error_banner_handling", time: "38ms", assertCount: 2 },
    ]
  },
  dcs: {
    name: "Yokogawa DCS & Industrial Automation Suite",
    command: "pytest -v tests/industrial_dcs/ --platform=CENTUM_VP",
    tests: [
      { file: "test_fcs_comm.py", name: "test_field_control_station_heartbeat", time: "55ms", assertCount: 4 },
      { file: "test_prosafe_rs.py", name: "test_safety_trip_logic_interlock", time: "89ms", assertCount: 5 },
      { file: "test_his_station.py", name: "test_human_interface_alarm_annunciation", time: "74ms", assertCount: 3 },
      { file: "test_exapilot.py", name: "test_automated_sop_execution_sequence", time: "135ms", assertCount: 7 },
      { file: "test_pace_system.py", name: "test_process_data_telemetry_consistency", time: "61ms", assertCount: 4 },
    ]
  },
  api: {
    name: "REST API & Oracle SQL DB Verification Suite",
    command: "pytest -v tests/api_validation/ --env=staging",
    tests: [
      { file: "test_auth_api.py", name: "test_oauth2_jwt_token_validation_200", time: "28ms", assertCount: 3 },
      { file: "test_products_api.py", name: "test_get_inventory_schema_contract", time: "45ms", assertCount: 6 },
      { file: "test_orders_api.py", name: "test_post_create_order_idempotent", time: "92ms", assertCount: 4 },
      { file: "test_oracle_db.py", name: "test_sql_transaction_record_integrity", time: "84ms", assertCount: 5 },
    ]
  }
};

let currentSuiteKey = 'ecommerce';
let isRunning = false;

document.addEventListener('DOMContentLoaded', () => {
  initTestRunner();
});

function initTestRunner() {
  const terminal = document.getElementById('terminal-body');
  const runBtn = document.getElementById('btn-run-tests');
  const suiteSelect = document.getElementById('suite-selector');
  const clearBtn = document.getElementById('btn-clear-terminal');

  if (!terminal || !runBtn) return;

  // Print initial banner
  printInitialState();

  // Suite select listener
  if (suiteSelect) {
    suiteSelect.addEventListener('change', (e) => {
      if (isRunning) return;
      currentSuiteKey = e.target.value;
      printInitialState();
    });
  }

  // Clear button
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (isRunning) return;
      terminal.innerHTML = '';
      resetCounters();
      printInitialState();
    });
  }

  // Run button
  runBtn.addEventListener('click', () => {
    if (isRunning) return;
    executeSuite(currentSuiteKey);
  });
}

function printInitialState() {
  const terminal = document.getElementById('terminal-body');
  const suite = testSuites[currentSuiteKey];
  resetCounters();
  
  terminal.innerHTML = `
    <div class="terminal-line text-slate-500 mb-2">
      <span class="text-cyan-400 font-semibold mr-2">root@uday-qa-engine</span>:<span class="text-emerald-400">~/automation</span>$ ${suite.command}
    </div>
    <div class="terminal-line text-slate-400 text-xs sm:text-sm">
      ============================== test session starts ==============================
    </div>
    <div class="terminal-line text-slate-400 text-xs sm:text-sm">
      platform win32 -- Python 3.11.8, pytest-8.2.0, pluggy-1.5.0
    </div>
    <div class="terminal-line text-slate-400 text-xs sm:text-sm">
      rootdir: C:\\qa_automation\\framework, configfile: pytest.ini
    </div>
    <div class="terminal-line text-slate-400 text-xs sm:text-sm">
      plugins: html-4.1.1, metadata-3.1.1, xdist-3.5.0
    </div>
    <div class="terminal-line text-amber-400 text-xs sm:text-sm font-semibold my-2">
      ⚡ Ready to execute. Click "[ Run Test Suite ]" to launch live execution!
    </div>
  `;
}

function resetCounters() {
  const countPassed = document.getElementById('count-passed');
  const countTotal = document.getElementById('count-total');
  const durationEl = document.getElementById('count-duration');
  const progressBar = document.getElementById('test-progress-bar');
  const progressText = document.getElementById('test-progress-text');
  const statusBadge = document.getElementById('runner-status-badge');

  if (countPassed) countPassed.textContent = '0';
  if (countTotal) countTotal.textContent = `${testSuites[currentSuiteKey].tests.length}`;
  if (durationEl) durationEl.textContent = '0.00s';
  if (progressBar) progressBar.style.width = '0%';
  if (progressText) progressText.textContent = 'Ready';
  if (statusBadge) {
    statusBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700';
    statusBadge.textContent = 'IDLE';
  }
}

async function executeSuite(suiteKey) {
  const terminal = document.getElementById('terminal-body');
  const runBtn = document.getElementById('btn-run-tests');
  const progressBar = document.getElementById('test-progress-bar');
  const progressText = document.getElementById('test-progress-text');
  const countPassed = document.getElementById('count-passed');
  const durationEl = document.getElementById('count-duration');
  const statusBadge = document.getElementById('runner-status-badge');

  const suite = testSuites[suiteKey];
  const tests = suite.tests;
  
  isRunning = true;
  runBtn.disabled = true;
  runBtn.classList.add('opacity-50', 'cursor-not-allowed');

  if (statusBadge) {
    statusBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 animate-pulse';
    statusBadge.textContent = 'RUNNING';
  }

  // Clear previous execution lines
  terminal.innerHTML = `
    <div class="terminal-line text-slate-500 mb-2">
      <span class="text-cyan-400 font-semibold mr-2">root@uday-qa-engine</span>:<span class="text-emerald-400">~/automation</span>$ ${suite.command}
    </div>
    <div class="terminal-line text-slate-400 text-xs sm:text-sm">
      ============================== test session starts ==============================
    </div>
    <div class="terminal-line text-slate-400 text-xs sm:text-sm">
      platform win32 -- Python 3.11.8, pytest-8.2.0
    </div>
    <div class="terminal-line text-slate-300 text-xs sm:text-sm my-1">
      collecting ... ${tests.length} items collected
    </div>
  `;

  const startTime = performance.now();
  let passedCount = 0;

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    
    // Simulate setup delay
    await sleep(250 + Math.random() * 200);

    passedCount++;
    const percent = Math.round(((i + 1) / tests.length) * 100);

    // Update progress bar
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `${percent}% (${i + 1}/${tests.length})`;
    if (countPassed) countPassed.textContent = `${passedCount}`;

    const currentDuration = ((performance.now() - startTime) / 1000).toFixed(2);
    if (durationEl) durationEl.textContent = `${currentDuration}s`;

    // Append test run line
    const line = document.createElement('div');
    line.className = 'terminal-line text-xs sm:text-sm font-mono py-0.5 flex flex-wrap justify-between items-center';
    line.innerHTML = `
      <div class="flex items-center space-x-2">
        <span class="text-slate-400 font-medium">${test.file}::</span>
        <span class="text-cyan-300 font-semibold">${test.name}</span>
        <span class="text-slate-600 hidden sm:inline">(${test.assertCount} assertions)</span>
      </div>
      <div class="flex items-center space-x-3">
        <span class="text-slate-500 text-xs">${test.time}</span>
        <span class="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">[PASSED]</span>
        <span class="text-slate-400 w-12 text-right">${percent}%</span>
      </div>
    `;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
  }

  // Suite Finished
  await sleep(200);
  const totalDuration = ((performance.now() - startTime) / 1000).toFixed(2);
  if (durationEl) durationEl.textContent = `${totalDuration}s`;

  const summary = document.createElement('div');
  summary.className = 'terminal-line my-3 p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg flex flex-col space-y-1';
  summary.innerHTML = `
    <div class="text-emerald-400 font-bold text-sm">
      ✔ PASSED: ${passedCount} of ${tests.length} tests passed with 100% stability!
    </div>
    <div class="text-slate-300 text-xs">
      Execution time: <strong class="text-cyan-400">${totalDuration}s</strong> | Zero flaky tests detected | Allure & HTML report generated at <span class="text-slate-400 underline">./reports/report.html</span>
    </div>
    <div class="text-slate-400 text-xs mt-1">
      Yokogawa Industrial QA Standards & Page Object Model assertions verified.
    </div>
  `;
  terminal.appendChild(summary);
  terminal.scrollTop = terminal.scrollHeight;

  if (statusBadge) {
    statusBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-900/60 text-emerald-300 border border-emerald-500/40';
    statusBadge.textContent = 'PASSED';
  }

  isRunning = false;
  runBtn.disabled = false;
  runBtn.classList.remove('opacity-50', 'cursor-not-allowed');

  // Trigger celebratory micro-confetti or notification
  showToast(`Test Suite "${suite.name}" executed successfully! All assertions passed.`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
