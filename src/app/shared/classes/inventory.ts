export interface Inventory {
    product: string;
    variant_id: string;
    variant: {
        color: string;
        size:string,
    }
    stock: string;
    admin: string;
}