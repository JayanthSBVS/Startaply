# Antigravity plugin deliverable

Current package:

`ui-ux-pro-max-antigravity-v1.1.0.zip`

SHA-256:

```text
b20c2f115724f258c73c3cd7a6a36049e23bfb994ca94cf21641944a16119a3a
```

Version 1.1.0 replaces the PowerShell automation layer with Python 3 and small CMD launchers, eliminating Windows PowerShell's case-insensitive command and variable collisions.

The Python installer was exercised end-to-end with a simulated legacy plugin: exact backup (including the old `.env`), replacement, 14 health checks, secret exclusion, standalone doctor, manual restore, intentionally failed validation, and automatic rollback all passed.

The archive contains `Install.cmd`, `Doctor.cmd`, `Restore.cmd`, two focused skills, local design tools, tests, and checksums. It does not modify Startaply application source code.
