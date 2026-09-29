export type VesselType = 'Bulk Carrier' | 'Container' | 'Tanker' | 'General Cargo' | 'Ro-Ro';

export const VESSEL_TYPES: VesselType[] = ['Bulk Carrier', 'Container', 'Tanker', 'General Cargo', 'Ro-Ro'];

export interface Vessel {
  vesselId: number;
  vesselName: string;
  imoNumber: string;
  vesselType: VesselType;
  flagCountry: string;
  grossTonnage: number;
  yearBuilt: number;
  isActive: boolean;
}

export type VesselPayload = Omit<Vessel, 'vesselId' | 'isActive'>;
