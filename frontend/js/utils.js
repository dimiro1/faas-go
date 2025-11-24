/**
 * Generate tabs for function detail pages
 * @param {string} funcId - Function ID
 * @returns {Array} Array of tab objects
 */
export const getFunctionTabs = (funcId) => [
    { id: "code", label: "Code", href: `#!/functions/${funcId}` },
    { id: "versions", label: "Versions", href: `#!/functions/${funcId}/versions` },
    { id: "executions", label: "Executions", href: `#!/functions/${funcId}/executions` },
    { id: "settings", label: "Settings", href: `#!/functions/${funcId}/settings` },
    { id: "test", label: "Test", href: `#!/functions/${funcId}/test` }
];

export const formatUnixTimestamp = (timestamp, format = 'datetime') => {
  if (!timestamp || timestamp === 0) {
    return 'N/A';
  }

  const date = new Date(timestamp * 1000);

  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  switch (format) {
    case 'time':
      return date.toLocaleTimeString();
    case 'date':
      return date.toLocaleDateString();
    case 'datetime':
    default:
      return date.toLocaleString();
  }
};
