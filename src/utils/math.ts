export const floorFixed = (number: number, decimalPlace = 2): string => {
  const pow10 = 10 ** decimalPlace;
  return (Math.floor(number * pow10) / pow10).toFixed(decimalPlace);
};