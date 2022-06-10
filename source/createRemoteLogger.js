const rely = require('@jrh/rely')

// -----------------------------------------------------

function createRemoteLogger({ application, key, source }, { request }) {
  const now = new Date().getTime()
  const url = `https://logs.logdna.com/logs/ingest?apikey=${ key }&hostname=${ source }&now=${ now }`
  let lines = []

  // -----------------------------------------------------

  function createLine(message, { data, level }) {
    const line = {
      timestamp: new Date().getTime(),
      line: message,
      app: application,
      level
    }

    if (data) {
      line.meta = data
    }

    return line
  }

  // -----------------------------------------------------

  return {
    info(message, data) {
      lines = [ ...lines, createLine(message, { data, level: 'info' }) ]
    },

    error(message) {
      lines = [ ...lines, createLine(message, { level: 'error' }) ]
    },

    async send() {
      if (lines.length) {
        await request.post(url, { lines })
      }

      lines = []
    }
  }
}

// -----------------------------------------------------

module.exports = rely
  .on('request')
  .to(createRemoteLogger)
