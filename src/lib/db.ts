import Dexie, { type Table } from 'dexie'

export interface Wallet {
  id: string
  userId: string
  name: string
  type: 'CASH' | 'BANK' | 'EWALLET'
  balance: number
  currency: string
  createdAt: number
}

export interface Transaction {
  id: string
  userId: string
  walletId: string
  categoryId: string
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  amount: number
  note?: string
  date: number
  createdAt: number
}

export interface Category {
  id: string
  userId: string
  name: string
  icon: string
  type: 'INCOME' | 'EXPENSE'
}

export interface Budget {
  id: string
  userId: string
  categoryId: string
  month: string
  limitAmount: number
  spentAmount: number
}

export interface Bill {
  id: string
  userId: string
  name: string
  amount: number
  dueDay: number
  categoryId: string
  isPaid: boolean
  nextDueDate: number
}

class FinTrackDB extends Dexie {
  wallets!: Table<Wallet>
  transactions!: Table<Transaction>
  categories!: Table<Category>
  budgets!: Table<Budget>
  bills!: Table<Bill>

  constructor() {
    super('FinTrackDB')
    this.version(2).stores({
      wallets: '&id, userId, type',
      transactions: '&id, userId, walletId, categoryId, type, date',
      categories: '&id, userId, type',
      budgets: '&id, userId, categoryId, month',
      bills: '&id, userId, nextDueDate',
    })
  }
}

export const db = new FinTrackDB()
export const LOCAL_USER_ID = 'local-user'
