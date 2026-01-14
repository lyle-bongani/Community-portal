// SMS Service - Currently Disabled
// SMS functionality has been temporarily disabled
// Email notifications are working and sufficient for now

export interface SMSOptions {
  to: string; // Phone number
  message: string;
}

export const sendSMS = async (_options: SMSOptions): Promise<boolean> => {
  // SMS is currently disabled
  console.log('📱 SMS is currently disabled. Email notifications are active.');
  return false;
};

export const sendEventRegistrationSMS = async (
  _phoneNumber: string,
  _userName: string,
  _eventTitle: string,
  _eventDate: string,
  _eventLocation: string
): Promise<boolean> => {
  // SMS is currently disabled
  console.log('📱 SMS notifications are currently disabled.');
  return false;
};
