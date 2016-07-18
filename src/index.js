/*!
 * Copyright (c) 2016 Nanchao Inc.
 * All rights reserved.
 */

'use strict';

var Modbus = require('./modbus');

function ModbusRtuMaster(port, timeout) {
    this._option = {
        mode: 'ascii',
        timeout: timeout
    };

    this._master = new Modbus(port, this._option);
}

// read status common handler
ModbusRtuMaster.prototype._readStatus = function (slaveAddress, functionCode, startAddress, quantity, requestHandler, parseHandler, callback) {
    var that = this;
    requestHandler(slaveAddress, startAddress, quantity, function (error) {
        if (error) {
            callback(error);
            return;
        }
        that._master.read(function (error, data) {
            if (error) {
                callback(error);
                return;
            }
            console.log('master receive is ', data);
            var response = parseHandler(quantity, data);
            if (response.slaveAddress === slaveAddress) {
                if (response.functionCode === functionCode) {
                    callback(undefined, response.status);
                } else if (response.functionCode === (functionCode | 0x80)) {
                    callback(new Error('Exception code: ' + response.exceptionCode));
                } else {
                    callback(new Error('Invalid function code: ' + response.functionCode));
                }
            }
        });
    });
};

// Modbus "Read Coil Status" (FC=0x01)
ModbusRtuMaster.prototype.readCoils = function (slaveAddress, startAddress, quantity, callback) {
    var master = this._master;
    this._readStatus(
        slaveAddress,
        0x01,
        startAddress,
        quantity,
        master.requestReadCoils.bind(master),
        master.parseReadCoilsResponse.bind(master),
        callback
    );
};

// Modbus "Read Input Status" (FC=0x02)
ModbusRtuMaster.prototype.readDiscreteInputs = function (slaveAddress, startAddress, quantity, callback) {
    var master = this._master;
    this._readStatus(
        slaveAddress,
        0x02,
        startAddress,
        quantity,
        master.requestReadDiscreteInputs.bind(master),
        master.parseReadDiscreteInputsResponse.bind(master),
        callback
    );
};

// Modbus "Read Holding Registers" (FC=0x03)
ModbusRtuMaster.prototype.readHoldingRegisters = function (slaveAddress, startAddress, quantity, callback) {
    var master = this._master;
    this._readStatus(
        slaveAddress,
        0x03,
        startAddress,
        quantity,
        master.requestReadHoldingRegisters.bind(master),
        master.parseReadHoldingRegistersResponse.bind(master),
        callback
    );
};

// Modbus "Read Input Registers" (FC=0x04)
ModbusRtuMaster.prototype.readInputRegisters = function (slaveAddress, startAddress, quantity, callback) {
    var master = this._master;
    this._readStatus(
        slaveAddress,
        0x04,
        startAddress,
        quantity,
        master.requestReadInputRegisters.bind(master),
        master.parseReadInputRegistersResponse.bind(master),
        callback
    );
};

// Modbus "Write Single Coil" (FC=0x05)
ModbusRtuMaster.prototype.writeSingleCoil = function (slaveAddress, address, state, callback) {
    var that = this;
    this._master.requestWriteSingleCoil(slaveAddress, address, state, function (error) {
        if (error) {
            callback(error);
            return;
        }
        that._master.read(function (error, data) {
            if (error) {
                callback(error);
                return;
            }
            var response = that._master.parseWriteSingleCoilResponse(data);
            if (response.slaveAddress === slaveAddress) {
                if (response.functionCode === 0x05) {
                    callback(undefined, response.state);
                } else if (response.functionCode === (0x05 | 0x80)) {
                    callback(new Error('Exception code: ' + response.exceptionCode));
                } else {
                    callback(new Error('Invalid function code: ' + response.functionCode));
                }
            }
        });
    });
};

// Modbus "Write Single Register" (FC=0x06)
ModbusRtuMaster.prototype.writeSingleRegister = function (slaveAddress, address, value, callback) {
    var that = this;
    this._master.requestWriteSingleRegister(slaveAddress, address, value, function (error) {
        if (error) {
            callback(error);
            return;
        }
        that._master.read(function (error, data) {
            if (error) {
                callback(error);
                return;
            }
            var response = that._master.parseWriteSingleRegisterResponse(data);
            if (response.slaveAddress === slaveAddress) {
                if (response.functionCode === 0x06) {
                    callback(undefined, response.value);
                } else if (response.functionCode === (0x06 | 0x80)) {
                    callback(new Error('Exception code: ' + response.exceptionCode));
                } else {
                    callback(new Error('Invalid function code: ' + response.functionCode));
                }
            }
        });
    });
};

// write multiple common handler
ModbusRtuMaster.prototype._writeMultiple = function (slaveAddress, functionCode, startAddress, values, requestHandler, parseHandler, callback) {
    var that = this;
    requestHandler(slaveAddress, startAddress, values, function (error) {
        if (error) {
            callback(error);
            return;
        }
        that._master.read(function (error, data) {
            if (error) {
                callback(error);
                return;
            }
            var response = parseHandler(data);
            if (response.slaveAddress === slaveAddress) {
                if (response.functionCode === functionCode) {
                    callback();
                } else if (response.functionCode === (functionCode | 0x80)) {
                    callback(new Error('Exception code: ' + response.exceptionCode));
                } else {
                    callback(new Error('Invalid function code: ' + response.functionCode));
                }
            }
        });
    });
};

// Modbus "Write Multiple Coils" (FC=0x0F)
ModbusRtuMaster.prototype.writeMultipleCoils = function (slaveAddress, startAddress, values, callback) {
    var master = this._master;
    this._writeMultiple(
        slaveAddress,
        0x0F,
        startAddress,
        values,
        master.requestWriteMultipleCoils.bind(master),
        master.parseWriteMultipleCoilsResponse.bind(master),
        callback
    );
};
// Modbus "Write Multiple Registers" (FC=0x10)
ModbusRtuMaster.prototype.writeMultipleRegisters = function (slaveAddress, startAddress, values, callback) {
    var master = this._master;
    this._writeMultiple(
        slaveAddress,
        0x10,
        startAddress,
        values,
        master.requestWriteMultipleRegisters.bind(master),
        master.parseWriteMultipleRegistersResponse.bind(master),
        callback
    );
};

module.exports = ModbusRtuMaster;

// ModbusMaster.prototype.readCoils = function (slaveAddress, startAddress, quantity, callback) {
//     var that = this;
//     this._master.requestReadCoils(slaveAddress, startAddress, quantity, function (error) {
//         if (error) {
//             callback(error);
//             return;
//         }
//         that._master.read(function (error, data) {
//             if (error) {
//                 callback(error);
//                 return;
//             }
//             console.log('master receive is ', data);
//             var response = that._master.parseReadCoilsResponse(quantity, data);
//             if (response.slaveAddress === slaveAddress) {
//                 if (response.functionCode === 0x01) {
//                     callback(undefined, response.coilStatus);
//                 } else if (response.functionCode === 0x81) {
//                     callback(new Error('Exception code: ' + response.exceptionCode));
//                 } else {
//                     callback(new Error('Invalid function code: ' + response.functionCode));
//                 }
//             }
//         });
//     });
// };

// ModbusMaster.prototyoe.readDiscreteInputs = function (slaveAddress, startAddress, quantity, callback) {
//     var that = this;
//     this._master.requestReadDiscreteInputs(slaveAddress, startAddress, quantity, function (error) {
//         if (error) {
//             callback(error);
//             return;
//         }
//         that._master.read(function (error, data) {
//             if (error) {
//                 callback(error);
//                 return;
//             }
//             var response = that._master.parseReadDiscreteInputsResponse(data);
//             if (response.slaveAddress === slaveAddress) {
//                 if (response.functionCode === 0x02) {
//                     callback(undefined, response.inputsStatus);
//                 } else if (response.function === 0x82) {
//                     callback(new Error('Exception code: ' + response.exceptionCode));
//                 } else {
//                     callback(new Error('Invalid function code: ' + response.functionCode));
//                 }
//             }
//         });
//     });
// };



/*
// *******************
var port;
var master;
$.ready(function (error) {
    if (error) {
        console.log(error);
        return;
    }

    var option = {
        mode: 'rtu',
        address: 1,
        timeout: 200
    };
    port = $('#rs485');
    // var master = new Modbus(port, 'rtu');
    master = new ModbusRtuMaster(port, 200);

    setInterval(function () {
        master.readCoils(1, 10, 19, function (error, data) {
            if (error) {
                console.log('error ', error);
            }
            console.log(data);
        });
    }, 3000);

    $('#led-r').turnOn();
});

$.end(function () {
    $('#led-r').turnOff();
});
*/
