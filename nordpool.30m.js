#!/usr/bin/env /usr/local/bin/node
import nordpool from "nordpool"
import xbar, { separator } from "@sindresorhus/xbar"

const THRESHOLD = 6
const FG_GREEN = "\x1b[32m"
const FG_YELLOW = "\x1b[33m"
const FG_RED = "\x1b[31m"

const prices = new nordpool.Prices()

const getHourlyPrices = async (target) => {
  let targetDate = new Date()
  if (target === "tomorrow") {
    targetDate = new Date().setDate(targetDate.getDate() + 1)
  }

  const rows = (
    await prices.hourly({ area: "FI", currency: "EUR", date: targetDate })
  ).map((item) => {
    const date = new Date(item.date) // automatically in your local timezone
    const hour = date.getHours().toString().padStart(2, "0").concat(":00")
    const day = date.getDay()

    // item.value is the enrgy price in EUR/MWh
    // convert it to snt/kWh and add Finnish VAT of 24 %
    const price = Math.round(item.value * 1.24 * 100) / 1000

    let color = FG_RED
    if (price < THRESHOLD / 2) {
      color = FG_GREEN
    } else if (price < THRESHOLD) {
      color = FG_YELLOW
    }

    return {
      text: `${date.getDate()}/${date.getMonth()} - ${hour}\t\t${color}${price.toFixed(
        2
      )}c | ansi=true`,
    }
  })
  return rows
}

const printHourlyPrices = async () => {
  try {
    const today = await getHourlyPrices()
    const tomorrow = await getHourlyPrices("tomorrow")
    const tomorrowAvailable = tomorrow.length > 0
    xbar([
      {
        text: "ϟ",
        dropdown: false,
      },
      separator,
      ...today,
      {
        text: tomorrowAvailable ? "Tomorrow" : "Tomorrow (n/a)",
        submenu: tomorrowAvailable
          ? tomorrow
          : [{ text: "Data usually available after 15:00" }],
      },
    ])
  } catch (e) {
    xbar([
      {
        text: "ϟ",
        color: "red",
        dropdown: false,
      },
      separator,
      {
        text: `Error: ${e.message}`,
      },
    ])
  }
}

printHourlyPrices()
