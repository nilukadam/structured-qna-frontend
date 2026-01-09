// Basic profile helpers used across the app

export function isProfileComplete(user) {
  if (!user) return false;
  const nameOk = !!String(user.name || "").trim();
  const avatarOk = !!String(user.avatar || "").trim();
  return nameOk && avatarOk;
}

export function shouldShowProfileNudge() {
  try {
    const until = localStorage.getItem("qc:nudge:suppressUntil");
    if (!until) return true;
    return Date.now() > Number(until);
  } catch (err) {
    void err;
    return true;
  }
}

export function snoozeProfileNudge(days = 7) {
  try {
    const ms = days * 24 * 60 * 60 * 1000;
    localStorage.setItem(
      "qc:nudge:suppressUntil",
      String(Date.now() + ms)
    );
  } catch (err) {
    void err;
  }
}
