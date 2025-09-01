// Brazilian mask and validation utilities

export function maskCep(value: string): string {
  const numericValue = value.replace(/\D/g, '');
  if (numericValue.length <= 5) {
    return numericValue;
  }
  return `${numericValue.slice(0, 5)}-${numericValue.slice(5, 8)}`;
}

export function maskPhone(value: string): string {
  const numericValue = value.replace(/\D/g, '');
  if (numericValue.length <= 2) {
    return numericValue;
  }
  if (numericValue.length <= 7) {
    return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2)}`;
  }
  if (numericValue.length <= 11) {
    return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2, 7)}-${numericValue.slice(7)}`;
  }
  return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2, 7)}-${numericValue.slice(7, 11)}`;
}

export function maskCpf(value: string): string {
  const numericValue = value.replace(/\D/g, '');
  if (numericValue.length <= 3) {
    return numericValue;
  }
  if (numericValue.length <= 6) {
    return `${numericValue.slice(0, 3)}.${numericValue.slice(3)}`;
  }
  if (numericValue.length <= 9) {
    return `${numericValue.slice(0, 3)}.${numericValue.slice(3, 6)}.${numericValue.slice(6)}`;
  }
  return `${numericValue.slice(0, 3)}.${numericValue.slice(3, 6)}.${numericValue.slice(6, 9)}-${numericValue.slice(9, 11)}`;
}

export function validateCpf(cpf: string): boolean {
  // Remove non-numeric characters
  const numericCpf = cpf.replace(/\D/g, '');
  
  // Check if has 11 digits and is not a sequence of same numbers
  if (numericCpf.length !== 11 || /^(\d)\1+$/.test(numericCpf)) {
    return false;
  }

  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numericCpf.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  let firstCheckDigit = remainder >= 10 ? 0 : remainder;

  if (firstCheckDigit !== parseInt(numericCpf.charAt(9))) {
    return false;
  }

  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numericCpf.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  let secondCheckDigit = remainder >= 10 ? 0 : remainder;

  return secondCheckDigit === parseInt(numericCpf.charAt(10));
}

export function unmaskValue(value: string): string {
  return value.replace(/\D/g, '');
}

// Auto-complete address via ViaCEP API
export async function fetchAddressByCep(cep: string): Promise<{
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
} | null> {
  const numericCep = unmaskValue(cep);
  
  if (numericCep.length !== 8) {
    return null;
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${numericCep}/json/`);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.erro) {
      return null;
    }

    return {
      logradouro: data.logradouro,
      bairro: data.bairro,
      localidade: data.localidade,
      uf: data.uf
    };
  } catch (error) {
    console.error('Error fetching CEP:', error);
    return null;
  }
}