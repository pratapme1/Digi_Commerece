# Retrospective: 010 M2 Host App Core Setup And Go Live

## What Worked
- Item: locking the architecture gate before implementation prevented stack drift once real app code and schema work started
- Item: shared TypeScript packages kept the host flow, QR behavior, and session-window rules out of individual screen components
- Item: exported web builds plus Playwright gave a practical end-to-end verification path for the Expo app without needing emulator automation

## What Did Not Work
- Item: direct database connection setup was fragile until the working Supabase pooler connection path was confirmed
- Item: real OTP delivery could not be used as the primary local verification path, so a demo-mode fallback was necessary for repeatable testing

## Standards To Update
- Standard: prefer narrow authenticated public RPCs over direct custom-schema client access for Supabase-backed mobile clients
- Standard: when emulator automation is unavailable, add an exported web verification path before claiming end-to-end coverage for an Expo flow

## Follow-up Actions
- Action: promote the Supabase RPC and exported-web verification lesson into `autonomous-sdlc/lessons.md`
- Action: use the new host-core tables and contracts as the baseline for `M3` live-control discovery and planning
