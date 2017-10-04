var events = require('events');
var EventEmitter = events.EventEmitter;

const Serialport = require('serialport');
var Parser = require('binary-parser').Parser;

module.exports = class SlateManager extends EventEmitter  {

   constructor(comName) {
     super();

    console.log("Length: ", rect.getLength());

    this.requestDescription = new Buffer([0xB3, 0xA5, 0xE1, 0x34, 0x02, 0x42, 0x20]);
    this.sub = new Buffer([0xB3, 0xA5, 0xE1, 0x33, 0x6A, 0x00, 0xE1, 0xE4]);
    this.serialport =  new Serialport(comName, {
           baudRate: 921600
         }, function (err) {
           if (err) {
             return console.log('Error: ', err.message);
           }
         });

     this.serialport.on('open', this.openPort.bind(this));
     this.serialport.on('data', this.parseData.bind(this));
     this.serialport.on('close', this.closePort.bind(this));
   }


  openPort()
  {
    console.log("Port opened");
    this.serialport.write(this.sub);
  }

  closePort()
  {
    console.log("Port closed");
  }

  parseData(data)
  {
    //console.log("new data: ", this.sub);

    var descriptionBloc = new Parser()
    .endianess('little')
    .array('header', {
        type: 'uint8',
        length: 3
    })
    .int16('physWidth')
    .int16('physHeight')
    .int16('cliWidth')
    .int16('cliHeight')
    .int16('x')
    .int16('y')
    .array('name', {
        type: 'uint8',
        length: 20
    })
    .array('firmwareVersion', {
        type: 'uint8',
        length: 4
    })
    .array('crc', {
        type: 'uint8',
        length: 2
      });

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

    var buf = new Buffer(data, 'hex');
    var offset = 0;

    while(offset <= (buf.length - 4))
    {
      if((data[offset] == 0xB3) &&
         (data[offset + 1] == 0xA5) &&
         (data[offset + 2] == 0xE1))
         {

            switch(data[offset + 3]){
             case 0x03: //Event bloc
                  if(offset <= (buf.length - 8))
                  {
                    console.log('Data:', eventBloc.parse(buf.slice(offset)));
                  }
                  offset += 8;
               break;

             case 0x05: //PEN3D
                 if(offset <= (buf.length - 19))
                 {
                   console.log('Data:', pen3DBloc.parse(buf.slice(offset)));
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
    }
}
