const client = require('./client')

// Налаштування для підказок
var globalSettings = {
  'index': {
    'number_of_shards': 1,
    'analysis': {
      'tokenizer': {
        'autocomplete': {
          'type': 'edge_ngram',
          'min_gram': 2,
          'max_gram': 20,
          'token_chars': [
            'letter',
            'digit'
          ]
        },
        'nGramTokenizer': {
          'type' : 'nGram',
          'min_gram' : 3,
          'max_gram' : 8
        },
        'ukrainianTokenizer': {
          'type': 'simple_pattern',
          'pattern': '[А-ЯЄІЇҐа-яєіїґA-Za-z0-9\']+'
        }
      },
      'analyzer': {
        'shingleAnalyzer': {
          'tokenizer': 'ukrainianTokenizer',
          'filter': ['shingleFilter', 'lowercase']
        }
      },
      'filter': {
        'shingleFilter': {
          'type':'shingle',
          'max_shingle_size': 5,
          'min_shingle_size': 2,
          'output_unigrams': 'true'
        }
      }
    }
  }
}

// Схема Державного реєстру виборців
var drvMapping = {
  'settings': globalSettings,
  'mappings': {
    'drv': {
      'properties': {
        'all': {
          'type': 'text',
          'analyzer': 'ukrainian',
          'fields': {
            'shingle': {
              'type': 'text',
              'analyzer': 'shingleAnalyzer',
              'search_analyzer': 'shingleAnalyzer'
            }
          }
        },
        'parentCode': {'type': 'keyword'},
        'regionCode': {'type': 'keyword'},
        'ATOCode': {'type': 'keyword'},
        'level': {'type': 'keyword'},
        'code': {'type': 'keyword'},
        'streetCode': {'type': 'keyword'},
        'postalCode': {'type': 'keyword', 'copy_to': 'all'},
        'precinctNum': {'type': 'keyword'},
        'districtNum': {'type': 'keyword'},
        'region': {'type': 'keyword', 'copy_to': 'all'},
        'district': {'type': 'keyword', 'copy_to': 'all'},
        'locality': {'type': 'keyword', 'copy_to': 'all'},
        'street': {'type': 'keyword', 'copy_to': 'all'},
        'oldDistrict': {'type': 'keyword', 'copy_to': 'all'},
        'oldLocality': {'type': 'keyword', 'copy_to': 'all'},
        'oldStreet': {'type': 'keyword', 'copy_to': 'all'}
      }
    }
  }
}

client.indices.create({index: 'drv', body: drvMapping},
 (err, res) => {
  if (err) {
    console.log(err)
  } else {
    console.log('Схема для реєстру виборців створена')
  }
})

