const mongoose = require('mongoose')
const _ = require('lodash')
mongoose.Promise = Promise

module.exports = {

  primaryKey: '_id',

  createModel(name, attributes) {

    let _attributes = {}

    for (const attrName in attributes) {

      const attr = attributes[attrName]

      // Map attributes from Prometheus Model Language to Mongoose Schema
      if (attr.type == 'string') _attributes[attrName] = String
      if (attr.type == 'number') _attributes[attrName] = Number
      if (attr.type == 'boolean') _attributes[attrName] = Boolean

    }

    // Create Mongoose Schema & Model and return the Prometheus REST Object
    const schema = mongoose.Schema(_attributes)
    const model = mongoose.model(name, schema)
    const restObject = this.buildRestObject(model)
    return restObject

  },

  buildRestObject(model) {

    const restObject = {

      // TODO: Decide if nativeModel will become available in further releases
      nativeModel: model,
      primaryKey: this.primaryKey,
      omitValues: ['__v'],

      // FIXME: formatObject not working properly
      formatObject(_object) {
        let object = _.clone(_object)
        delete object[this.primaryKey]
        object.id = _object[this.primaryKey]
        return object
      },

      findOne(criteria) {
        return new Promise(async (resolve, reject) => {
          try {
            const object = await model.findOne(criteria).exec()
            resolve(this.formatObject(object))
          } catch (error) {
            reject(error)
          }
        })
      },

      find(criteria) {
        return new Promise(async (resolve, reject) => {
          try {
            const objects = await model.find(criteria).exec()
            resolve(objects.map(obj => this.formatObject(obj)))
          } catch (error) {
            reject(error)
          }
        })
      },

      create(data) {
        return new Promise(async (resolve, reject) => {
          try {
            const object = await model.create(data)
            resolve(this.formatObject(object))
          } catch (error) {
            reject(error)
          }
        })
      },

      update(criteria, data) {
        return new Promise(async (params) => {
          try {
            const objects = await model.update(criteria, data).exec()
            resolve(objects.map(obj => this.formatObject(obj)))
          } catch (error) {
            reject(error)
          }
        })
      },

      delete(criteria) {
        return new Promise(async (params) => {
          try {
            const objects = model.remove(criteria).exec()
            resolve(objects.map(obj => this.formatObject(obj)))
          } catch (error) {
            reject(error)
          }
        })
      }

    }

    return restObject

  }
  
}