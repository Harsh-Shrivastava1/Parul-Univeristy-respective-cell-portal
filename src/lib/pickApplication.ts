import type { Application } from '@/types';

/**
 * Resolve WHICH application a screen is working on.
 *
 * A student can be sent to this department more than once — a second
 * advertisement, a repeat placement — so they legitimately hold several
 * applications. Every screen here used to look one up with
 * `apps.find(a => a.studentId === studentId)`, which returns whichever the API
 * happened to list first. Opening a freshly assigned student therefore showed
 * their OLD application, and the training was started against the wrong one.
 *
 * The application id is what the screens are actually about, so it is carried
 * in the URL and matched exactly here. `studentId` is still checked so a
 * hand-edited id cannot pull up an application belonging to someone else.
 *
 * Where only a student is known (an older link, a dashboard row), fall back to
 * their most recent application rather than the first one the list returns.
 */
export function pickApplication(
  apps: Application[],
  studentId: string | undefined,
  applicationId: string | null | undefined,
): Application | null {
  const mine = apps.filter((a) => a.studentId === studentId);
  if (mine.length === 0) return null;

  if (applicationId) {
    const exact = mine.find((a) => a.applicationId === applicationId);
    if (exact) return exact;
    // Asked for one that is not in this department's list — don't quietly
    // substitute a different application.
    return null;
  }

  return [...mine].sort((a, b) =>
    String(b.assignedDate || '').localeCompare(String(a.assignedDate || '')),
  )[0];
}

/** The `?app=` link for a student's specific application. */
export function applicationHref(studentId: string, applicationId: string, suffix = ''): string {
  return `/students/${studentId}${suffix}?app=${encodeURIComponent(applicationId)}`;
}
