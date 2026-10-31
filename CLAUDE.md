# Agent instructions

Read `SPEC.md` (what to build) and `STANDARDS.md` (how to write it) before doing anything else. If they conflict, `SPEC.md` wins for behavior and `STANDARDS.md` wins for style.

## Workflow

- Work on the branch you were given. Never push to `main`.
- Commit in small, logical steps with clear messages. Limit the PR to one topic. Use semantic commit messages (i.e. `feat:`, `chore:` `refactor:` etc)
- Before every commit, run linting, testing, and formatting in each package you changed, and fix failures first.
- After every push, wait for checks: `gh pr checks <number> --watch`
- If a check fails, read the logs (`gh run view <run-id> --log-failed`), fix the cause, push, and wait again.
- If no checks ran at all, that's a failure too. Make sure the workflow exists and triggers on this PR.
- After 3 failed fix attempts, stop: mark the PR as draft (`gh pr ready --undo`) and comment with what's failing and why.

## Rules

- Tools and Frameworks should be up to date. Especially for frameworks, check the docs and follow instructions to start optimally.
- Don't weaken, skip, or delete tests or lint rules to make checks pass. Fix the code instead.
- You may edit `.github/workflows/`. Explain any CI change in the PR description.
- Don't add dependencies beyond what the spec needs. Explain each new one in the PR description.
- Never commit secrets, tokens, or `.env` files!
- If the spec is ambiguous, pick the simplest reasonable option and note it in the PR description.

## PR description

End with a short summary: what was built, any ambiguities and the choices made, any CI changes, and anything left unfinished.
