# Frontend Implementation Guide

## Overview

This guide provides frontend developers with comprehensive documentation on how to implement the Roxy POS transaction system. The system supports three types of transactions with item-level control for returns.

### Transaction Types (tipe_trans)

1. **Swalayan (Type 1)** - Regular retail sales
2. **Resep (Type 2)** - Prescription/medical sales

### Transaction Actions

1. **Regular (1)** - Normal sale (no returns)
2. **Partial Return (2)** - Item-level returns (some items from original transaction)
3. **Total Return (0)** - Return entire transaction

## Key Features

- **Item-level return tracking** - Each item can be marked as returned independently
- **Flexible payment methods** - Cash, credit card, debit card, e-wallet, bank transfer
- **Comprehensive discounts** - Nominal, percentage, and promo discounts at item level
- **Multi-payment support** - Combine multiple payment methods in one transaction
- **Prescription support** - Prescription code tracking and handling
- **Customer & doctor tracking** - Link transactions to customers and doctors
- **Corporate support** - Special pricing and discounts for corporate customers

---

## Transaction Flow Architecture

### Standard Flow

```
┌─────────────────┐
│  Start Sale     │
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│ Add Items                │
│ - Scan barcode/select    │
│ - Enter quantity         │
│ - Apply item discounts   │
│ - Apply promo (optional) │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Calculate Item Totals    │
│ (quantity × price - disc)│
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Apply Transaction Level  │
│ - Discounts              │
│ - Service fees           │
│ - Misc charges           │
│ - Round up               │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Calculate Grand Total    │
│ Sum of items + adjusts   │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Tender Payment           │
│ - Select payment method  │
│ - Enter amount           │
│ - Calculate change       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Submit Transaction       │
│ POST /transaction        │
└────────┬─────────────────┘
```

### Return Flow (Item-Level)

```
┌─────────────────────────────┐
│ Search Original Transaction │
│ GET /transaction (paginated)│
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Select Transaction          │
│ (retrieve full details)     │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Mark Items for Return       │
│ - Toggle isReturned flag    │
│ - Select specific items     │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Create Return Transaction   │
│ - transaction_action: 2     │
│ - Set isReturned for items  │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Calculate Return Totals     │
│ (negative amounts)          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Submit Return Transaction   │
│ POST /transaction           │
└─────────────────────────────┘
```

### Return Flow (Total)

```
┌─────────────────────────────┐
│ Search Original Transaction │
│ GET /transaction (paginated)│
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Select Transaction          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Create Return Transaction   │
│ - transaction_action: 0     │
│ - All items marked returned │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Full Refund                 │
│ POST /transaction           │
└─────────────────────────────┘
```

---

## Database Schema Reference

### THTRANSJ (Transaction Header)

Main transaction record containing header information and totals.

| Field           | Type        | Description                                                      |
| --------------- | ----------- | ---------------------------------------------------------------- |
| `id_htransj`    | varchar(23) | Primary key - unique transaction ID                              |
| `jns_trans`     | char(1)     | Transaction action (0: Total return, 1: Regular, 2: Item return) |
| `no_bon`        | char(15)    | Invoice number                                                   |
| `tipe_trans`    | char(1)     | Transaction type (1: Swalayan, 2: Resep)                         |
| `tgl_ril`       | datetime    | Transaction date/time                                            |
| `shift`         | char(1)     | Shift indicator                                                  |
| `kd_kasir`      | char(8)     | Cashier code                                                     |
| `kd_kassa`      | char(3)     | Register/kassa code                                              |
| `id_cust`       | char(20)    | Customer ID (optional)                                           |
| `nm_cust`       | char(35)    | Customer name                                                    |
| `kd_dokter`     | int         | Doctor ID (optional)                                             |
| `kd_corp`       | char(3)     | Corporate code (optional)                                        |
| `tot_jual`      | numeric     | Subtotal (sum of item prices × qty)                              |
| `tot_hpp`       | numeric     | Total cost of goods                                              |
| `tot_disc`      | numeric     | Total discount amount                                            |
| `tot_promo`     | numeric     | Total promo discount                                             |
| `tot_ru`        | numeric     | Total round-up amount                                            |
| `tot_misc`      | numeric     | Total misc charges                                               |
| `tot_sc`        | numeric     | Total service charges                                            |
| `grand_tot`     | numeric     | Grand total (tot_jual - discounts + adjustments)                 |
| `cash`          | numeric     | Cash payment received                                            |
| `change_cash`   | numeric     | Change for cash                                                  |
| `change_cc`     | numeric     | Change for credit card                                           |
| `change_dc`     | numeric     | Change for debit card                                            |
| `credit_card`   | numeric     | Credit card payment amount                                       |
| `debit_card`    | numeric     | Debit card payment amount                                        |
| `transfer_bank` | numeric     | Bank transfer amount                                             |
| `e_wallet`      | numeric     | E-wallet payment amount                                          |
| `piutang`       | numeric     | Debt/credit amount                                               |
| `no_cc`         | char(16)    | Credit card number                                               |
| `no_dc`         | char(16)    | Debit card number                                                |
| `user_retur`    | char(8)     | User who processed return                                        |
| `ket_retur`     | char(40)    | Return reason/notes                                              |
| `keterangan`    | char(40)    | Additional notes                                                 |
| `racik`         | bool        | Compounded (prescription)                                        |
| `full_resep`    | bool        | Full prescription                                                |
| `tersedia`      | bool        | Stock availability                                               |

### TDTRANSJ (Transaction Detail)

Line items in a transaction.

| Field         | Type        | Description                                     |
| ------------- | ----------- | ----------------------------------------------- |
| `id_htransj`  | varchar(23) | FK to THTRANSJ                                  |
| `detail`      | int         | Line item sequence number (PK)                  |
| `kd_brgdg`    | char(6)     | Product code                                    |
| `nm_brgdg`    | char(40)    | Product name                                    |
| `q_jual`      | numeric     | Quantity sold                                   |
| `hsatj`       | numeric     | Unit price                                      |
| `subtotal`    | numeric     | Quantity × unit price                           |
| `disc`        | numeric     | Discount percentage (0-100)                     |
| `n_disc`      | numeric     | Nominal discount amount                         |
| `misc`        | numeric     | Misc charge per item                            |
| `sc`          | numeric     | Service charge per item                         |
| `jumlah`      | numeric     | Item total (subtotal - discounts + adjustments) |
| `hpp`         | numeric     | Cost of goods for item                          |
| `jns_trans`   | char(1)     | Transaction action                              |
| `r`           | char(2)     | Prescription code (R/, RC, empty)               |
| `no_promo`    | varchar(10) | Promo number                                    |
| `jns_promo`   | varchar(2)  | Promo type                                      |
| `nilai_promo` | numeric     | Promo value                                     |
| `disc_promo`  | numeric     | Promo discount                                  |
| `ru`          | numeric     | Round-up per item                               |
| `up_selling`  | varchar(1)  | Up-selling flag (Y/N)                           |

### TMAINSTOCK (Product Master)

Product information and pricing.

| Field         | Type        | Description                |
| ------------- | ----------- | -------------------------- |
| `kd_brgdg`    | char(6)     | Product code (PK)          |
| `nm_brgdg`    | varchar(40) | Product name               |
| `hj_ecer`     | numeric     | Retail price               |
| `hj_bbs`      | numeric     | Wholesale price            |
| `hb_netto`    | numeric     | Net purchase price         |
| `hb_gross`    | numeric     | Gross purchase price       |
| `het`         | numeric     | HPP (cost)                 |
| `isi`         | int         | Package size               |
| `id_kategori` | varchar(10) | Category ID                |
| `id_pabrik`   | varchar(10) | Manufacturer ID            |
| `barcode`     | varchar(20) | Product barcode            |
| `mark_up`     | numeric     | Markup percentage          |
| `status`      | char(1)     | Product status (1: active) |

### MSTOKBARANG (Stock Details - Alternative)

Detailed stock information by branch/location.

| Field      | Type    | Description        |
| ---------- | ------- | ------------------ |
| `kd_brgdg` | FK      | Product code       |
| `kd_cab`   | FK      | Branch code        |
| `qty`      | numeric | Stock quantity     |
| `status`   | char(1) | Status (1: active) |

---

## Calculation Flow

### Item-Level Calculations

For each item in the transaction:

```
1. Base Amount
   SubTotal = Quantity × Unit Price

2. Item Discounts
   Nominal Discount = NominalDiscount field (fixed amount)
   Percentage Discount = SubTotal × (Discount% / 100)

   DiscountedAmount = SubTotal - Nominal Discount - Percentage Discount

3. Promo Discount
   PromoDiscount = DiscountedAmount × (PromoDiscountRate / 100)
   OR
   PromoDiscount = Fixed Amount (from promo definition)

   AfterPromo = DiscountedAmount - PromoDiscount

4. Service Charge
   ServiceFee = AfterPromo × (ServiceFeeRate / 100)
   OR
   ServiceFee = Fixed Amount

5. Misc Charge
   Misc = Fixed Amount (e.g., bag fee, handling fee)

6. Item Total
   ItemTotal = AfterPromo + ServiceFee + Misc

7. Round Up (per item, optional)
   RoundUp = Amount to round to nearest hundred/thousand

   FinalItemTotal = ItemTotal + RoundUp
```

### Transaction-Level Calculations

After all items are calculated:

```
1. Subtotal (sum of all items)
   SubTotal = SUM(Item SubTotals)

2. Item-Level Discounts Total
   TotalNominalDiscount = SUM(NominalDiscount per item)
   TotalPercentageDiscount = SUM(Percentage Discount per item)

3. Promo Total
   TotalPromo = SUM(Promo Discount per item)

4. Service Fees Total
   TotalServiceFee = SUM(ServiceFee per item)

5. Misc Charges Total
   TotalMisc = SUM(Misc per item)

6. Grand Total
   GrandTotal = SubTotal
              - TotalNominalDiscount
              - TotalPercentageDiscount
              - TotalPromo
              + TotalServiceFee
              + TotalMisc
              + RoundUp (transaction level)
```

### Payment Calculation

```
1. Total Amount Due
   TotalDue = GrandTotal

2. Payment Methods
   TotalPaid = Cash + CreditCard + DebitCard + TransferBank + EWallet - Piutang

3. Change Calculation
   TotalChange = TotalPaid - TotalDue

   Then distribute change by payment method:
   - ChangeCash: change from cash payment
   - ChangeCC: change from credit card payment
   - ChangeDC: change from debit card payment
```

### Return Calculations

For item-level returns (transaction_action: 2):

```
For each item marked as returned (isReturned: true):
   Item amounts become negative

   Example:
   - Original: qty=10, subtotal=100,000, discount=10,000, total=90,000
   - Return qty=5 (half):
     - New qty=-5
     - New subtotal=-50,000
     - New discount=-5,000
     - New total=-45,000
```

For total returns (transaction_action: 0):

```
All items are returned:
   All amounts become negative
   Create "return transaction" with negative values
   Process full refund
```

---

## API Documentation

### Authentication

All endpoints require Bearer token in Authorization header:

```
Authorization: Bearer <token>
```

---

### 1. Create Transaction

**Endpoint:** `POST /transaction`

**Description:** Create a new transaction (sale or return)

**Request Headers:**

```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "device_id": "string (required)",
  "invoice_number": "string (required)",
  "transaction_type": "string (required, 1 or 2)",
  "transaction_action": "string (required, 0=total_return, 1=regular, 2=item_return)",
  "items": [
    {
      "product_code": "string (required)",
      "quantity": "number (required)",
      "transaction_action": "string (required, 1 or 2)",
      "is_returned": "boolean (optional, default: false)",
      "prescription_code": "string (optional, R/ or RC)",
      "sub_total": "number (required)",
      "nominal_discount": "number (optional, default: 0)",
      "discount": "number (optional, 0-100, percentage)",
      "service_fee": "number (optional, default: 0)",
      "misc": "number (optional, default: 0)",
      "disc_promo": "number (optional, default: 0)",
      "value_promo": "number (optional, default: 0)",
      "no_promo": "string (optional)",
      "promo_type": "string (optional)",
      "total": "number (required)",
      "round_up": "number (optional, default: 0)"
    }
  ],
  "sub_total": "number (required)",
  "discount": "number (optional, default: 0)",
  "promo": "number (optional, default: 0)",
  "service_fee": "number (optional, default: 0)",
  "misc": "number (optional, default: 0)",
  "round_up": "number (optional, default: 0)",
  "grand_total": "number (required)",
  "tot_hpp": "number (optional, default: 0)",
  "tot_retju": "number (optional, default: 0)",
  "cash": "number (optional, default: 0)",
  "change_cash": "number (optional, default: 0)",
  "change_cc": "number (optional, default: 0)",
  "change_dc": "number (optional, default: 0)",
  "credit_card": "number (optional, default: 0)",
  "debit_card": "number (optional, default: 0)",
  "piutang": "number (optional, default: 0)",
  "cash_back": "number (optional, default: 0)",
  "customer_id": "number (optional)",
  "doctor_id": "number (optional)",
  "corporate_code": "string (optional)",
  "notes": "string (optional)",
  "retur_reason": "string (optional, required if transaction_action is 0 or 2)",
  "confirmation_retur_by": "string (optional, user who confirmed return)",
  "no_cc": "string (optional)",
  "no_dc": "string (optional)",
  "edc_cc": "string (optional)",
  "edc_dc": "string (optional)",
  "publisher_cc": "string (optional)",
  "publisher_dc": "string (optional)",
  "type_cc": "string (optional)",
  "type_dc": "string (optional)",
  "compunded": "boolean (optional)",
  "full_prescription": "boolean (optional)",
  "availability": "boolean (optional)",
  "need_print_invoice": "boolean (optional)"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "id": "string",
    "invoice_number": "string",
    "customer_id": "string",
    "doctor_id": "number",
    "corporate_code": "string",
    "transaction_type": "string",
    "transaction_action": "string",
    "transaction_date": "string (ISO 8601)",
    "shift": "string",
    "kd_kasir": "string",
    "kd_kassa": "string",
    "sub_total": "number",
    "discount": "number",
    "promo": "number",
    "service_fee": "number",
    "misc": "number",
    "round_up": "number",
    "grand_total": "number",
    "cash": "number",
    "change_cash": "number",
    "change_cc": "number",
    "change_dc": "number",
    "credit_card": "number",
    "debit_card": "number",
    "retur_reason": "string (null if not a return)",
    "confirmation_retur_by": "string (null if not a return)",
    "retur_information": "string (display info about return)",
    "items": [
      {
        "product_code": "string",
        "product_name": "string",
        "price": "number",
        "quantity": "number",
        "transaction_action": "string",
        "sub_total": "number",
        "nominal_discount": "number",
        "discount": "number",
        "service_fee": "number",
        "misc": "number",
        "disc_promo": "number",
        "value_promo": "number",
        "total": "number",
        "round_up": "number"
      }
    ]
  }
}
```

**Validation Rules:**

- `device_id`: Required, non-empty
- `invoice_number`: Required, unique, non-empty
- `transaction_type`: Must be "1" or "2"
- `transaction_action`: Must be "0", "1", or "2"
- `items`: At least 1 item required
- `grand_total`: Must be >= 0
- Payment methods: Must total to grand_total
- Return transaction: Must include `retur_reason` and confirmation_retur_by

**Error Examples:**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "device_id": "field is required",
    "items": "minimum 1 item required"
  }
}
```

---

### 2. Get Transactions (Paginated)

**Endpoint:** `GET /transaction`

**Description:** Retrieve transactions with pagination, filtering, and search

**Query Parameters:**

```
offset: number (required, >= 0, default: 0)
limit: number (required, 1-100, default: 10)
search: string (optional, search by invoice number or customer name)
sort_by: string (optional, values: no_bon or tgl_ril)
sort_order: string (optional, values: asc or desc)
date_gte: string (optional, ISO 8601 date for start range)
date_lte: string (optional, ISO 8601 date for end range)
customer_id: number (optional, filter by customer)
doctor_id: number (optional, filter by doctor)
with_items: boolean (optional, include transaction items in response)
bought_product_code: string (optional, find transactions containing product)
```

**Example Request:**

```
GET /transaction?offset=0&limit=10&search=INV&sort_by=tgl_ril&sort_order=desc&with_items=true
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": {
    "total_count": 150,
    "transactions": [
      {
        "id": "string",
        "invoice_number": "string",
        "customer_id": "string",
        "customer": {
          "kd_cust": "number",
          "nm_cust": "string",
          "usia_cust": "number (optional)",
          "gender": "string (optional)",
          "telp_cust": "string (optional)",
          "al_cust": "string (optional)",
          "status": "boolean (optional)",
          "created_at": "string (ISO 8601, optional)",
          "updated_at": "string (ISO 8601, optional)"
        },
        "doctor_id": "number",
        "doctor": {
          "id": "number",
          "fullname": "string",
          "phone": "string (optional)",
          "address": "string (optional)",
          "fee_consultation": "number (optional)",
          "sip": "string (optional)",
          "url_photo": "string (optional)",
          "email": "string (optional)",
          "created_at": "string (ISO 8601, optional)",
          "updated_at": "string (ISO 8601, optional)"
        },
        "corporate_code": "string",
        "transaction_type": "string",
        "transaction_action": "string",
        "transaction_date": "string",
        "shift": "string",
        "kd_kasir": "string",
        "kd_kassa": "string",
        "sub_total": "number",
        "discount": "number",
        "promo": "number",
        "grand_total": "number",
        "retur_information": "string (null or 'Retur Total' or 'Retur ke ...')",
        "items": [
          {
            "product_code": "string",
            "product_name": "string",
            "price": "number",
            "quantity": "number",
            "transaction_action": "string",
            "sub_total": "number",
            "total": "number"
          }
        ] // only if with_items=true
      }
    ]
  }
}
```

**Typical Use Cases:**

1. **List transactions (need to set date default to current date):**

```
GET /transaction?offset=0&limit=50&date_gte=2024-01-01&date_lte=2024-01-01
```

2. **Find transaction with specific product:**

```
GET /transaction?offset=0&limit=20&bought_product_code=PROD001&with_items=true
```

---

### 3. Get Transaction by Invoice

**Endpoint:** `GET /transaction/invoice`

**Description:** Get single transaction details by invoice number

**Query Parameters:**

```
invoice_number: string (required)
```

**Example Request:**

```
GET /transaction/invoice?invoice_number=INV-2024-00001
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Transaction retrieved successfully",
  "data": {
    "id": "string",
    "invoice_number": "string",
    "customer_id": "string",
    "customer": {
      "kd_cust": "number",
      "nm_cust": "string",
      "usia_cust": "number (optional)",
      "gender": "string (optional)",
      "telp_cust": "string (optional)",
      "al_cust": "string (optional)",
      "status": "boolean (optional)",
      "created_at": "string (ISO 8601, optional)",
      "updated_at": "string (ISO 8601, optional)"
    },
    "doctor_id": "number",
    "doctor": {
      "id": "number",
      "fullname": "string",
      "phone": "string (optional)",
      "address": "string (optional)",
      "fee_consultation": "number (optional)",
      "sip": "string (optional)",
      "url_photo": "string (optional)",
      "email": "string (optional)",
      "created_at": "string (ISO 8601, optional)",
      "updated_at": "string (ISO 8601, optional)"
    },
    "corporate_code": "string",
    "transaction_type": "string",
    "transaction_action": "string",
    "compounded": "boolean",
    "full_prescription": "boolean",
    "availability": "boolean",
    "notes": "string",
    "transaction_date": "string",
    "shift": "string",
    "kd_kasir": "string",
    "kd_kassa": "string",
    "retur_reason": "string",
    "confirmation_retur_by": "string",
    "retur_information": "string",
    "cash": "number",
    "change_cash": "number",
    "change_cc": "number",
    "change_dc": "number",
    "credit_card": "number",
    "debit_card": "number",
    "no_cc": "string",
    "no_dc": "string",
    "edc_cc": "string",
    "edc_dc": "string",
    "publisher_cc": "string",
    "publisher_dc": "string",
    "type_cc": "string",
    "type_dc": "string",
    "sub_total": "number",
    "misc": "number",
    "service_fee": "number",
    "discount": "number",
    "promo": "number",
    "round_up": "number",
    "grand_total": "number",
    "items": [
      {
        "product_code": "string",
        "product_name": "string",
        "price": "number",
        "transaction_action": "string",
        "quantity": "number",
        "prescription_code": "string",
        "sub_total": "number",
        "nominal_discount": "number",
        "discount": "number",
        "service_fee": "number",
        "misc": "number",
        "disc_promo": "number",
        "value_promo": "number",
        "no_promo": "string",
        "promo_type": "string",
        "up_selling": "string",
        "total": "number",
        "round_up": "number"
      }
    ]
  }
}
```

---

### 4. Get Next Invoice Number

**Endpoint:** `GET /transaction/next-invoice`

**Description:** Generate the next invoice number based on transaction type

**Query Parameters:**

```
transaction_type: string (required, "1" or "2")
```

**Example Request:**

```
GET /transaction/next-invoice?transaction_type=1
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Next invoice number retrieved successfully",
  "data": {
    "invoice_number": "string"
  }
}
```

---

### 5. Print Invoice

**Endpoint:** `POST /transaction/{id}/print`

**Description:** Print invoice for a transaction

**Path Parameters:**

```
id: string (transaction ID)
```

**Request Body:**

```json
{
  "device_id": "string (required)"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Invoice printed successfully",
  "data": {
    "id": "string",
    "device_id": "string",
    "printed_at": "string (ISO 8601)"
  }
}
```

---

## Implementation Examples

### Example 1: Regular Sale

```typescript
// Define item
const item = {
  product_code: "PROD001",
  quantity: 2,
  transaction_action: "1", // Regular sale
  sub_total: 100_000, // 50,000 × 2
  nominal_discount: 5_000,
  discount: 0, // 0%
  service_fee: 0,
  misc: 0,
  disc_promo: 0,
  value_promo: 0,
  total: 95_000, // 100,000 - 5,000
  round_up: 0,
};

// Prepare transaction
const request = {
  device_id: "DEVICE001",
  invoice_number: "INV-2024-00001",
  transaction_type: "1", // Swalayan
  transaction_action: "1", // Regular
  items: [item],
  sub_total: 100_000,
  discount: 5_000,
  promo: 0,
  service_fee: 0,
  misc: 0,
  round_up: 0,
  grand_total: 95_000,
  cash: 100_000,
  change_cash: 5_000,
};

// Submit
const response = await fetch("http://localhost:8000/api/transaction", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(request),
});
```

### Example 2: Partial (Item-Level) Return

```typescript
// Step 1: Fetch original transaction
const originalTx = await fetch(
  "http://localhost:8000/api/transaction/invoice?invoice_number=INV-2024-00001",
  { headers: { Authorization: `Bearer ${token}` } }
).then((r) => r.json());

// Step 2: Mark items for return
// User selects items to return (e.g., first item of 2)
const itemsToReturn = originalTx.data.items.map((item, idx) => ({
  ...item,
  is_returned: idx === 0, // Mark first item as returned
  quantity: idx === 0 ? -item.quantity : item.quantity, // Negative qty
  sub_total: idx === 0 ? -item.sub_total : item.sub_total,
  total: idx === 0 ? -item.total : item.total,
  nominal_discount: idx === 0 ? -item.nominal_discount : item.nominal_discount,
}));

// Step 3: Create return transaction
const returnRequest = {
  device_id: "DEVICE001",
  invoice_number: "RET-2024-00001",
  transaction_type: "1",
  transaction_action: "2", // Item return
  items: itemsToReturn,
  sub_total: -50_000, // Negative (half of original)
  discount: -2_500,
  promo: 0,
  service_fee: 0,
  misc: 0,
  round_up: 0,
  grand_total: -47_500, // Negative (refund)
  cash: -50_000, // Refund amount
  change_cash: 0,
  retur_reason: "Customer request",
  confirmation_retur_by: "KASIR001",
};

const returnResponse = await fetch("http://localhost:8000/api/transaction", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(returnRequest),
});
```

### Example 3: Total Return

```typescript
// Step 1: Fetch original transaction
const originalTx = await fetch(
  "http://localhost:8000/api/transaction/invoice?invoice_number=INV-2024-00001",
  { headers: { Authorization: `Bearer ${token}` } }
).then((r) => r.json());

// Step 2: Mark all items as returned
const itemsForReturn = originalTx.data.items.map((item) => ({
  ...item,
  is_returned: true,
  quantity: -item.quantity, // All negative
  sub_total: -item.sub_total,
  total: -item.total,
  nominal_discount: -item.nominal_discount,
}));

// Step 3: Create return transaction
const totalReturnRequest = {
  device_id: "DEVICE001",
  invoice_number: "RET-2024-00002",
  transaction_type: "1",
  transaction_action: "0", // Total return
  items: itemsForReturn,
  sub_total: -100_000, // Negate entire amount
  discount: -5_000,
  promo: 0,
  service_fee: 0,
  misc: 0,
  round_up: 0,
  grand_total: -95_000, // Full refund
  cash: -100_000,
  change_cash: 0,
  retur_reason: "Damaged product",
  confirmation_retur_by: "KASIR001",
};

const returnResponse = await fetch("http://localhost:8000/api/transaction", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(totalReturnRequest),
});
```

### Example 4: Complex Sale with Multiple Discounts

```typescript
// Item with discount stacking
const item = {
  product_code: "OBAT001",
  quantity: 5,
  transaction_action: "1",
  prescription_code: "R/", // Prescription item
  sub_total: 500_000, // 100,000 × 5
  nominal_discount: 10_000, // Voucher
  discount: 10, // 10% additional
  service_fee: 2_000,
  misc: 1_000,
  disc_promo: 35_000, // 10% of (500k - 10k - 50k)
  value_promo: 35_000,
  no_promo: "PROMO001",
  promo_type: "01",
  up_selling: "Y",
  total: 443_000, // 500k - 10k - 50k - 35k + 2k + 1k
  round_up: 0,
};

const request = {
  device_id: "DEVICE001",
  invoice_number: "RES-2024-00001",
  transaction_type: "2", // Resep (prescription)
  transaction_action: "1",
  items: [item],
  sub_total: 500_000,
  discount: 60_000, // 10k + 50k
  promo: 35_000,
  service_fee: 2_000,
  misc: 1_000,
  round_up: 0,
  grand_total: 408_000, // 500k - 60k - 35k + 2k + 1k
  compunded: false,
  full_prescription: true,
  availability: true,
  cash: 410_000,
  change_cash: 2_000,
  customer_id: 123,
  doctor_id: 456,
};

await fetch("http://localhost:8000/api/transaction", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(request),
});
```

---

## Frontend Workflow Implementation

### UI Components Needed

1. **Transaction Editor**

   - Product lookup/scanner
   - Item list with edit/delete
   - Quantity input
   - Discount application
   - Price display

2. **Payment Terminal**

   - Payment method selector
   - Amount input
   - Multiple payment support

3. **Return Manager**

   - Transaction search
   - Item selector (for partial returns)
   - Return reason input
   - Refund calculator

4. **Invoice History**
   - Transaction list with pagination
   - Search and filter
   - Detail viewer
   - Reprint option

### State Management

```typescript
interface TransactionState {
  id: string;
  invoiceNumber: string;
  transactionType: "1" | "2";
  transactionAction: "0" | "1" | "2";

  // Items
  items: TransactionItem[];

  // Totals
  subtotal: number;
  discount: number;
  promo: number;
  serviceFee: number;
  misc: number;
  roundUp: number;
  grandTotal: number;

  // Payment
  cash: number;
  changeCash: number;
  creditCard: number;
  changeCC: number;
  debitCard: number;
  changeDC: number;
  transferBank: number;
  eWallet: number;
  piutang: number;

  // Customer
  customerId?: number;
  doctorId?: number;
  corporateCode?: string;

  // Return info
  returReason?: string;
  confirmationReturBy?: string;
}

interface TransactionItem {
  productCode: string;
  quantity: number;
  transactionAction: "1" | "2";
  isReturned: boolean;
  prescriptionCode?: string;

  // Pricing
  subTotal: number;
  nominalDiscount: number;
  discount: number; // percentage
  serviceFee: number;
  misc: number;
  discPromo: number;
  valuePromo: number;
  noPromo?: string;
  promoType?: string;
  total: number;
  roundUp: number;
}
```

### Calculation Helper Functions

```typescript
function calculateItemTotal(item: CreateTransactionItemDTO): number {
  const afterDiscount =
    item.sub_total -
    item.nominal_discount -
    (item.sub_total * item.discount) / 100;

  const afterPromo = afterDiscount - item.disc_promo;

  const total = afterPromo + item.service_fee + item.misc + item.round_up;

  return total;
}

function calculateGrandTotal(transaction: CreateTransactionRequest): number {
  let total = transaction.sub_total;

  // Apply transaction-level discounts
  total -= transaction.discount;
  total -= transaction.promo;

  // Apply adjustments
  total += transaction.service_fee;
  total += transaction.misc;
  total += transaction.round_up;

  return total;
}

function calculateChange(
  grandTotal: number,
  payments: PaymentMethods
): {
  change: number;
  changeCash: number;
  changeCC: number;
  changeDC: number;
} {
  const totalPaid =
    payments.cash +
    payments.creditCard +
    payments.debitCard +
    payments.transferBank +
    payments.eWallet;

  const change = totalPaid - grandTotal;

  // Distribute change (can be customized per business logic)
  return {
    change,
    changeCash: payments.cash > 0 ? change : 0,
    changeCC: payments.creditCard > 0 ? change : 0,
    changeDC: payments.debitCard > 0 ? change : 0,
  };
}
```

---

## Validation Rules

### Transaction Level

- Invoice number must be unique
- Transaction type must be 1 (Swalayan) or 2 (Resep)
- Transaction action must be 0 (total return), 1 (regular), or 2 (item return)
- Grand total must be >= 0 (or negative for returns)
- Return transactions require `retur_reason` and `confirmation_retur_by`

### Item Level

- Product code must be valid
- Quantity must be > 0
- Prices must be >= 0
- Discount percentage must be 0-100
- For returns: negative quantities should match original items

### Payment Level

- Cash/card amounts must be >= 0
- Total payments must equal (or exceed) grand total
- Card numbers must match format if provided

---

## Error Handling

### Common Error Responses

**Validation Error (400):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "grand_total": "field is required",
    "items": "minimum 1 item required"
  }
}
```

**Authentication Error (401):**

```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "invalid or expired token"
}
```

**Not Found (404):**

```json
{
  "success": false,
  "message": "Transaction not found",
  "error": "invoice_number_not_found"
}
```

**Server Error (500):**

```json
{
  "success": false,
  "message": "Internal server error",
  "error": "database_error"
}
```

---

## Best Practices

1. **Pre-calculate totals on frontend** before sending to server
2. **Validate all inputs** before submission
3. **Handle negative amounts** carefully for returns
4. **Store transaction ID** after creation for reference
5. **Implement optimistic UI updates** while waiting for server response
6. **Validate payment amounts** before submission
7. **Log all transactions** for audit trail

---

## Glossary

- **Swalayan**: Retail/counter sales
- **Resep**: Prescription/medical sales
- **Bon**: Invoice/receipt
- **Hpp**: Cost of goods / standard cost
- **HPP**: Harga Pokok Penjualan (Cost of Goods Sold)
- **Disc**: Discount
- **Promo**: Promotional discount
- **SC**: Service charge
- **Misc**: Miscellaneous charge
- **RU**: Round up
- **Retur**: Return/refund
- **Kasir**: Cashier
- **Kassa**: Register/till
- **Shift**: Work shift
- **Brgdg**: Barang (product)
- **Cust**: Customer
- **Tgl**: Tanggal (date)
- **Cab**: Cabang (branch)
