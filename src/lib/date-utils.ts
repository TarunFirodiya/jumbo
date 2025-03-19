
import { format, parseISO } from 'date-fns';

export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  
  try {
    // Check if the dateString is in ISO format
    if (dateString.includes('T') || dateString.includes('-')) {
      return format(parseISO(dateString), 'MMM d, yyyy');
    }
    
    // Handle dd-MM-yyyy format
    const [day, month, year] = dateString.split('-').map(Number);
    if (day && month && year) {
      return format(new Date(year, month - 1, day), 'MMM d, yyyy');
    }
    
    // Return original if we can't parse it
    return dateString;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

export const formatDateTime = (dateString: string) => {
  if (!dateString) return '';
  try {
    return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
  } catch (error) {
    console.error('Error formatting date time:', error);
    return dateString;
  }
};

export const formatTime = (timeString: string) => {
  if (!timeString) return '';
  
  // If timeString is already in a format like "09:00 AM - 10:00 AM", return as is
  if (timeString.includes(' - ')) {
    return timeString;
  }
  
  try {
    return format(parseISO(`2000-01-01T${timeString}`), 'h:mm a');
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};
