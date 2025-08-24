export function formatBRL(value: number) {
  const finalValue = parseFloat((value / 100).toFixed(2));
  try {
    const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalValue ?? 0);
    return formatted.replace('\u00A0', ' ');
  } catch {
    return `R$ ${Number(finalValue ?? 0).toFixed(2).replace('.', ',')}`;
  }
}