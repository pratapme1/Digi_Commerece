# Retrospective: 007 Architecture And Stack Gate

## What Worked
- Item: the workflow gap was clear once the repo reached the edge of prototype-only implementation
- Item: placing architecture under `product/` kept the structure lean while still adding the missing layer

## What Did Not Work
- Item: the original process wording was broad enough that it allowed stack-sensitive implementation to start without an architecture gate

## Standards To Update
- Standard: if a later milestone depends on framework, backend, infra, security, or deployment choices, the workflow must name those decisions explicitly before implementation starts
- Standard: prototype stack files must never be treated as proof of a production stack decision

## Follow-up Actions
- Action: start the `M1A Architecture And Delivery Baseline` phase before any real M2 application implementation
