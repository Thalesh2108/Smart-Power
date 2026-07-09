import fs from "fs";
import path from "path";

export interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export interface LoginLog {
  id: string;
  email: string;
  timestamp: string;
  status: "success" | "failed";
  role: "user" | "admin";
  userAgent: string;
  ip: string;
  error?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const LOGINS_FILE = path.join(DATA_DIR, "logins.json");

// Ensure data directory and files exist
function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
  if (!fs.existsSync(LOGINS_FILE)) {
    fs.writeFileSync(LOGINS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

export async function getUsers(): Promise<UserRecord[]> {
  ensureDb();
  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to read users database", e);
    return [];
  }
}

export async function saveUser(user: Omit<UserRecord, "id" | "createdAt">): Promise<UserRecord> {
  ensureDb();
  const users = await getUsers();
  
  // Prevent duplicate email registrations in local json
  const existing = users.find(u => u.email.toLowerCase() === user.email.toLowerCase());
  if (existing) {
    return existing;
  }

  const newUser: UserRecord = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    fullName: user.fullName,
    email: user.email,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  return newUser;
}

export async function getLoginLogs(): Promise<LoginLog[]> {
  ensureDb();
  try {
    const data = fs.readFileSync(LOGINS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to read login logs database", e);
    return [];
  }
}

export async function addLoginLog(log: Omit<LoginLog, "id" | "timestamp">): Promise<LoginLog> {
  ensureDb();
  const logs = await getLoginLogs();
  
  const newLog: LoginLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...log,
  };

  logs.push(newLog);
  // Keep logs to a reasonable max size (e.g. 500 logs) to avoid huge files
  if (logs.length > 500) {
    logs.shift();
  }
  
  fs.writeFileSync(LOGINS_FILE, JSON.stringify(logs, null, 2), "utf-8");
  return newLog;
}

export async function clearLoginLogs(): Promise<boolean> {
  ensureDb();
  try {
    fs.writeFileSync(LOGINS_FILE, JSON.stringify([], null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("Failed to clear login logs", e);
    return false;
  }
}
