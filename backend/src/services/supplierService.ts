export interface SupplierInfo {
  supplierName: string;
  supplierUrl: string;
  unitCost: number;
  shippingCost: number;
  supplierRating: number;
  supplierOrderVolume: number;
  shippingDays: number;
}

export async function findBestSupplier(
  country: "US" | "IN",
  productName: string
): Promise<SupplierInfo | null> {
  const mockSuppliers: Record<string, SupplierInfo> = {
    "portable blender": {
      supplierName: "BlendPro Supply",
      supplierUrl: "https://example.com/portable-blender",
      unitCost: 10,
      shippingCost: 4,
      supplierRating: 4.7,
      supplierOrderVolume: 1200,
      shippingDays: 8,
    },
    "led desk lamp": {
      supplierName: "BrightHome Wholesale",
      supplierUrl: "https://example.com/led-desk-lamp",
      unitCost: 12,
      shippingCost: 5,
      supplierRating: 4.5,
      supplierOrderVolume: 800,
      shippingDays: 9,
    },
    "travel organizer": {
      supplierName: "TravelEase Supply",
      supplierUrl: "https://example.com/travel-organizer",
      unitCost: 7,
      shippingCost: 3,
      supplierRating: 4.6,
      supplierOrderVolume: 950,
      shippingDays: 7,
    },
    "mini waffle maker": {
      supplierName: "KitchenTrend Wholesale",
      supplierUrl: "https://example.com/mini-waffle-maker",
      unitCost: 14,
      shippingCost: 6,
      supplierRating: 4.8,
      supplierOrderVolume: 1500,
      shippingDays: 10,
    },
  };

  return mockSuppliers[productName.toLowerCase()] || null;
}