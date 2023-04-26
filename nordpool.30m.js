#!/usr/bin/env /usr/local/bin/node

/*
  <xbar.title>Nordpool energy prices</xbar.title>
  <xbar.version>v1.0</xbar.version>
  <xbar.author>Dean Clatworthy</xbar.author>
  <xbar.author.github>deanc</xbar.author.github>
  <xbar.desc>Retrieves the days nordpool energy prices and tomorrow where possible</xbar.desc>
  <xbar.image>https://github.com/deanc/xbar-nordpool/raw/main/screenshot_1.png</xbar.image>
  <xbar.dependencies>node</xbar.dependencies>
  <xbar.abouturl>https://github.com/deanc/xbar-nordpool</xbar.abouturl>

  <xbar.var>number(VAR_THRESHOLD=6): Threshold for what is considered cheap.</xbar.var>
  <xbar.var>string(VAR_COUNTRY=FI): Country to lookup [FI,SE,NO]</xbar.var>
*/

import nordpool from "nordpool"
import xbar, { separator } from "@sindresorhus/xbar"

// config
const THRESHOLD = parseInt(process.env.VAR_THRESHOLD) ?? 6
const COUNTRY = process.env.VAR_COUNTRY ?? "FI"

const FG_GREEN = "\x1b[32m"
const FG_YELLOW = "\x1b[33m"
const FG_RED = "\x1b[31m"

const COUNTRIES = {
  FI: {
    currency: "EUR",
  },
  SE: {
    currency: "SEK",
  },
  NO: {
    currency: "NOK",
  },
  DK: {
    currency: "DKK",
  },
}

const prices = new nordpool.Prices()

const AFTER_APRIL_30_2023 = Date.now() > new Date("April 30, 2023 23:59:59")
const VAT_RATE = AFTER_APRIL_30_2023 ? 1.24 : 1.1 // will be 1.24 later on
const calculatePrice = (price) => Math.round(price * VAT_RATE * 100) / 1000

const mapToXbarRow = (item) => {
  const date = new Date(item.date) // automatically in your local timezone
  const hour = date.getHours().toString().padStart(2, "0").concat(":00")
  const day = date.getDay()

  // item.value is the enrgy price in EUR/MWh
  // convert it to snt/kWh and add Finnish VAT of 24 %
  const price = calculatePrice(item.value)

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
}

const calculateAvgPrice = (prices) => {
  const total = prices.reduce((acc, curr) => {
    return acc + calculatePrice(curr.value)
  }, 0)
  const avg = total / prices.length
  return Math.round(avg * 100) / 100
}

const getHourlyPrices = async (target) => {
  let targetDate = new Date()
  if (target === "tomorrow") {
    targetDate = new Date().setDate(targetDate.getDate() + 1)
  }

  const hourlyPrices = await prices.hourly({
    area: COUNTRY,
    currency: COUNTRIES[COUNTRY.toLocaleUpperCase()],
    date: targetDate,
  })

  const rows = hourlyPrices.map(mapToXbarRow)
  const avg = calculateAvgPrice(hourlyPrices)
  return { rows, avg }
}

const printHourlyPrices = async () => {
  try {
    const { rows: todayRows, avg: todayAvg } = await getHourlyPrices()
    const { rows: tomorrowRows, avg: tomorrowAvg } = await getHourlyPrices(
      "tomorrow"
    )
    const tomorrowAvailable = tomorrowRows.length > 0
    xbar([
      {
        text: `ϟ ${todayAvg}c`,
        dropdown: false,
      },
      separator,
      ...todayRows,
      {
        text: tomorrowAvailable
          ? `Tomorrow (${tomorrowAvg}c)`
          : "Tomorrow (n/a)",
        submenu: tomorrowAvailable
          ? tomorrowRows
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
