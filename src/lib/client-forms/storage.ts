import type {
  ClientFormSubmission,
  ClientFormsStats,
  FormSubmissionStatus,
} from "@/types/client-forms";

const STORAGE_KEY = "wacrm_client_form_submissions_v2"; // Bump key to v2 to cleanly drop old v1 demo data!

export const SAMPLE_SUBMISSIONS: ClientFormSubmission[] = [];

export function getStoredSubmissions(): ClientFormSubmission[] {
  if (typeof window === "undefined") return [];
  try {
    // Clean out old v1 demo data
    localStorage.removeItem("wacrm_client_form_submissions_v1");

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filter out any lingering mock/seed items
      return parsed.filter(
        (item) => !item.id?.startsWith("sub-seed-") && !item.id?.startsWith("demo-")
      );
    }
    return [];
  } catch (err) {
    console.error("Failed to load submissions from localStorage:", err);
    return [];
  }
}

export function saveAllSubmissions(submissions: ClientFormSubmission[]): void {
  if (typeof window === "undefined") return;
  try {
    const cleanList = submissions.filter(
      (item) => !item.id?.startsWith("sub-seed-") && !item.id?.startsWith("demo-")
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanList));
    window.dispatchEvent(new CustomEvent("wacrm_submissions_updated", { detail: cleanList }));
  } catch (err) {
    console.error("Failed to persist submissions to localStorage:", err);
  }
}

export function saveNewSubmission(submission: ClientFormSubmission): ClientFormSubmission[] {
  const current = getStoredSubmissions();
  // Filter out any duplicate ID
  const updated = [submission, ...current.filter((item) => item.id !== submission.id)];
  saveAllSubmissions(updated);
  return updated;
}

export function updateSubmissionStatus(
  id: string,
  status: FormSubmissionStatus
): ClientFormSubmission[] {
  const current = getStoredSubmissions();
  const updated = current.map((item) =>
    item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item
  );
  saveAllSubmissions(updated);
  return updated;
}

export function updateSubmissionInternalNotes(
  id: string,
  internalNotes: string
): ClientFormSubmission[] {
  const current = getStoredSubmissions();
  const updated = current.map((item) =>
    item.id === id ? { ...item, internalNotes, updatedAt: new Date().toISOString() } : item
  );
  saveAllSubmissions(updated);
  return updated;
}

export function deleteSubmission(id: string): ClientFormSubmission[] {
  const current = getStoredSubmissions();
  const updated = current.filter((item) => item.id !== id);
  saveAllSubmissions(updated);
  return updated;
}

export function clearAllSubmissions(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("wacrm_client_form_submissions_v1");
    window.dispatchEvent(new CustomEvent("wacrm_submissions_updated", { detail: [] }));
  } catch (err) {
    console.error("Failed to clear submissions:", err);
  }
}

export function calculateFormsStats(submissions: ClientFormSubmission[]): ClientFormsStats {
  return submissions.reduce(
    (acc, curr) => {
      acc.total += 1;
      if (curr.status === "new") acc.newCount += 1;
      else if (curr.status === "reviewing") acc.reviewingCount += 1;
      else if (curr.status === "in_progress") acc.inProgressCount += 1;
      else if (curr.status === "completed") acc.completedCount += 1;
      else if (curr.status === "archived") acc.archivedCount += 1;

      acc.totalEstimatedRevenue += curr.totalEstimate || 0;
      return acc;
    },
    {
      total: 0,
      newCount: 0,
      reviewingCount: 0,
      inProgressCount: 0,
      completedCount: 0,
      archivedCount: 0,
      totalEstimatedRevenue: 0,
    }
  );
}

export function generateSubmissionRef(): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `WB-${random}`;
}
