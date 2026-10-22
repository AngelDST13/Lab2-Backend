import { CURRENCY_SYMBOL } from '../../config/env.js';

// Formato de Costa Rica: ₡32 000 (espacio como separador de miles; céntimos solo si existen)
const moneyFormatter = new Intl.NumberFormat('es-CR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
  useGrouping: 'always',
});
const dateFormatter = new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium', timeStyle: 'short' });

export const formatMoney = (amount) => `${CURRENCY_SYMBOL}${moneyFormatter.format(amount)}`;

export const formatDate = (isoDate) => dateFormatter.format(new Date(isoDate));
