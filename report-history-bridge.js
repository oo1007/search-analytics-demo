(() => {
  const reports = [
    ['0605', '0605 周报', 'search_weekly_dashboard_0605_baseline.html'],
    ['0612', '0612 周报', 'search_weekly_dashboard_0612.html'],
    ['0622', '0622 周报', 'search_weekly_dashboard_0622.html'],
    ['0629', '0629 周报', 'search_weekly_dashboard_0629.html'],
    ['0703', '0703 周报', 'search_weekly_dashboard_0703.html'],
    ['0710', '0710 周报', 'search_weekly_dashboard_0710.html'],
    ['0717', '0717 周报', 'search_weekly_dashboard_0717.html'],
    ['0724', '0724 周报', 'archive_0724.html'],
    ['0731', '0731 周报', 'archive_0731.html'],
    ['0807', '0807 周报', 'index.html'],
  ];

  const archiveMatch = window.location.pathname.match(/^(.*\/)archive\/\d{4}(?:\/index\.html|\/)?$/);
  const rootPath = archiveMatch
    ? archiveMatch[1]
    : window.location.pathname.replace(/[^/]*$/, '');
  const appRoot = new URL(rootPath, window.location.origin);
  const currentVersion = window.location.pathname.match(/search_weekly_dashboard_(\d{4})(?:_baseline)?\.html$/)?.[1]
    ?? window.location.pathname.match(/\/archive\/(\d{4})(?:\/index\.html|\/)?$/)?.[1]
    ?? window.location.pathname.match(/archive_(\d{4})\.html$/)?.[1] ?? document.title.match(/(\d{4})/)?.[1];
  const optionSignature = reports.map(([version]) => version).join(',');

  const enhanceSelect = () => {
    const select = document.querySelector('.report-history select, select[aria-label="选择周报"]');
    if (!(select instanceof HTMLSelectElement)) return;

    const existingSignature = Array.from(select.options).map((option) => option.value).join(',');
    if (existingSignature !== optionSignature) {
      select.replaceChildren(...reports.map(([version, label]) => new Option(label, version)));
    }
    if (currentVersion && reports.some(([version]) => version === currentVersion)) {
      select.value = currentVersion;
    }
    select.dataset.reportHistoryBridge = 'true';
  };

  document.addEventListener('change', (event) => {
    const select = event.target;
    if (!(select instanceof HTMLSelectElement) || select.dataset.reportHistoryBridge !== 'true') return;

    const report = reports.find(([version]) => version === select.value);
    if (!report) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.assign(new URL(report[2], appRoot).href);
  }, true);

  const observer = new MutationObserver(enhanceSelect);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', enhanceSelect, { once: true });
  enhanceSelect();
})();

