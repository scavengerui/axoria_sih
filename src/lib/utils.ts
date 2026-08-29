import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isValid } from 'date-fns';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | number | null | undefined): string {
  if (!date) return '';
  const parsedDate = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (!isValid(parsedDate)) return '';
  return format(parsedDate, 'MMM d, yyyy');
}

export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0 || isNaN(minutes)) {
    return '0m';
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

export function generateCertificateId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 8; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AX-${randomPart}`;
}

export function resolveUserRole(userEmail?: string | null, membershipRole?: string | null): string {
  // Primary Chief Admin
  if (userEmail === "sivadhanushkotturu@gmail.com") {
    return "org:admin";
  }

  // Explicit Clerk Org Membership Role
  if (membershipRole === "org:admin" || membershipRole === "admin") {
    return "org:admin";
  }
  if (membershipRole === "org:manager" || membershipRole === "manager") {
    return "org:manager";
  }
  if (membershipRole === "org:trainer" || membershipRole === "trainer") {
    return "org:trainer";
  }

  // Default to Learner for all standard users
  return "org:member";
}
