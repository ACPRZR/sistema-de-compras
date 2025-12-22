
import { calculateItemSubtotal, calculateOrderTotal, formatCurrency } from '../utils/calculations';

describe('Business Logic: Calculations', () => {
    describe('calculateItemSubtotal', () => {
        test('calculates basic subtotal correctly', () => {
            expect(calculateItemSubtotal(2, 50)).toBe(100);
        });

        test('handles decimals correctly (rounding to 2 digits)', () => {
            expect(calculateItemSubtotal(3, 33.333)).toBe(100.00);
            expect(calculateItemSubtotal(1, 10.556)).toBe(10.56);
        });

        test('returns 0 for negative inputs', () => {
            expect(calculateItemSubtotal(-5, 100)).toBe(0);
            expect(calculateItemSubtotal(5, -100)).toBe(0);
        });
    });

    describe('calculateOrderTotal', () => {
        test('sums positive item subtotals', () => {
            const items = [{ subtotal: 100 }, { subtotal: 50.50 }];
            expect(calculateOrderTotal(items)).toBe(150.50);
        });

        test('ignores invalid/missing subtotals', () => {
            const items = [{ subtotal: 100 }, { subtotal: 0 }];
            expect(calculateOrderTotal(items)).toBe(100);
        });
    });

    describe('formatCurrency', () => {
        test('formats PEN correctly', () => {
            // Note: Intl output depends on locale. "es-PE" usually implies "S/" symbol.
            // We verify it contains the currency code or symbol.
            const result = formatCurrency(1000);
            expect(result).toMatch(/S\/|PEN/);
            expect(result).toMatch(/1,000\.00|1.000,00/);
        });
    });
});
