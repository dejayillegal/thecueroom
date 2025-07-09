# Troubleshooting

## Missing `@vitejs/plugin-react` during build
If the build fails with an error like:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@vitejs/plugin-react'
```

it usually means the dev dependencies were skipped or installed for a different platform.
Clean the install and reinstall with dev dependencies enabled:

```bash
rm -rf node_modules package-lock.json
NPM_CONFIG_PRODUCTION=false npm install
```

This fetches the correct optional binaries for your OS (e.g., `@rollup/rollup-linux-x64-gnu`).
After reinstalling, run the build again:

```bash
npm run build
```
