# Commercial release checklist

This checklist records release work that cannot be inferred from the current repository. Keep evidence and decisions with the release record.

## Git and source hygiene

- [ ] Choose the canonical remote and add it with `git remote add origin <repository-url>`.
- [ ] Set the correct author identity for this repository, review `git status`, then make the initial commit.
- [ ] Confirm no credentials, personal data, generated files, model weights, or unapproved audio are staged.
- [ ] Add release tags only after the release candidate has been reviewed.

## Rights and notices

- [ ] Select and add the intended source and binary distribution license. Commercial distribution rights must be confirmed by the rights holder.
- [ ] Confirm ownership or commercial redistribution rights for all source, design, animation, voice recordings, trained voice models, music, fonts, and other assets.
- [ ] Audit `package-lock.json` and bundled/downloaded dependencies; include required third-party notices and license texts in source and binary packages.
- [ ] Review the Three.js license and retain its required notices for the checked-in browser bundles.
- [ ] Confirm names, logos, and integration references are used with permission and do not imply endorsement.

## Security and privacy

- [ ] Remove development-only shared credentials and rotate any secrets that may have been distributed. Use per-install credentials or a documented local setup.
- [ ] Review local HTTP services, authentication defaults, CORS, filesystem access, Electron navigation, and update/download behavior.
- [ ] Document collected, stored, and transmitted data, retention, and user controls; provide a privacy notice if applicable.
- [ ] Verify the installer does not package `.env`, local databases, logs, test profiles, or downloaded models unintentionally.

## Build and distribution

- [ ] Define supported Windows versions and any supported non-Windows platforms.
- [ ] Create a reproducible installer/package from a clean checkout; document Python, model, and optional service setup.
- [ ] Add versioning and release notes, validate upgrade/uninstall behavior, and test on a clean machine.
- [ ] Sign executables and installers with the publisher's certificate; verify signatures on the published files.
- [ ] Provide checksums and a trusted update/distribution channel.
- [ ] Add support, vulnerability reporting, and end-of-life contact/process.
