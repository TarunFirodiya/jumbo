
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

// Format a Date object for database storage - now returning a proper Date object
export const formatDateForStorage = (date: Date): Date => {
  if (!date) return new Date();
  return date;
};

// Parse a time string to a Date object with only time component
export const parseTimeString = (timeString: string): Date | null => {
  if (!timeString) return null;
  
  // Handle time ranges like "09:00 AM - 10:00 AM" by taking the first part
  const timePart = timeString.split(' - ')[0];
  
  try {
    // Create a base date and set the time
    const baseDate = new Date();
    const [hourMinute, period] = timePart.split(' ');
    const [hour, minute] = hourMinute.split(':').map(Number);
    
    baseDate.setHours(
      period.toLowerCase() === 'pm' && hour !== 12 ? hour + 12 : (period.toLowerCase() === 'am' && hour === 12 ? 0 : hour),
      minute,
      0,
      0
    );
    
    return baseDate;
  } catch (error) {
    console.error('Error parsing time string:', error);
    return null;
  }
};
