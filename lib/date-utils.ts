const uzMonths = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentabr",
  "Oktabr",
  "Noyabr",
  "Dekabr",
]

export function formatDateUz(dateInput: string | number | Date): string {
  const date =
    typeof dateInput === "string" || typeof dateInput === "number"
      ? new Date(dateInput)
      : dateInput

  if (isNaN(date.getTime())) {
    return ""
  }

  const year = date.getFullYear()
  const month = uzMonths[date.getMonth()] || ""
  const day = date.getDate()
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${year}-yil ${day}-${month} ${hours}:${minutes}`
}

