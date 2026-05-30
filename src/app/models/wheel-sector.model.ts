export interface WheelSectorInput {
  name: string;
  bgColor: string;
  textColor: string;
  id: string;
}

export interface WheelCanvasSector {
  color: string;
  label: string;
  check: boolean;
  id: string;
}

export interface SpinTargetResolution {
  valid: boolean;
  targetId?: string;
  error?: string;
}

export const DEFAULT_WHEEL_COLORS: readonly string[] = [
  '#9B59FB',
  '#20D087',
  '#2DFCD2',
  '#F39C12',
  '#E74C3C',
  '#3498DB',
  '#1ABC9C',
  '#E67E22',
  '#8E44AD',
  '#2ECC71',
];

export const DEMO_SECTOR_COUNT = 6;

export function createDemoSectors(count: number = DEMO_SECTOR_COUNT): WheelSectorInput[] {
  return Array.from({ length: count }, (_, index) => ({
    name: `Sector ${index + 1}`,
    bgColor: DEFAULT_WHEEL_COLORS[index % DEFAULT_WHEEL_COLORS.length],
    textColor: '#ffffff',
    id: String(index + 1),
  }));
}

export function createGeneratedSectors(count: number): WheelSectorInput[] {
  return Array.from({ length: count }, (_, index) => ({
    name: `Sector ${index + 1}`,
    bgColor: DEFAULT_WHEEL_COLORS[index % DEFAULT_WHEEL_COLORS.length],
    textColor: '#ffffff',
    id: String(index + 1),
  }));
}

export function mapInputToCanvasSector(input: WheelSectorInput): WheelCanvasSector {
  return {
    color: input.bgColor,
    label: input.name,
    check: true,
    id: input.id,
  };
}

export function resolveSpinTarget(
  selection: string,
  sectors: WheelCanvasSector[]
): SpinTargetResolution {
  const trimmed = selection.trim();

  if (!trimmed) {
    return { valid: false, error: 'Please enter a sector number or sector ID.' };
  }

  const asNumber = Number(trimmed);
  if (!Number.isNaN(asNumber) && Number.isInteger(asNumber)) {
    if (asNumber <= 0) {
      return { valid: false, error: 'Sector number must be greater than 0.' };
    }

    if (asNumber > sectors.length) {
      return {
        valid: false,
        error: `Sector ${asNumber} does not exist. The wheel has ${sectors.length} sectors.`,
      };
    }

    return { valid: true, targetId: sectors[asNumber - 1].id };
  }

  const sectorExists = sectors.some((sector) => String(sector.id) === trimmed);
  if (!sectorExists) {
    return { valid: false, error: `Sector ID "${trimmed}" does not exist.` };
  }

  return { valid: true, targetId: trimmed };
}

export function isValidSectorCount(value: unknown): value is number {
  const count = Number(value);
  return Number.isInteger(count) && count > 0;
}
