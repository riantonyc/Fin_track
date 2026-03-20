import { db, LOCAL_USER_ID } from './db'

export async function exportUserData() {
  const wallets = await db.wallets.toArray()
  const categories = await db.categories.toArray()
  const transactions = await db.transactions.toArray()
  const budgets = await db.budgets.toArray()
  const bills = await db.bills.toArray()

  const data = {
    wallets,
    categories,
    transactions,
    budgets,
    bills
  }

  return JSON.stringify(data, null, 2)
}

export async function importUserData(jsonString: string) {
  try {
    const data = JSON.parse(jsonString)

    // Deteksi userId dari backup (bisa dari sistem lama maupun baru)
    const oldUserId: string | undefined = data.users?.[0]?.id

    // Fungsi remap: ganti userId lama (jika ada) dengan LOCAL_USER_ID
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const remap = (arr: any[]) =>
      arr.map(item => ({
        ...item,
        userId: (oldUserId && item.userId === oldUserId) ? LOCAL_USER_ID : LOCAL_USER_ID
      }))

    if (data.wallets && Array.isArray(data.wallets)) await db.wallets.bulkPut(remap(data.wallets))
    if (data.categories && Array.isArray(data.categories)) await db.categories.bulkPut(remap(data.categories))
    if (data.transactions && Array.isArray(data.transactions)) await db.transactions.bulkPut(remap(data.transactions))
    if (data.budgets && Array.isArray(data.budgets)) await db.budgets.bulkPut(remap(data.budgets))
    if (data.bills && Array.isArray(data.bills)) await db.bills.bulkPut(remap(data.bills))

    return true
  } catch (err) {
    console.error("Backup Import Error:", err)
    return false
  }
}
