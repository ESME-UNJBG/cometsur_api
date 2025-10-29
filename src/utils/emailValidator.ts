// utils/emailValidator.ts
export const isTemporaryEmail = (email: string): boolean => {
  const tempDomains = [
    "tempmail.com",
    "mailinator.com",
    "10minutemail.com",
    "yopmail.com",
    "guerrillamail.com",
    "getnada.com",
    "trashmail.com",
  ];

  const domain = email.split("@")[1]?.toLowerCase();
  return tempDomains.some((temp) => domain.endsWith(temp));
};
