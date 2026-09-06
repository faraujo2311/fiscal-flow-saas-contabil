/**
 * Utilitários de Segurança, Gerador de Senhas Fortes e Validação de Captcha
 */

// Conjuntos de caracteres para geração segura
const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // sem I, O para evitar confusão
const LOWERCASE = 'abcdefghijkmnopqrstuvwxyz'; // sem l para evitar confusão
const NUMBERS = '23456789'; // sem 0, 1 para evitar confusão
const SPECIALS = '@#$%&*!_-+=';

/**
 * Gera uma senha forte e segura com garantia de:
 * - Mínimo 12 caracteres (padrão 14)
 * - Letras maiúsculas
 * - Letras minúsculas
 * - Números
 * - Caracteres especiais
 */
export function generateSecurePassword(length = 14): string {
  const actualLength = Math.max(12, length);

  // Garantir pelo menos 2 de cada categoria
  const picked: string[] = [
    UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)],
    UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)],
    LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)],
    LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)],
    NUMBERS[Math.floor(Math.random() * NUMBERS.length)],
    NUMBERS[Math.floor(Math.random() * NUMBERS.length)],
    SPECIALS[Math.floor(Math.random() * SPECIALS.length)],
    SPECIALS[Math.floor(Math.random() * SPECIALS.length)],
  ];

  // Preencher o restante com todos os conjuntos misturados
  const allChars = UPPERCASE + LOWERCASE + NUMBERS + SPECIALS;
  while (picked.length < actualLength) {
    picked.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Embaralhar a senha (Fisher-Yates)
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }

  return picked.join('');
}

/**
 * Valida os requisitos mínimos de uma senha
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 12) {
    return { valid: false, message: 'A senha deve conter no mínimo 12 caracteres.' };
  }
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[@#$%&*!_\-+=\/?.,;:]/.test(password);

  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    return { 
      valid: false, 
      message: 'A senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais.' 
    };
  }

  return { valid: true };
}

export interface CaptchaChallenge {
  id: string;
  code: string; // ex: "7K9M4"
  displayChars: Array<{ char: string; rotation: number; fontSize: number; color: string }>;
}

/**
 * Gera um desafio de Captcha visual com caracteres distorcidos e cores dinâmicas
 */
export function generateCaptcha(): CaptchaChallenge {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  const colors = ['#1e40af', '#047857', '#b91c1c', '#6d28d9', '#c2410c', '#0f766e', '#1d4ed8'];

  const displayChars = code.split('').map(char => ({
    char,
    rotation: Math.floor(Math.random() * 30) - 15, // rotação entre -15deg e +15deg
    fontSize: Math.floor(Math.random() * 6) + 22, // 22px a 28px
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  return {
    id: 'cap-' + Math.random().toString(36).substring(2, 9),
    code,
    displayChars,
  };
}
