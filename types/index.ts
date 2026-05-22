export type UserRole = 'customer' | 'system_admin';

export interface Printer {
  id: string;
  name: string;
  type: 'receipt' | 'kitchen' | 'label';
  ipAddress: string;
  port?: number;
  branchId?: string;
}

export interface Table {
  id: string;
  number: string;
  capacity: number;
  branchId: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'manager' | 'cashier' | 'waiter' | 'chef' | 'other';
  phone?: string;
  branchId?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  isActive: boolean;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  tables: Table[];
  staff: StaffMember[];
  printers: Printer[];
}

export interface Company {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  menus: MenuItem[];
  branches: Branch[];
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  company?: Company;
  resetToken?: string;
  resetTokenExpiry?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterInput {
  // Account
  username: string;
  password: string;
  // Company (required)
  companyName: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  // Branches
  branches?: Omit<Branch, 'id'>[];
  // Menus
  menus?: Omit<MenuItem, 'id'>[];
  // Staff
  staff?: Omit<StaffMember, 'id'>[];
  // Tables
  tables?: Omit<Table, 'id'>[];
  // Printers
  printers?: Omit<Printer, 'id'>[];
}

export interface SessionPayload {
  userId: string;
  username: string;
  role: UserRole;
  companyName?: string;
}
