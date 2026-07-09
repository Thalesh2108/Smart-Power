/**
 * Client-side utility functions to interact with the admin API
 */

export async function logLogin(email: string, status: "success" | "failed", role: "user" | "admin" = "user", error?: string) {
  try {
    await fetch("/api/admin/logins", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        status,
        role,
        error,
      }),
    });
  } catch (err) {
    console.error("Failed to log login attempt:", err);
  }
}

export async function registerUserInDb(fullName: string, email: string) {
  try {
    await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName,
        email,
      }),
    });
  } catch (err) {
    console.error("Failed to register user in db:", err);
  }
}
