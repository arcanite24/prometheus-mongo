const mongoose = require('mongoose')

module.exports = {

  initConnection(uri) {

    mongoose.connect(uri, {
      useNewUrlParser: true
    })

    const db = mongoose.connection
    return db

  }

}