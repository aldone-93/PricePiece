export type SinglePrice = {
  timestamp: string;
  avg7: number;
  'low-foil': number | null;
  priceDelta: number;
  idProduct: number;
  'avg1-foil': number | null;
  'avg7-foil': number | null;
  avg30: number;
  'avg30-foil': number | null;
  avg1: number;
  low: number;
  _id: string;
  'trend-foil': number;
  trend: number;
  'avg-foil': number | null;
  idCategory: number;
  avg: number;
  minPriceDelta: number;
  productsInfo: productInfo[];
};

export type productInfo = {
  cardCode: string;
  categoryName: string;
  dateAdded: string;
  idCategory: string;
  idExpansion: string;
  idMetacard: string;
  idProduct: number;
  name: string;
};

export type PriceResponse = {
  data: SinglePrice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export type PricesBodyRequest = {
  page?: number;
  pageSize?: number;
  idProduct?: number;
};
