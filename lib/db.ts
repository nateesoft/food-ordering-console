import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@/types';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

interface Database {
  users: User[];
}

function readDb(): Database {
  if (!fs.existsSync(DB_PATH)) {
    const initial: Database = { users: [] };
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw) as Database;
}

function writeDb(db: Database): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function getAllUsers(): User[] {
  return readDb().users;
}

export function findUserById(id: string): User | undefined {
  return readDb().users.find((u) => u.id === id);
}

export function findUserByUsername(username: string): User | undefined {
  return readDb().users.find((u) => u.username.toLowerCase() === username.toLowerCase());
}

export function findUserByResetToken(token: string): User | undefined {
  return readDb().users.find((u) => u.resetToken === token);
}

export function createUser(user: User): User {
  const db = readDb();
  db.users.push(user);
  writeDb(db);
  return user;
}

export function updateUser(id: string, updates: Partial<User>): User | undefined {
  const db = readDb();
  const index = db.users.findIndex((u) => u.id === id);
  if (index === -1) return undefined;
  db.users[index] = { ...db.users[index], ...updates, updatedAt: new Date().toISOString() };
  writeDb(db);
  return db.users[index];
}

export function seedSystemAdmin(): void {
  const db = readDb();
  const hasAdmin = db.users.some((u) => u.role === 'system_admin');
  if (!hasAdmin) {
    const admin: User = {
      id: uuidv4(),
      username: 'admin@foodconsole.com',
      password: bcrypt.hashSync('Admin@1234', 10),
      role: 'system_admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.users.push(admin);
    writeDb(db);
  }
}
