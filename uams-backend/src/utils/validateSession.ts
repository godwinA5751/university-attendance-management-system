export const validateSessionName = (sessionName: string): boolean => {
  const [start, end] = sessionName.replace(/\s/g, "").split("/");

  if (!start || !end) return false;

  const yearPattern = /^\d{4}$/;

  if (!yearPattern.test(start) || !yearPattern.test(end)) {
    return false;
  }

  const startYear = Number(start);
  const endYear = Number(end);

  return endYear === startYear + 1;
};