// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const serialport = require('serialport')
const createTable = require('data-table')


var SlateManager = require('./slatemanager.js');

serialport.list((err, ports) => {
  if (ports.length > 0) {
    let port;
    console.log('List of ports:', ports);
    for (var i = 0; i < ports.length; i++) {
      if (ports[i].manufacturer === "ISKN") {

        var slate = new SlateManager((ports[i].comName));
      }
    }
  }

  if (err) {
    document.getElementById('error').textContent = err.message
    return
  } else {
    document.getElementById('error').textContent = ''
  }

  if (ports.length === 0) {
    document.getElementById('error').textContent = 'No ports discovered'
  }

  const headers = Object.keys(ports[0])
  const table = createTable(headers)
  tableHTML = ''
  table.on('data', data => tableHTML += data)
  table.on('end', () => document.getElementById('ports').innerHTML = tableHTML)
  ports.forEach(port => table.write(port))
  table.end();
})
