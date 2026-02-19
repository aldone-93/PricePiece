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
  minEu: number;
  minIta: number;
  minEuDiff: number;
  minItaDiff: number;
  tcg_player_id: number;
  ctrader_id: number;
  cardtrader_url: string;
  minUpdatedAt: string;
  minPrice: number;
  fixedProperty: {
    collector_number: string;
    onepiece_rarity: string;
  };
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
