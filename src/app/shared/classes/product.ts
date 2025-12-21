// Products
export interface Product{
    _id: string;
    title: string;
    description: string;
    summary:string;
    details:string;
    type: string;
    brand: string;
    collection: any[];
    slug: string;
    category: string;
    id_category: string;
    subcategory: string;
    price: number;
    sale: boolean;
    nsales:number;
    discount:string;
    discount_start: string;
    discount_end: string;
    stock: number;
    sku: string;// Stock Keeping Unit
    mpn: string; // Manufacturer Part Number
    condition: string; // new, used, refurbished
    availability: string;   // in stock, out of stock
    new: boolean;
    tags: string;
    variants: Variants[];
    images: Images[];
    content: string;
    lis_title: string;
    store: string;
    status: boolean;
    disabled: boolean;
    stars: number;
    views:number;
    t_reviews: number;
    type_inventory: number;
    createdAt:string;
}

export interface Variants {
    color_code: string;
    variant_id: number;
    id: number;
    sku: string;
    size: string;
    sizes: string[];
    color: string;
    image_id: string;
}

export interface Images {
    image_id: string;
    id: string;
    alt: string;
    src: string;
    variant_id: number[];
}