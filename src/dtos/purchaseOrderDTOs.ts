export interface PurchaseOrderDetailDTO {
  purchase_order_detail_id: string
  purchase_order_id: string
  product_id: string | undefined
  quantity: number
  unit_price: number
  status: string
  created_at: Date
  updated_at: Date
}

export enum OrderItemStatus {
  PENDENTE = 'Pendente',
  ENVIADO = 'Enviado',
  ENTREGUE = 'Entregue',
  CANCELADO = 'Cancelado',
}

export type OrderStatusString =
  | 'Pendente'
  | 'Enviado'
  | 'Entregue'
  | 'Cancelado'

export type OrderItemStatusValues =
  (typeof OrderItemStatus)[keyof typeof OrderItemStatus]

export interface PurchaseOrderDTO {
  purchase_order_id: string
  order_date: Date
  supplier_id: string
  status: OrderStatusString
  purchaseOrderDetails: PurchaseOrderDetailDTO[]
  purchase_value: number
  updated_at: Date
}

export interface PurchaseOrderTableData {
  purchase_order_id: string
  order_date: Date // Formatted date as a string
  supplier_id: string
  status: OrderStatusString
  purchase_value: number
  purchaseOrderDetails: PurchaseOrderDetailDTO[]
  updated_at: Date
}
