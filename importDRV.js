const elastic = require('./commonMethods')
const csv = require('fast-csv')
const fs = require('fs')

var stream = fs.createReadStream('addressClean.csv')
const index = 'drv'

var i = 0
var reader = csv.fromStream(stream, {headers: true, delimiter: ','}).on('data', async (record) => {
  try {
    i++
    console.log(i)
    reader.pause()
    var data = record

    var found = await elastic.getData(index, data.streetCode)
    if (found) {
      await elastic.updateData(index, data.streetCode, data)
    } else {
      await elastic.createData(index, data.streetCode, data)
    }
    setTimeout(function(){ reader.resume(); }, 5)
  } catch(err) {
    console.log(err)
  }
})
