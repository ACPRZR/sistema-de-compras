
export interface OrderItem {
    id?: string;
    description: string;
    quantity: number;
    unit_price: number;
    unit_measure: string;
    subtotal: number;
}

export interface Supplier {
    id: number;
    name: string;
    ruc: string;
    contact_name?: string;
}

export interface PurchaseOrderForm {
    // Organizational Info
    department: string; // Unidad Negocio
    authorizer_unit: string;
    delivery_location: string;
    project_details: string;

    // Supplier
    supplier_id: number | null;
    supplier_name?: string; // For manual/new suppliers if allowed

    // Order Details
    payment_conditions: string; // 'contado', 'credito'
    priority: 'normal' | 'urgent';

    items: OrderItem[];
}
