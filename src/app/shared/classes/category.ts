export interface Category {
    title: string;
    image: string;
    icon: string;
    slug: string;
    expanded: boolean;
    lis_title: [
        { 
        title: string,
        expanded: boolean;
        subcategories?: [
            { 
                title: string,
                idcategory: string,
                lis_title?: string,
                slug: string,
                status: string,
                views: number
            }
        ]
        }
    ];
    status: string;
    views: number;
}