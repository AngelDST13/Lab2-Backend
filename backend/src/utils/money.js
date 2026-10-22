// La BD guarda céntimos (enteros); la API habla en colones.
// Así los cálculos nunca acumulan errores de punto flotante: 0.1 + 0.2 !== 0.3, pero 10 + 20 === 30.

export const toCents = (amount) => Math.round(Number(amount) * 100);

export const fromCents = (cents) => cents / 100;

const colonesFormatter = new Intl.NumberFormat('es-CR', { maximumFractionDigits: 2 });

export const formatColones = (cents) => `₡${colonesFormatter.format(fromCents(cents))}`;
