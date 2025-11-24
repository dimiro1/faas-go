/**
 * Route utility functions for generating URLs
 */

export const routes = {
    // Functions
    functions: () => "#!/functions",
    functionCreate: () => "#!/functions/new",
    functionCode: (id) => `#!/functions/${id}`,
    functionVersions: (id) => `#!/functions/${id}/versions`,
    functionExecutions: (id) => `#!/functions/${id}/executions`,
    functionSettings: (id) => `#!/functions/${id}/settings`,
    functionTest: (id) => `#!/functions/${id}/test`,
    functionDiff: (id, v1, v2) => `#!/functions/${id}/diff/${v1}/${v2}`,

    // Executions
    execution: (id) => `#!/executions/${id}`,

    // Auth
    login: () => "#!/login",

    // Preview
    preview: () => "#!/preview",
    previewComponent: (component) => `#!/preview/${component}`,
};

// Helper to get path for m.route.set (without #!/ prefix)
export const paths = {
    functions: () => "/functions",
    functionCreate: () => "/functions/new",
    functionCode: (id) => `/functions/${id}`,
    functionVersions: (id) => `/functions/${id}/versions`,
    functionExecutions: (id) => `/functions/${id}/executions`,
    functionSettings: (id) => `/functions/${id}/settings`,
    functionTest: (id) => `/functions/${id}/test`,
    functionDiff: (id, v1, v2) => `/functions/${id}/diff/${v1}/${v2}`,
    execution: (id) => `/executions/${id}`,
    login: () => "/login",
};

export default routes;
