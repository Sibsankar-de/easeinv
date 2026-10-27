export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  DISPATCHED = "DISPATCHED",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
}

export const orderStatusList = Object.values(OrderStatus) as [
  string,
  ...string[],
];
