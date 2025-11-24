import { routes } from "./routes.js";

/**
 * Generate tabs for function detail pages
 * @param {string} funcId - Function ID
 * @returns {Array} Array of tab objects
 */
export const getFunctionTabs = (funcId) => [
    { id: "code", label: "Code", href: routes.functionCode(funcId) },
    { id: "versions", label: "Versions", href: routes.functionVersions(funcId) },
    { id: "executions", label: "Executions", href: routes.functionExecutions(funcId) },
    { id: "settings", label: "Settings", href: routes.functionSettings(funcId) },
    { id: "test", label: "Test", href: routes.functionTest(funcId) }
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
