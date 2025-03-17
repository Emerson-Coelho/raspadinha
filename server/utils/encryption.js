import crypto from 'crypto';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Chave de criptografia - deve ser uma string de 32 bytes (256 bits)
// Em produção, isso deve vir de uma variável de ambiente
const ENCRYPTION_KEY_RAW = process.env.ENCRYPTION_KEY || 'a-very-secure-32-byte-encryption-key';

// Garantir que a chave tenha exatamente 32 bytes
const ENCRYPTION_KEY = crypto.createHash('sha256').update(ENCRYPTION_KEY_RAW).digest();

// Vetor de inicialização - deve ser uma string de 16 bytes (128 bits)
const IV_LENGTH = 16;

/**
 * Criptografa uma string
 * @param {string} text - Texto a ser criptografado
 * @returns {string} - Texto criptografado em formato base64
 */
export function encrypt(text) {
  if (!text) return null;
  
  // Gerar um IV aleatório
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Criar cipher com algoritmo aes-256-cbc
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  
  // Criptografar o texto
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  // Retornar IV + texto criptografado em formato base64
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Descriptografa uma string
 * @param {string} encryptedText - Texto criptografado em formato base64
 * @returns {string} - Texto descriptografado
 */
export function decrypt(encryptedText) {
  if (!encryptedText) return null;
  
  try {
    // Separar IV e texto criptografado
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedData = textParts.join(':');
    
    // Criar decipher
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    
    // Descriptografar
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Erro ao descriptografar:', error);
    return null;
  }
} 