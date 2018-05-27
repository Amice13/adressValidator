const client = require('./client')
const levenshtein = require('fast-levenshtein')

module.exports.validate = async (address) => {

  try {

    if (!address.fullAddress) address.fullAddress = ''
    if (!address.source) address.source = ''

    var queryAddress = {
      'query': {
        'bool': {
          'must': {
            'simple_query_string': {
              'fields': ['all'],
              'query': address.fullAddress,
              'default_operator': 'or'
            }
          }
        }
      }
    }

    var queryAddressWithShingles = {
      'query': {
        'bool': {
          'must': {
            'simple_query_string': {
              'fields': ['all.shingle'],
              'query': address.fullAddress,
              'default_operator': 'or'
            }
          }
        }
      }
    }

    var querySource = {
      'query': {
        'bool': {
          'must': {
            'simple_query_string': {
              'fields': ['all'],
              'query': address.fullAddress,
              'default_operator': 'or'
            }
          }
        }
      }
    }

    var should = []

    if (address.postalCode) should.push({'match': {'postalCode': address.postalCode }})
    if (address.region) should.push({'match': {'region': address.region }})

    if (should.length) {
      queryAddress.query.bool.should = should
      queryAddressWithShingles.query.bool.should = should
      querySource.query.bool.should = should
    }

    var queryBody = [
      { index: 'drv', type: 'drv' },
      queryAddress,
      { index: 'drv', type: 'drv' },
      queryAddressWithShingles,
      { index: 'drv', type: 'drv' },
      querySource
    ]

    var result = await client.msearch({ queryBody })

    var newAddress = {}
    var max_score = 0
    for (i in result.responses) {
      if (result.responses[i].hits.max_score && result.responses[i].hits.max_score >= max_score) {
        newAddress = result.responses[i].hits.hits[0]._source
      }
    }

    if (Object.keys(newAddress)) {

      address.fullAddress = ''

      if (newAddress.postalCode) {
        address.postalCode = newAddress.postalCode
        address.fullAddress+= address.postalCode
      }

      if (newAddress.region) {
        address.region = newAddress.region
        if (newAddress.region !== 'місто Київ' && newAddress.region !=='місто Севастополь') address.fullAddress+= ', ' + address.region
      }
      if (newAddress.district) {
        address.district = newAddress.district
        address.fullAddress+= ', ' + address.district
      }
      if (address.locality && newAddress.locality) {
        if (levenshtein.get(newAddress.locality.toLowerCase(), address.locality.toLowerCase()) < 6 ||
            levenshtein.get(newAddress.oldLocality.toLowerCase(), address.locality.toLowerCase()) < 6) {
          address.locality = newAddress.locality
        }
        address.fullAddress+= ', ' + address.locality
      } else if (newAddress.locality) {
        address.locality = newAddress.locality
        address.fullAddress+= ', ' + address.locality
      }

      if (address.streetAddress && newAddress.street) {
        if (levenshtein.get(newAddress.street.toLowerCase(), address.streetAddress.toLowerCase()) < 6 ||
            levenshtein.get(newAddress.oldStreet.toLowerCase(), address.streetAddress.toLowerCase()) < 6) {
          address.streetAddress = newAddress.street
        }
        address.fullAddress+= ', ' + address.streetAddress
      }

      if (newAddress.oldStreet) address.oldStreet = newAddress.oldStreet
      if (newAddress.oldDistrict) address.oldDistrict = newAddress.oldDistrict
      if (newAddress.oldLocality) address.oldLocality = newAddress.oldLocality

      if (address.streetNumber) {
        address.streetAddress += ', ' + address.streetNumber
        address.fullAddress+= ', ' + address.streetNumber
      }
    }

    delete address.streetNumber
    return address

  } catch (err) {
    return address
  }

}

// Test

var test = async () => {
  var res = await module.exports.validate({
    'fullAddress': '49000, ВУЛ.ЛЕНІНА, БУД.31, СМТ.ТРОСТЯНЕЦЬ, ТРОСТЯНЕЦЬКИЙ РАЙОН, ВІННИЦЬКА ОБЛАСТЬ, УКРАЇНА',
    'postalCode': '49000',
    'region': 'Вінницька область',
    'district': 'Тростянецький район',
    'locality': 'селище міського типу Тростянець',
    'streetAddress': 'вулиця Леніна',
    'streetNumber': '31'
  })
  console.log(res)
}

test()