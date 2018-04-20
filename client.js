const elasticsearch = require('elasticsearch')

elasticsearch.Promise = global.Promise

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  requestTimeout: 1000,
  log: [{
    type: 'stdio',
    levels: ['error', 'warning']
  }],
  keepAlive: true
})

module.exports = client