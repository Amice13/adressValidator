const client = require('./client')

const createData = async (index, id, data) => {
  try {
    var res = await client.index({
      index: index,
      type: index,
      id: id,
      body: data
    })
  } catch(err) {
    console.log(err)
  }
}

const updateData = async (index, id, data) => {
  try {
    var res = await client.update({
      index: index,
      type: index,
      id: id,
      body: { doc: data }
    })
  } catch(err) {
    console.log(err)
  }
}

const getData = async (index, id) => {

  var res 
  try {
    res = await client.get({
      index: index,
      type: index,
      id: id
    })
  } catch(err) {
    res = {found: false}
  }

  if (res.found) {
    return res._source
  } else {
    return res.found
  }
}

module.exports = {
  updateData,
  createData,
  getData
}