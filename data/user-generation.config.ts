export interface UserGenerationConfig {
  count: number;
  maxCount: number;
  startId: number;
}

function readPositiveInteger(name: string, fallback: number): number {
  const rawValue = process.env[name];

  if (rawValue === undefined || rawValue.trim() === '') {
    return fallback;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isSafeInteger(parsedValue) || parsedValue < 1) {
    throw new Error(`${name} must be a positive safe integer. Received: ${rawValue}`);
  }

  return parsedValue;
}

export function getUserGenerationConfig(): UserGenerationConfig {
  const count = readPositiveInteger('USER_COUNT', 20);
  const maxCount = readPositiveInteger('MAX_USER_COUNT', 1000);
  const startId = readPositiveInteger('USER_ID_START', 1);

  if (count > maxCount) {
    throw new Error(`USER_COUNT (${count}) cannot exceed MAX_USER_COUNT (${maxCount}).`);
  }

  const finalId = startId + count - 1;
  if (!Number.isSafeInteger(finalId)) {
    throw new Error('USER_ID_START + USER_COUNT exceeds the JavaScript safe integer range.');
  }

  return { count, maxCount, startId };
}

export function getExpectedUserIds(config = getUserGenerationConfig()): bigint[] {
  return Array.from({ length: config.count }, (_, index) => BigInt(config.startId + index));
}
