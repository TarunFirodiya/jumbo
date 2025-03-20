
import { format, parseISO, parse } from 'date-fns';

export const formatDate = (dateString: string | Date) => {
  if (!dateString) return '';
  
  try {
    if (dateString instanceof Date) {
      return format(dateString, 'MMM d, yyyy');
    }
    
    // Check if the dateString is in ISO format
    if (dateString.includes('T') || (dateString.includes('-') && dateString.split('-')[0].length === 4)) {
      return format(parseISO(dateString), 'MMM d, yyyy');
    }
    
    // Handle dd-MM-yyyy format
    const [day, month, year] = dateString.split('-').map(Number);
    if (day && month && year) {
      return format(new Date(year, month - 1, day), 'MMM d, yyyy');
    }
    
    // Return original if we can't parse it
    return String(dateString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(dateString);
  }
};

export const formatDateTime = (dateString: string | Date) => {
  if (!dateString) return '';
  try {
    if (dateString instanceof Date) {
      return format(dateString, 'MMM d, yyyy h:mm a');
    }
    return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
  } catch (error) {
    console.error('Error formatting date time:', error);
    return String(dateString);
  }
};

export const formatTime = (timeString: string | Date) => {
  if (!timeString) return '';
  
  // If timeString is already in a format like "09:00 AM - 10:00 AM", return as is
  if (typeof timeString === 'string' && timeString.includes(' - ')) {
    return timeString;
  }
  
  try {
    if (timeString instanceof Date) {
      return format(timeString, 'h:mm a');
    }
    return format(parseISO(`2000-01-01T${timeString}`), 'h:mm a');
  } catch (error) {
    console.error('Error formatting time:', error);
    return String(timeString);
  }
};

// Parse a string date to a Date object
export const parseDateString = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  try {
    // Try to parse ISO format first
    if (dateString.includes('T')) {
      return new Date(dateString);
    }
    
    // Then try dd-MM-yyyy format
    const [day, month, year] = dateString.split('-').map(Number);
    if (day && month && year) {
      return new Date(year, month - 1, day);
    }
    return null;
  } catch (error) {
    console.error('Error parsing date string:', error);
    return null;
  }
};

// Format a Date object for database storage as PostgreSQL date format (YYYY-MM-DD)
export const formatDateForStorage = (date: Date): string => {
  if (!date) return '';
  return format(date, 'yyyy-MM-dd');
};

// Parse a time string to a PostgreSQL time format (HH:MM:SS)
export const parseTimeString = (timeString: string): string => {
  if (!timeString) return '';
  
  // Handle time ranges like "09:00 AM - 10:00 AM" by taking the first part
  const timePart = timeString.split(' - ')[0];
  
  try {
    // Parse time part and format for PostgreSQL
    const timeDate = parse(timePart, 'h:mm a', new Date());
    return format(timeDate, 'HH:mm:ss');
  } catch (error) {
    console.error('Error parsing time string:', error);
    return '';
  }
};
