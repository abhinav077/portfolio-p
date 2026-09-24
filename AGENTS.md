# AGENTS.md

## Project context

This repository started as another person’s developer portfolio. It is being
carefully transformed into a personal portfolio for a pianist. The existing
pages, components, assets, animations, and interactions are inherited material
and may be changed, replaced, removed, or retained as the user directs.

The user is the source of truth for the portfolio’s identity, content, visual
direction, page structure, component scope, and final decisions.

## Authority and scope

- Do exactly what the user requests for the current task.
- Do not make assumptions about what should be edited, updated, deleted, added,
  renamed, or redesigned.
- Do not infer biographical facts, musical experience, repertoire, education,
  performances, teaching history, contact details, social links, images, or
  other personal information.
- Never invent copy, assets, routes, components, features, integrations, or
  design requirements to fill gaps. Use an explicit placeholder only when it
  is appropriate and make it visible to the user.
- If the request is ambiguous, has multiple reasonable interpretations, or
  lacks required content, stop before making the affected change and ask a
  focused question.
- The user decides whether an existing page or component should be preserved,
  modified, replaced, or deleted. Do not remove inherited work merely because
  it appears unrelated to the pianist portfolio.

## Working rules

Before changing code:

1. Read the relevant files and trace the affected component, page, asset, and
   consumer relationships.
2. Check existing project instructions, scripts, dependencies, and the current
   Git worktree state.
3. Trace all interconnected factors, dependencies, and cascading layers that
   influence the target behavior. Do not assume an issue has a single isolated
   cause or apply a superficial fix without verifying contributing elements
   (such as asset-level properties, parent DOM hierarchy, CSS stacking contexts,
   opacity/blend-mode isolation, animation lifecycles, and global styles).
4. Identify any behavior or content that is not covered by the request.
5. Ask the user when a decision would materially affect scope or behavior.

While changing code:

- Keep edits narrowly scoped to the user’s request.
- Preserve unrelated behavior, accessibility, responsive behavior, animations,
  links, and existing user work unless the user asks to change them.
- Inspect every consumer before changing a shared component or shared style.
- Do not add dependencies, external services, analytics, forms, CMS systems,
  or integrations unless the user explicitly requests them.
- Do not change routes, page names, or URL behavior unless that change is
  explicitly requested or the user approves it after being asked.
- Treat supplied assets and their requested placement as exact requirements.
- Preserve unrelated dirty-worktree changes; never reset, discard, or broadly
  reformat user work.

## Content and identity migration

The portfolio is moving from a developer identity to a pianist identity. This
does not authorize a bulk rewrite by itself. For each identity or content
change, use only information supplied or approved by the user. If information
is missing, ask for it or use a clearly marked placeholder; do not guess.

Inherited developer copy, links, credentials, project claims, and personal
assets must not be presented as facts about the new person. Remove or replace
them only when the user requests that scope, and verify references so that
stale identity material is not left behind unintentionally.

## New components and user-supplied changes

When the user provides a component, design, asset, or behavior to add:

- Inspect its compatibility with the current framework and installed versions.
- Confirm where it should live, which route should use it, and what existing
  behavior it is allowed to replace.
- Preserve the component’s required contract, accessibility, responsive
  behavior, and interaction semantics unless the user specifies otherwise.
- Do not wire a supplied component into unrelated pages as an assumption.
- If the supplied material conflicts with the current architecture or is
  incomplete, explain the conflict and ask for the missing decision.

## Validation and reporting

Run the smallest relevant checks after a change, such as formatting, linting,
type/build checks, tests, or a local HTTP smoke test when applicable. Report
what was actually checked and what was not checked.

Source checks and automated tests do not prove visual approval, animation
quality, production behavior, or real-device behavior. Clearly distinguish
those pending checks from verified results. Do not claim Figma parity,
production approval, or mobile-device approval without direct evidence.

In the final handoff, summarize:

- the files changed;
- the behavior or content changed;
- the checks run and their results; and
- any open questions, placeholders, or validation still needed.

## Git and file safety

- Use focused, reviewable edits.
- Do not commit, push, reset, stash, or delete files unless the user explicitly
  asks for that operation.
- Before destructive changes, confirm the exact target and the user’s scope.
- Do not modify generated files or lockfiles unless the requested change
  requires it.
- Do not stage unrelated files.
