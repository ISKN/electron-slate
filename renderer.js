// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const serialport = require('serialport')
const createTable = require('data-table')

serialport.list((err, ports) => {
  if (ports.length > 0) {
    let port;
    console.log('List of ports:', ports);
    for (var i = 0; i < ports.length; i++) {
      if (ports[i].manufacturer === "ISKN") {
        port = new serialport(ports[i].comName, {
          baudRate: 921600
        }, function (err) {
          if (err) {
            return console.log('Error: ', err.message);
          }
        })
        // The open event is always emitted
        port.on('open', function() {
          console.log('Port opened');
          port.write([0xB3, 0xA5, 0xE1, 0x33, 0x6A, 0x00, 0xE1, 0xE4,]);
        });

        port.on('data', function (data) {
          console.log('Data:', data);
        });

        port.on('close', function () {
          console.log('Port closed');
        });
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
