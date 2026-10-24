import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

export function getRegistrationStatusBadge(status: string) {
  switch (status) {
    case 'confirmed':
      return { label: 'Confirmed', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    case 'waitlisted':
      return { label: 'Waitlisted', className: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    case 'cancelled':
      return { label: 'Cancelled', className: 'bg-red-500/10 text-red-400 border-red-500/30' };
    default:
      return { label: status, className: 'bg-gray-500/10 text-gray-400 border-gray-500/30' };
  }
}

export function getRegistrationRoleBadge(role: string = 'attendee') {
  switch (role) {
    case 'speaker':
      return { label: 'Speaker', icon: 'mic', className: 'bg-purple-500/15 text-purple-300 border-purple-500/40' };
    case 'sponsor':
      return { label: 'Sponsor', icon: 'sparkles', className: 'bg-amber-500/15 text-amber-300 border-amber-500/40' };
    case 'volunteer':
      return { label: 'Volunteer', icon: 'heart', className: 'bg-teal-500/15 text-teal-300 border-teal-500/40' };
    case 'attendee':
    default:
      return { label: 'Attendee', icon: 'user', className: 'bg-blue-500/15 text-blue-300 border-blue-500/40' };
  }
}

