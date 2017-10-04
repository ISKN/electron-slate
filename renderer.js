// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const serialport = require('serialport')
const createTable = require('data-table')
var Parser = require('binary-parser').Parser;

var pen3DBloc = new Parser()
    .endianess('little')
    .array('header', {
        type: 'uint8',
        length: 3
    })
    .uint8('packetID')
    .uint16('X')
    .uint16('Y')
    .uint16('Z')
    .uint16('TimeStamp')
    .int16('Phi')
    .int16('Theta')
    .uint8('Contact')
    .array('crc', {
        type: 'uint8',
        length: 2
    });

  var eventBloc = new Parser()
      .array('header', {
          type: 'uint8',
          length: 3
      })
      .uint8('packetID')
      .uint8('eventID')
      .uint8('eventCode')
      .array('crc', {
          type: 'uint8',
          length: 2
      });

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
          //console.log('Data:', data);
          var buf = new Buffer(data, 'hex');
          var offset = 0;

          while(offset <= (buf.length - 4))
          {
            if((data[offset] == 0xB3) &&
               (data[offset + 1] == 0xA5) &&
               (data[offset + 2] == 0xE1))
               {

                  switch(data[offset + 3]){
                   case 0x03:
                        if(offset <= (buf.length - 8))
                        {
                          console.log('Data:', eventBloc.parse(buf.slice(offset)));
                        }
                        offset += 8;
                     break;

                   case 0x05:
                       if(offset <= (buf.length - 19))
                       {
                         console.log('Data:', pen3DBloc.parse(buf.slice(offset)));
                        //  console.log('Data - buffer:', buf.slice(offset));
                       }
                       offset += 19;
                     break;

                  default:
                      offset++;
                     break;
                 }
               }

              else {
                 offset++;
               }
          }
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
