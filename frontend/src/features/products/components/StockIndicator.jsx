const LOW_STOCK = 5;

export function StockIndicator({ stock }) {
  if (stock === 0) {
    return <span className="text-danger">Agotado</span>;
  }
  if (stock === 1) {
    return <span className="text-warn">Última unidad</span>;
  }
  if (stock <= LOW_STOCK) {
    return <span className="text-warn">Últimas {stock} unidades</span>;
  }
  return <span className="text-ok">{stock} disponibles</span>;
}
