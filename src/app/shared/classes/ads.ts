export interface Ads {
    _id: string;
    name: string;
    title: string;
    subTitle: string;
    category: string;
    image: string;
    button: string;
    url: string;
    description: string;
    status: boolean;
    start_date: Date;
    end_date: Date;
    createdAt: Date;
    updatedAt: Date;
}