/**
 * 타임스탬프를 ISO 형식으로 변환
 * @param timestamp timestamp(string)
 * @returns ISO 형식의 타임스탬프
 */
export const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return new Date().toISOString();
    }
    return date.toISOString();
  } catch {
    console.error("Invalid timestamp:", timestamp);
    return new Date().toISOString();
  }
};
