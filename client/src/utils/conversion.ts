import { unitMap } from "@/constants/UnitMaps";

export function numToStr(num: number | undefined) {
  const str = String(num || "");
  return str === "0" ? "" : str;
}

// export function getNumericValue(num: any){
//   if (num)
// }

export function convertUnit(unit: string, customs?: any[]) {
  const unitList = [...unitMap, ...(customs || [])];
  const found = unitList.find((u) => u.key === unit);
  return found ? found.value : unit;
}

export function roundToDecimal(num: number, decimalPlaces: number = 3) {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(num * factor) / factor;
}
