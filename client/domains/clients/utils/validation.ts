export const formatCPF = (text: string) => {
  const digits = text.replace(/\D/g, "");
  let formatted = digits;
  if (digits.length > 3) {
    formatted = `${digits.substring(0, 3)}.${digits.substring(3)}`;
  }
  if (digits.length > 6) {
    formatted = `${formatted.substring(0, 7)}.${digits.substring(6)}`;
  }
  if (digits.length > 9) {
    formatted = `${formatted.substring(0, 11)}-${digits.substring(9, 11)}`;
  }
  return formatted.substring(0, 14);
};

export const formatPhone = (text: string) => {
  const digits = text.replace(/\D/g, "");
  let formatted = digits;
  if (digits.length > 0) {
    formatted = `(${digits}`;
  }
  if (digits.length > 2) {
    formatted = `(${digits.substring(0, 2)}) ${digits.substring(2)}`;
  }
  if (digits.length > 7) {
    formatted = `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7, 11)}`;
  }
  return formatted.substring(0, 15);
};

export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, "");
  
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let checkDigit1 = 11 - (sum % 11);
  if (checkDigit1 >= 10) checkDigit1 = 0;
  if (parseInt(cleanCPF.charAt(9)) !== checkDigit1) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  let checkDigit2 = 11 - (sum % 11);
  if (checkDigit2 >= 10) checkDigit2 = 0;
  if (parseInt(cleanCPF.charAt(10)) !== checkDigit2) return false;
  
  return true;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
