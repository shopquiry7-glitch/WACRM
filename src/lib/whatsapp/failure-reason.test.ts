import { describe, expect, it } from "vitest";
import { formatMessageFailureReason } from "./failure-reason";

describe("formatMessageFailureReason", () => {
  it("returns null for non-failed messages or messages without error_title", () => {
    expect(formatMessageFailureReason({ status: "sent", error_title: "Something" })).toBeNull();
    expect(formatMessageFailureReason({ status: "failed", error_title: null })).toBeNull();
  });

  it("maps 131026 / undeliverable to actionable recipient guidance", () => {
    const res = formatMessageFailureReason({
      status: "failed",
      error_code: 131026,
      error_title: "Message undeliverable",
      error_details: "Message Undeliverable.",
    });
    expect(res).toContain("Undeliverable (131026)");
    expect(res).toContain("not on WhatsApp");
  });

  it("maps 131030 to sandbox allowed list restriction", () => {
    const res = formatMessageFailureReason({
      status: "failed",
      error_code: 131030,
      error_title: "Recipient phone number not in allowed list",
    });
    expect(res).toContain("Sandbox Restriction (131030)");
  });

  it("maps 131047 to 24-hour window re-engagement advice", () => {
    const res = formatMessageFailureReason({
      status: "failed",
      error_code: 131047,
      error_title: "Re-engagement message",
    });
    expect(res).toContain("24-Hour Window Closed (131047)");
  });

  it("maps 131049 to Meta rate limit advice", () => {
    const res = formatMessageFailureReason({
      status: "failed",
      error_code: 131049,
      error_title: "This message was not delivered to maintain healthy ecosystem engagement.",
    });
    expect(res).toContain("Meta Rate Limit (131049)");
  });

  it("deduplicates identical error title and details", () => {
    const res = formatMessageFailureReason({
      status: "failed",
      error_code: 999999,
      error_title: "Service Unavailable",
      error_details: "Service Unavailable.",
    });
    expect(res).toBe("Service Unavailable.");
  });

  it("joins distinct title and details with a dash", () => {
    const res = formatMessageFailureReason({
      status: "failed",
      error_code: 999999,
      error_title: "Custom Title",
      error_details: "Custom Details Here",
    });
    expect(res).toBe("Custom Title — Custom Details Here");
  });
});
