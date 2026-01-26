export type ProductBodyRequest = {
  page?: number;
  pageSize?: number;
  name?: string;
  expansion?: number;
  rarity?: string;
};

export type CardInfo = {
  idProduct: number;
  categoryName: string;
  dateAdded: string;
  idCategory: number;
  idExpansion: number;
  idMetacard: number;
  name: string;
};

export type ProductResponse = {
  data: CardInfo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};
