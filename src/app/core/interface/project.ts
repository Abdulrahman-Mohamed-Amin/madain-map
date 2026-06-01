export interface Project {

  id: number;

  arTitle: string;
  enTitle: string;

  arDescription: string;
  enDescription: string;

  arLocationName: string;
  enLocationName: string;

  arLocationDescription: string;
  enLocationDescription: string;

  arProjectCategory: string;
  enProjectCategory: string;

  latitude: number;
  longitude: number;
  groundArea: string;
  surfaceArea: string;

  buildingCount: number;
  unitsCount: number;

  isSealed: boolean;

  projectStatusId: number;
  projectStatusArName: string;
  projectStatusEnName: string;

  projectTypeId: number;
  projectTypeArName: string;
  projectTypeEnName: string;

  locationUrl: string;

  interfaceImagePath: string;
  videoPath: string;

  proposalFilePath: string;

  projectImages: string[];

  buildings: Building[];

  warranties: Warranty[]; // لو بتبقى فاضية غالبًا
}

export interface Building {
  id: number;

  arTitle: string;
  enTitle: string;

  arDescription: string;
  enDescription: string;

  imagePath: string;

  projectId: number;
  projectArTitle: string;
  projectEnTitle: string;

  units: Unit[];
}

export interface Unit {
  id: number;

  arTitle: string;        // A-1
  enTitle: string;        // 4

  arDescription: string; // شقة
  enDescription: string | null;

  area: string;          // 135
  floor: string;         // 1

  price: number;         // 680000
  isSealed: boolean;     // مباع ولا لا

  imagePath: string;     // /UnitImages/....
}

export interface Warranty {
  id?: number;
  arTitle?: string;
  enTitle?: string;
  arDescription?: string;
  enDescription?: string;
  filePath?: string;
}
