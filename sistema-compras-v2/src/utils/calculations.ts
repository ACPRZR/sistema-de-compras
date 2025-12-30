


export const calculateItemSubtotal = (quantity: number, unitPrice: number): number => {
    if (quantity < 0 || unitPrice < 0) return 0;
    return Number((quantity * unitPrice).toFixed(2));
};

export const calculateOrderTotal = (items: { subtotal: number }[]): number => {
    return items.reduce((acc, item) => acc + (item.subtotal || 0), 0);
};

export const formatCurrency = (amount: number, currency: string = 'PEN'): string => {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};
