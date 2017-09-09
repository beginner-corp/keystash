var locks = require('locks')
// create a singleton lock
module.exports = locks.createReadWriteLock()
