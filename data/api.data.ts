export const apiClientId = 'qa-senior-client';

export const expectedBook = {
  isbn: '9781449325862',
  title: 'Git Pocket Guide',
  author: 'Richard E. Silverman',
  available: true,
} as const;

export const validReservation = {
  bookId: expectedBook.isbn,
  userId: 101,
  pickupLocation: 'Nairobi-CBD',
} as const;
