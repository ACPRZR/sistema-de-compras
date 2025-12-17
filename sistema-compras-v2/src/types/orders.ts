
// Enums matching DB
export type PurchaseType = 'CAPEX' | 'OPEX' | 'REPOSICION' | 'URGENCIA';
export type Currency = 'USD' | 'PEN' | 'EUR';
export type PaymentCondition = '30_DIAS' | '60_DIAS' | 'CONTADO';
export type Department = 'LOGISTICA' | 'MANTENIMIENTO' | 'CONTABILIDAD' | 'OFICINA_NACIONAL' | 'COMUNICACIONES_SISTEMAS';
export type UnitMeasure = 'UND' | 'CAJA' | 'KG' | 'LT' | 'MTR' | 'GLN' | 'JGO';
export type Incoterm = 'FOB' | 'CIF' | 'DDP' | 'EXW';

export interface OrderItem {
    id?: string;
    product_id?: number; // FK to Master
    description: string;
    quantity: number;
    unit_price: number;
    unit_measure: UnitMeasure;
    subtotal: number;
    cost_center_id?: number;
}

export interface Supplier {
    id: number;
    name: string;
    ruc: string;
    contact_name?: string;
}

export interface PurchaseOrderForm {
    // Header
    department: Department;
    required_date: string; // YYYY-MM-DD
    purchase_type: PurchaseType;
    priority: 'normal' | 'urgent';

    // Commercial
    currency: Currency;
    payment_conditions: PaymentCondition;

    // Vendor
    supplier_id: number | null;
    supplier_name?: string;

    // Logistics
    project_details: string; // Keep for now or map to cost center
    delivery_location_id?: number; // FK
    incoterm?: Incoterm;

    // Items
    items: OrderItem[];
    attachments?: File[];
}

export interface Attachment {
    id: number;
    order_id: number;
    file_name: string;
    file_url: string;
    created_at: string;
}

export interface Order {
    id: number;
    order_number: string;
    created_at: string;

    // New BI Fields
    required_date?: string;
    purchase_type?: PurchaseType;
    currency?: Currency;
    payment_condition?: PaymentCondition;

    status: string;
    total_amount: number;
    department: Department | string; // Allow string for legacy data

    profiles?: { full_name: string; email: string };
    suppliers?: { name: string };
    order_items?: OrderItem[];
    order_attachments?: Attachment[];
}
