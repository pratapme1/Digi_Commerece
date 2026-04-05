import Link from "next/link";

export default function LandingPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#111111", color: "#F8F6F1" }}>
      <div style={{ display: "grid", gap: 12, maxWidth: 420 }}>
        <div style={{ fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(248,246,241,0.68)" }}>
          Digi attendee
        </div>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1, margin: 0 }}>Open a live space link to enter the attendee experience.</h1>
        <p style={{ color: "rgba(248,246,241,0.76)", lineHeight: 1.6, margin: 0 }}>
          The canonical attendee route is <code>/s/[qrSlug]</code>. For local checks, open the real route directly or launch it from the host app.
        </p>
        <Link href="/s/demo-space?demo=1&spaceType=store&mode=identified&session=live&spaceName=Vega%20Dealer%20Day&brandName=Vega%20Prime" style={{ color: "#F8F6F1", textDecoration: "underline" }}>
          Open a demo room
        </Link>
      </div>
    </main>
  );
}
