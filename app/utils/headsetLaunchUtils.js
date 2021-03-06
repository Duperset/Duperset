
const pg = require('pg')
const client = new pg.Client('postgres://localhost/headSetLaunch')

client.connect()
let counter = 1
export function seedHeadsetData() {
  const continuousSeed = window.setInterval(function() {
    if (Math.random() < 0.25) seedTweetsOnce()
    if (Math.random() < 0.25) seedInventoryOnce()
    if (Math.random() < 0.25) seedSegmentsOnce()
    if (++counter % 5 === 0) seedSalesOnce()
  }, 200)
  window.setTimeout(() => window.clearInterval(continuousSeed), 40*1000)
}

/* ***********TWEETS********************* */

function seedTweetsOnce() {
  const query = generateRandomTweetDataRow()
  client.query(query, function(err, data) {
    if (err)console.log(err)
    else {
      console.log('tweets updated')
    }
  })
}

const words = {'powerful': 2, 'new': 2, 'dope': 2, 'high-tech': 2, 'fun': 2, 'great': 2, 'cool': 2, 'expensive': 2, 'cost': 2}

function generateRandomTweetDataRow() {
  const randomWordIndex = Math.floor(Math.random()*9)
  const word = Object.keys(words)[randomWordIndex]
  const previousOccurrences = words[word]
  const newOccurrences = previousOccurrences+(9-randomWordIndex)
  words[word] = newOccurrences
  return `UPDATE "tweets" SET "occurrences" = ${newOccurrences} WHERE word = '${word}'`
}

/* ***********SEGMENTS********************* */

function seedSegmentsOnce() {
  const query = generateRandomSegmentDataRow()
  client.query(query, function(err, data) {
    if (err)console.log(err)
    else {
      console.log('segments updated')
    }
  })
}

const segments = ['Gaming', 'Educ', 'Govt', 'Business', 'Other']

function generateRandomSegmentDataRow() {
  const randomSegmentIndex = Math.floor(Math.random()*5)
  const segment = segments[randomSegmentIndex]
  const change = 0.90 + Math.random() * 0.20
  return `UPDATE "segments" SET "sales" = sales * ${change} WHERE segment = '${segment}'`
}

/* ***********SALES********************* */

function seedSalesOnce() {
  const query = generateRandomSaleDataRow()
  client.query(query, function(err, data) {
    if (err)console.log(err)
    else {
      console.log('Sales updated')
    }
  })
}

let Months = ['May', 'June', 'July', 'August']

let prevSale= {month: 'May', monthIndex: 0, date: 17, amount: 38205}

function generateRandomSaleDataRow() {
  let newDate = ++prevSale.date
  let newSaleAmount = 0.9 * prevSale.amount + (Math.random() * 0.30) * prevSale.amount
  if (newDate > 31 || (prevSale.month === 'June' && newDate === 31)) {
    newDate = 1
    prevSale.date = 1
    prevSale.month = Months[++prevSale.monthIndex]
  }
  const completeDate = prevSale.month + ' ' + newDate+ ', 2017'
  prevSale.amount = newSaleAmount
  return `INSERT INTO "sales" (date, sales) VALUES ('${completeDate}',${newSaleAmount})`
}


/* ***********INVENTORY********************* */



function seedInventoryOnce() {
  const query = generateReduceInventory()
  client.query(query, function(err, data) {
    if (err)console.log(err)
    else {
      console.log('inventory reduced')
    }
  })
}

const invObj = {'1': 416, '2': 604, '3': 569, '4': 393}
function generateReduceInventory() {
  let amt = 0
  const amount = `${(Math.round(Math.random()*5))}`
  const amountBig = 3 * amount
  let id = `${Math.floor(Math.random()*4)+ 1}`
  if (id === '1' || id === '3') amt = amountBig
  else if (id === '4') amt = amount
  else amt = amount / 2
  const updateAmt = invObj[id] - amt
  invObj[id] = updateAmt
  // console.log('amount amt, updateAmt, invObj.id, id', amount, amt, updateAmt, invObj, +id)
  id = +id
  return `UPDATE "inventory" SET inventory = ${updateAmt} WHERE id = ${id}`
}
