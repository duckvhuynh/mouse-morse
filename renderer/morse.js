// Full international Morse code map
const MORSE_MAP = {
  '.-':    'A', '-...':  'B', '-.-.':  'C', '-..':   'D',
  '.':     'E', '..-.':  'F', '--.':   'G', '....':  'H',
  '..':    'I', '.---':  'J', '-.-':   'K', '.-..':  'L',
  '--':    'M', '-.':    'N', '---':   'O', '.--.':  'P',
  '--.-':  'Q', '.-.':   'R', '...':   'S', '-':     'T',
  '..-':   'U', '...-':  'V', '.--':   'W', '-..-':  'X',
  '-.--':  'Y', '--..':  'Z',
  '-----': '0', '.----': '1', '..---': '2', '...--': '3',
  '....-': '4', '.....': '5', '-....': '6', '--...': '7',
  '---..': '8', '----.': '9',
  '.-.-.-': '.', '--..--': ',', '..--..': '?', '.----.': '\'',
  '-.-.--': '!', '-..-.':  '/', '-.--.':  '(', '-.--.-': ')',
  '.-...':  '&', '---...': ':', '-.-.-.': ';', '-...-':  '=',
  '.-.-.':  '+', '-....-': '-', '..--.-': '_', '.-..-.': '"',
  '...-..-': '$', '.--.-.': '@', '...---...': 'SOS',
};

// Reverse map: character -> morse
const CHAR_TO_MORSE = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([k, v]) => [v, k])
);

/**
 * Decode a single Morse code token (e.g. ".-") to a character.
 * Returns '?' for unknown codes.
 */
function decodeMorseToken(token) {
  if (!token || token.trim() === '') return '';
  return MORSE_MAP[token.trim()] || '?';
}

/**
 * Decode a full Morse string where letters are separated by spaces
 * and words are separated by ' / '.
 * e.g. "-- --- .-. ... . / -- --- ..- ... ."
 */
function decodeMorse(morseString) {
  if (!morseString.trim()) return '';
  return morseString
    .split(' / ')
    .map(word =>
      word
        .split(' ')
        .filter(t => t.length > 0)
        .map(decodeMorseToken)
        .join('')
    )
    .join(' ');
}

/**
 * Encode a plain text string to Morse.
 */
function encodeText(text) {
  return text
    .toUpperCase()
    .split(' ')
    .map(word =>
      word
        .split('')
        .map(ch => CHAR_TO_MORSE[ch] || '')
        .filter(m => m.length > 0)
        .join(' ')
    )
    .join(' / ');
}

export { MORSE_MAP, decodeMorseToken, decodeMorse, encodeText };
