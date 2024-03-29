"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var PatientModel = require('../models/PatientModel');

var UserModel = require('../models/UserModel');

var CounterModel = require('../models/CounterModel');

var EncounterModel = require('../models/EncounterModel');

var patientValidation = require('../validations/patients');

var ClinicPatientDoctorModel = require('../models/ClinicPatientDoctorModel');

var ClinicPatientModel = require('../models/ClinicPatientModel');

var mongoose = require('mongoose');

var ClinicDoctorModel = require('../models/ClinicDoctorModel');

var ClinicModel = require('../models/ClinicModel');

var addPatient = function addPatient(request, response) {
  var dataValidation, _request$body, cardId, clinicId, doctorId, countryCode, phone, card, clinic, doctor, phoneList, patientData, counter, patientObj, newPatient, newClinicPatient, newClinicPatientDoctor, clinicPatientDoctorData, clinicPatientDoctorObj, clinicPatientData, clinicPatientObj, _clinicPatientData, _clinicPatientObj;

  return regeneratorRuntime.async(function addPatient$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          dataValidation = patientValidation.addPatient(request.body);

          if (dataValidation.isAccepted) {
            _context.next = 4;
            break;
          }

          return _context.abrupt("return", response.status(400).json({
            accepted: dataValidation.isAccepted,
            message: dataValidation.message,
            field: dataValidation.field
          }));

        case 4:
          _request$body = request.body, cardId = _request$body.cardId, clinicId = _request$body.clinicId, doctorId = _request$body.doctorId, countryCode = _request$body.countryCode, phone = _request$body.phone;
          _context.next = 7;
          return regeneratorRuntime.awrap(PatientModel.find({
            cardId: cardId
          }));

        case 7:
          card = _context.sent;

          if (!(card.length != 0)) {
            _context.next = 10;
            break;
          }

          return _context.abrupt("return", response.status(400).json({
            accepted: false,
            message: 'card Id is already used',
            field: 'cardId'
          }));

        case 10:
          if (!clinicId) {
            _context.next = 16;
            break;
          }

          _context.next = 13;
          return regeneratorRuntime.awrap(ClinicModel.findById(clinicId));

        case 13:
          clinic = _context.sent;

          if (clinic) {
            _context.next = 16;
            break;
          }

          return _context.abrupt("return", response.status(400).json({
            accepted: false,
            message: 'clinic Id is not registered',
            field: 'clinicId'
          }));

        case 16:
          if (!doctorId) {
            _context.next = 22;
            break;
          }

          _context.next = 19;
          return regeneratorRuntime.awrap(UserModel.findById(doctorId));

        case 19:
          doctor = _context.sent;

          if (doctor) {
            _context.next = 22;
            break;
          }

          return _context.abrupt("return", response.status(400).json({
            accepted: false,
            message: 'doctor Id is not registered',
            field: 'doctorId'
          }));

        case 22:
          _context.next = 24;
          return regeneratorRuntime.awrap(PatientModel.find({
            countryCode: countryCode,
            phone: phone
          }));

        case 24:
          phoneList = _context.sent;

          if (!(phoneList.length != 0)) {
            _context.next = 27;
            break;
          }

          return _context.abrupt("return", response.status(400).json({
            accepted: false,
            message: 'Phone number is already registered',
            field: 'phone'
          }));

        case 27:
          patientData = _objectSpread({}, request.body);
          _context.next = 30;
          return regeneratorRuntime.awrap(CounterModel.findOneAndUpdate({
            name: 'patient'
          }, {
            $inc: {
              value: 1
            }
          }, {
            "new": true,
            upsert: true
          }));

        case 30:
          counter = _context.sent;
          patientData.patientId = counter.value;
          patientObj = new PatientModel(patientData);
          _context.next = 35;
          return regeneratorRuntime.awrap(patientObj.save());

        case 35:
          newPatient = _context.sent;

          if (!(clinicId && doctorId)) {
            _context.next = 49;
            break;
          }

          clinicPatientDoctorData = {
            patientId: newPatient._id,
            clinicId: clinicId,
            doctorId: doctorId
          };
          clinicPatientDoctorObj = new ClinicPatientDoctorModel(clinicPatientDoctorData);
          _context.next = 41;
          return regeneratorRuntime.awrap(clinicPatientDoctorObj.save());

        case 41:
          newClinicPatientDoctor = _context.sent;
          clinicPatientData = {
            patientId: newPatient._id,
            clinicId: clinicId
          };
          clinicPatientObj = new ClinicPatientModel(clinicPatientData);
          _context.next = 46;
          return regeneratorRuntime.awrap(clinicPatientObj.save());

        case 46:
          newClinicPatient = _context.sent;
          _context.next = 55;
          break;

        case 49:
          if (!clinicId) {
            _context.next = 55;
            break;
          }

          _clinicPatientData = {
            patientId: newPatient._id,
            clinicId: clinicId
          };
          _clinicPatientObj = new ClinicPatientModel(_clinicPatientData);
          _context.next = 54;
          return regeneratorRuntime.awrap(_clinicPatientObj.save());

        case 54:
          newClinicPatient = _context.sent;

        case 55:
          return _context.abrupt("return", response.status(200).json({
            accepted: true,
            message: 'Added patient successfully!',
            patient: newPatient,
            clinicPatient: newClinicPatient,
            clinicPatientDoctor: newClinicPatientDoctor
          }));

        case 58:
          _context.prev = 58;
          _context.t0 = _context["catch"](0);
          console.error(_context.t0);
          return _context.abrupt("return", response.status(500).json({
            accepted: false,
            message: 'internal server error',
            error: _context.t0.message
          }));

        case 62:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 58]]);
};

var getPatientInfo = function getPatientInfo(request, response) {
  var patientId, patientPromise, encountersPromise, _ref, _ref2, patient, encounters;

  return regeneratorRuntime.async(function getPatientInfo$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          patientId = request.params.patientId;
          patientPromise = PatientModel.findById(patientId);
          encountersPromise = EncounterModel.aggregate([{
            $match: {
              patientId: mongoose.Types.ObjectId(patientId)
            }
          }, {
            $lookup: {
              from: 'patients',
              localField: 'patientId',
              foreignField: '_id',
              as: 'patient'
            }
          }, {
            $sort: {
              createdAt: -1
            }
          }]);
          _context2.next = 6;
          return regeneratorRuntime.awrap(Promise.all([patientPromise, encountersPromise]));

        case 6:
          _ref = _context2.sent;
          _ref2 = _slicedToArray(_ref, 2);
          patient = _ref2[0];
          encounters = _ref2[1];
          encounters.forEach(function (encounter) {
            return encounter.patient = encounter.patient[0];
          });
          return _context2.abrupt("return", response.status(200).json({
            accepted: true,
            patient: patient,
            encounters: encounters
          }));

        case 14:
          _context2.prev = 14;
          _context2.t0 = _context2["catch"](0);
          console.error(_context2.t0);
          return _context2.abrupt("return", response.status(500).json({
            accepted: false,
            message: 'internal server error',
            error: _context2.t0.message
          }));

        case 18:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 14]]);
};

var getPatient = function getPatient(request, response) {
  var patientId, patient;
  return regeneratorRuntime.async(function getPatient$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          patientId = request.params.patientId;
          _context3.next = 4;
          return regeneratorRuntime.awrap(PatientModel.findById(patientId));

        case 4:
          patient = _context3.sent;
          return _context3.abrupt("return", response.status(200).json({
            accepted: true,
            patient: patient
          }));

        case 8:
          _context3.prev = 8;
          _context3.t0 = _context3["catch"](0);
          console.error(_context3.t0);
          return _context3.abrupt("return", response.status(500).json({
            accepted: false,
            message: 'internal server error',
            error: _context3.t0.message
          }));

        case 12:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 8]]);
};

var getPatientByCardUUID = function getPatientByCardUUID(request, response) {
  var cardUUID, patientList, patient;
  return regeneratorRuntime.async(function getPatientByCardUUID$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          cardUUID = request.params.cardUUID;
          _context4.next = 4;
          return regeneratorRuntime.awrap(PatientModel.find({
            cardUUID: cardUUID
          }));

        case 4:
          patientList = _context4.sent;
          patient = patientList[0];
          return _context4.abrupt("return", response.status(200).json({
            accepted: true,
            patient: patient
          }));

        case 9:
          _context4.prev = 9;
          _context4.t0 = _context4["catch"](0);
          console.error(_context4.t0);
          return _context4.abrupt("return", response.status(500).json({
            accepted: false,
            message: 'internal server error',
            error: _context4.t0.message
          }));

        case 13:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 9]]);
};

var addDoctorToPatient = function addDoctorToPatient(request, response) {
  var cardId, doctorId, dataValidation, doctor, patientList, patient, patientDoctorsIds, additionData, updatedPatient;
  return regeneratorRuntime.async(function addDoctorToPatient$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          cardId = request.params.cardId;
          doctorId = request.body.doctorId;
          dataValidation = patientValidation.addDoctorToPatient(request.body);

          if (dataValidation.isAccepted) {
            _context5.next = 6;
            break;
          }

          return _context5.abrupt("return", response.status(500).json({
            accepted: dataValidation.isAccepted,
            message: dataValidation.message,
            field: dataValidation.field
          }));

        case 6:
          _context5.next = 8;
          return regeneratorRuntime.awrap(UserModel.findById(doctorId));

        case 8:
          doctor = _context5.sent;

          if (doctor) {
            _context5.next = 11;
            break;
          }

          return _context5.abrupt("return", response.status(400).json({
            accepted: false,
            message: 'Doctor Id is not registered',
            field: 'doctorId'
          }));

        case 11:
          _context5.next = 13;
          return regeneratorRuntime.awrap(PatientModel.find({
            cardId: cardId
          }));

        case 13:
          patientList = _context5.sent;

          if (!(patientList.length == 0)) {
            _context5.next = 16;
            break;
          }

          return _context5.abrupt("return", response.status(404).json({
            accepted: false,
            message: 'card Id is not registered',
            field: 'cardId'
          }));

        case 16:
          patient = patientList[0];
          patientDoctorsIds = patient.doctors.map(function (doctor) {
            return doctor.doctorId;
          });

          if (!patientDoctorsIds.includes(doctorId)) {
            _context5.next = 20;
            break;
          }

          return _context5.abrupt("return", response.status(400).json({
            accepted: false,
            message: 'Doctor is already registered with the patient',
            field: 'doctorId'
          }));

        case 20:
          additionData = {
            doctorId: doctorId,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          _context5.next = 23;
          return regeneratorRuntime.awrap(PatientModel.findByIdAndUpdate(patient._id, {
            $push: {
              doctors: additionData
            }
          }, {
            "new": true
          }));

        case 23:
          updatedPatient = _context5.sent;
          updatedPatient.password = undefined;
          return _context5.abrupt("return", response.status(200).json({
            accepted: true,
            message: 'Doctor is added successfully to the patient',
            updatedPatient: updatedPatient
          }));

        case 28:
          _context5.prev = 28;
          _context5.t0 = _context5["catch"](0);
          console.error(_context5.t0);
          return _context5.abrupt("return", response.status(500).json({
            accepted: false,
            message: 'internal server error',
            error: _context5.t0.message
          }));

        case 32:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 28]]);
};

var getPatientsByClinicId = function getPatientsByClinicId(request, response) {
  var clinicId, patients;
  return regeneratorRuntime.async(function getPatientsByClinicId$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          clinicId = request.params.clinicId;
          _context6.next = 4;
          return regeneratorRuntime.awrap(ClinicPatientModel.aggregate([{
            $match: {
              clinicId: mongoose.Types.ObjectId(clinicId)
            }
          }, {
            $lookup: {
              from: 'patients',
              localField: 'patientId',
              foreignField: '_id',
              as: 'patient'
            }
          }, {
            $sort: {
              createdAt: -1
            }
          }, {
            $project: {
              patient: 1,
              createdAt: 1
            }
          }]));

        case 4:
          patients = _context6.sent;
          patients.forEach(function (patient) {
            patient.patient = patient.patient[0];
            patient.patient.emergencyContacts = undefined;
            patient.patient.healthHistory = undefined;
          });
          return _context6.abrupt("return", response.status(200).json({
            accepted: true,
            patients: patients
          }));

        case 9:
          _context6.prev = 9;
          _context6.t0 = _context6["catch"](0);
          console.error(_context6.t0);
          return _context6.abrupt("return", response.status(500).json({
            accepted: false,
            message: 'internal server error',
            error: _context6.t0.message
          }));

        case 13:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 9]]);
};

var getPatientsByDoctorId = function getPatientsByDoctorId(request, response) {
  var doctorId, patients;
  return regeneratorRuntime.async(function getPatientsByDoctorId$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          doctorId = request.params.doctorId;
          _context7.next = 4;
          return regeneratorRuntime.awrap(ClinicPatientDoctorModel.aggregate([{
            $match: {
              doctorId: mongoose.Types.ObjectId(doctorId)
            }
          }, {
            $lookup: {
              from: 'patients',
              localField: 'patientId',
              foreignField: '_id',
              as: 'patient'
            }
          }, {
            $lookup: {
              from: 'clinics',
              localField: 'clinicId',
              foreignField: '_id',
              as: 'clinic'
            }
          }, {
            $sort: {
              createdAt: -1
            }
          }, {
            $project: {
              'patient.healthHistory': 0,
              'patient.emergencyContacts': 0
            }
          }]));

        case 4:
          patients = _context7.sent;
          patients.forEach(function (patient) {
            patient.patient = patient.patient[0];
            patient.clinic = patient.clinic[0];
          });
          return _context7.abrupt("return", response.status(200).json({
            accepted: true,
            patients: patients
          }));

        case 9:
          _context7.prev = 9;
          _context7.t0 = _context7["catch"](0);
          console.error(_context7.t0);
          return _context7.abrupt("return", response.status(500).json({
            accepted: false,
            message: 'internal server error',
            error: _context7.t0.message
          }));

        case 13:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[0, 9]]);
};

var getDoctorsByPatientId = function getDoctorsByPatientId(request, response) {
  var patientId, doctors;
  return regeneratorRuntime.async(function getDoctorsByPatientId$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          patientId = request.params.patientId;
          _context8.next = 4;
          return regeneratorRuntime.awrap(ClinicPatientDoctorModel.aggregate([{
            $match: {
              patientId: mongoose.Types.ObjectId(patientId)
            }
          }, {
            $lookup: {
              from: 'users',
              localField: 'doctorId',
              foreignField: '_id',
              as: 'doctor'
            }
          }, {
            $lookup: {
              from: 'clinics',
              localField: 'clinicId',
              foreignField: '_id',
              as: 'clinic'
            }
          }, {
            $sort: {
              createdAt: -1
            }
          }, {
            $project: {
              'doctor.password': 0
            }
          }]));

        case 4:
          doctors = _context8.sent;
          doctors.forEach(function (doctor) {
            doctor.doctor = doctor.doctor[0];
            doctor.clinic = doctor.clinic[0];
          });
          return _context8.abrupt("return", response.status(200).json({
            accepted: true,
            doctors: doctors
          }));

        case 9:
          _context8.prev = 9;
          _context8.t0 = _context8["catch"](0);
          console.error(_context8.t0);
          return _context8.abrupt("return", response.status(500).json({
            accepted: false,
            message: 'internal server error',
            error: _context8.t0.message
          }));

        case 13:
        case "end":
          return _context8.stop();
      }
    }
  }, null, null, [[0, 9]]);
};

var addEmergencyContactToPatient = function addEmergencyContactToPatient(request, response) {
  var patientId, dataValidation, patient, emergencyContacts, phone, countryCode, newContactPhone, patientPhone, samePhones, contactData, updatedPatient;
  return regeneratorRuntime.async(function addEmergencyContactToPatient$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          patientId = request.params.patientId;
          dataValidation = patientValidation.addEmergencyContactToPatient(request.body);

          if (dataValidation.isAccepted) {
            _context9.next = 5;
            break;
          }

          return _context9.abrupt("return", response.status(400).json({
            accepted: dataValidation.isAccepted,
            message: dataValidation.message,
            field: dataValidation.field
          }));

        case 5:
          _context9.next = 7;
          return regeneratorRuntime.awrap(PatientModel.findById(patientId));

        case 7:
          patient = _context9.sent;
          emergencyContacts = patient.emergencyContacts, phone = patient.phone, countryCode = patient.countryCode;
          newContactPhone = "".concat(request.body.countryCode).concat(request.body.phone);
          patientPhone = "".concat(countryCode).concat(phone);

          if (!(patientPhone == newContactPhone)) {
            _context9.next = 13;
            break;
          }

          return _context9.abrupt("return", response.status(400).json({
            accepted: false,
            message: 'contact phone is the same as patient phone',
            field: 'phone'
          }));

        case 13:
          samePhones = emergencyContacts.filter(function (contact) {
            var registeredPhone = "".concat(contact.countryCode).concat(contact.phone);
            if (newContactPhone == registeredPhone) return true;
            return false;
          });

          if (!(samePhones.length != 0)) {
            _context9.next = 16;
            break;
          }

          return _context9.abrupt("return", response.status(400).json({
            accepted: false,
            message: 'contact phone is already registered',
            field: 'phone'
          }));

        case 16:
          contactData = {
            name: request.body.name,
            relation: request.body.relation,
            countryCode: request.body.countryCode,
            phone: request.body.phone
          };
          _context9.next = 19;
          return regeneratorRuntime.awrap(PatientModel.findByIdAndUpdate(patientId, {
            $push: {
              emergencyContacts: contactData
            }
          }, {
            "new": true
          }));

        case 19:
          updatedPatient = _context9.sent;
          return _context9.abrupt("return", response.status(200).json({
            accepted: true,
            message: 'added emergency contact successfully!',
            patient: updatedPatient
          }));

        case 23:
          _context9.prev = 23;
          _context9.t0 = _context9["catch"](0);
          console.error(_context9.t0);
          return _context9.abrupt("return", response.status(500).json({
            accepted: false,
            message: 'internal server error',
            error: _context9.t0.message
          }));

        case 27:
        case "end":
          return _context9.stop();
      }
    }
  }, null, null, [[0, 23]]);
};

var deleteEmergencyContactOfPatient = function deleteEmergencyContactOfPatient(request, response) {
  var _request$params, patientId, countryCode, phone, patient, emergencyContacts, targetContact, updatedContactList, updatedPatient;

  return regeneratorRuntime.async(function deleteEmergencyContactOfPatient$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _context10.prev = 0;
          _request$params = request.params, patientId = _request$params.patientId, countryCode = _request$params.countryCode, phone = _request$params.phone;
          _context10.next = 4;
          return regeneratorRuntime.awrap(PatientModel.findById(patientId));

        case 4:
          patient = _context10.sent;
          emergencyContacts = patient.emergencyContacts;
          targetContact = "".concat(countryCode).concat(phone);
          updatedContactList = emergencyContacts.filter(function (contact) {
            var contactPhone = "".concat(contact.countryCode).concat(contact.phone);
            if (contactPhone == targetContact) return false;
            return true;
          });
          _context10.next = 10;
          return regeneratorRuntime.awrap(PatientModel.findByIdAndUpdate(patientId, {
            emergencyContacts: updatedContactList
          }, {
            "new": true
          }));

        case 10:
          updatedPatient = _context10.sent;
          return _context10.abrupt("return", response.status(200).json({
            accepted: true,
            message: 'deleted emergency contact successfully!',
            patient: updatedPatient
          }));

        case 14:
          _context10.prev = 14;
          _context10.t0 = _context10["catch"](0);
          console.error(_context10.t0);
          return _context10.abrupt("return", response.status(500).json({
            accepted: false,
            message: 'internal server error',
            error: _context10.t0.message
          }));

        case 18:
        case "end":
          return _context10.stop();
      }
    }
  }, null, null, [[0, 14]]);
};

var updateEmergencyContactOfPatient = function updateEmergencyContactOfPatient(request, response) {
  var _request$params2, patientId, contactId, dataValidation, patient, emergencyContacts, targetContactList, _request$body2, name, countryCode, phone, relation, newPhone, patientPhone, withOutTargetContactList, patientContacts, newEmergencyContacts, updatedPatient;

  return regeneratorRuntime.async(function updateEmergencyContactOfPatient$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          _context11.prev = 0;
          _request$params2 = request.params, patientId = _request$params2.patientId, contactId = _request$params2.contactId;
          dataValidation = patientValidation.updateEmergencyContactOfPatient(request.body);

          if (dataValidation.isAccepted) {
            _context11.next = 5;
            break;
          }

          return _context11.abrupt("return", response.status(400).json({
            accepted: dataValidation.isAccepted,
            message: dataValidation.message,
            field: dataValidation.field
          }));

        case 5:
          _context11.next = 7;
          return regeneratorRuntime.awrap(PatientModel.findById(patientId));

        case 7:
          patient = _context11.sent;
          emergencyContacts = patient.emergencyContacts;
          targetContactList = emergencyContacts.filter(function (contact) {
            return contact._id.equals(contactId);
          });

          if (!(targetContactList.length == 0)) {
            _context11.next = 12;
            break;
          }

          return _context11.abrupt("return", response.status(400).json({
            accepted: false,
            message: 'emergency contact does not exists',
            field: 'contactId'
          }));

        case 12:
          _request$body2 = request.body, name = _request$body2.name, countryCode = _request$body2.countryCode, phone = _request$body2.phone, relation = _request$body2.relation;
          newPhone = "".concat(countryCode).concat(phone);
          patientPhone = "".concat(patient.countryCode).concat(patient.phone);
          withOutTargetContactList = emergencyContacts.map(function (contact) {
            return !contact._id.equals(contactId);
          });
          patientContacts = withOutTargetContactList.map(function (contact) {
            return "".concat(contact.countryCode).concat(contact.phone);
          });

          if (!(newPhone == patientPhone)) {
            _context11.next = 19;
            break;
          }

          return _context11.abrupt("return", response.status(200).json({
            accepted: false,
            message: 'contact phone is the same as patient phone',
            field: 'phone'
          }));

        case 19:
          if (!patientContacts.includes(newPhone)) {
            _context11.next = 21;
            break;
          }

          return _context11.abrupt("return", response.status(400).json({
            accepted: false,
            message: 'contact phone is already registered in patient contacts',
            field: 'phone'
          }));

        case 21:
          newEmergencyContacts = emergencyContacts.map(function (contact) {
            if (contact._id.equals(contactId)) {
              return {
                name: name,
                countryCode: countryCode,
                phone: phone,
                relation: relation
              };
            }

            return contact;
          });
          _context11.next = 24;
          return regeneratorRuntime.awrap(PatientModel.findByIdAndUpdate(patientId, {
            emergencyContacts: newEmergencyContacts
          }, {
            "new": true
          }));

        case 24:
          updatedPatient = _context11.sent;
          return _context11.abrupt("return", response.status(200).json({
            accepted: true,
            message: 'updated patient contact successfully',
            patient: updatedPatient
          }));

        case 28:
          _context11.prev = 28;
          _context11.t0 = _context11["catch"](0);
          console.error(_context11.t0);
          return _context11.abrupt("return", response.status(500).json({
            accepted: false,
            message: 'internal server error',
            error: _context11.t0.message
          }));

        case 32:
        case "end":
          return _context11.stop();
      }
    }
  }, null, null, [[0, 28]]);
};

var deleteDoctorFromPatient = function deleteDoctorFromPatient(request, response) {
  var _request$params3, patientId, doctorId, patient, doctors, targetDoctorList, updatedDoctorList, updatedPatient;

  return regeneratorRuntime.async(function deleteDoctorFromPatient$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          _context12.prev = 0;
          _request$params3 = request.params, patientId = _request$params3.patientId, doctorId = _request$params3.doctorId;
          _context12.next = 4;
          return regeneratorRuntime.awrap(PatientModel.findById(patientId).select({
            doctors: 1
          }));

        case 4:
          patient = _context12.sent;
          doctors = patient.doctors;
          targetDoctorList = doctors.filter(function (doctor) {
            return doctor.doctorId == doctorId;
          });

          if (!(targetDoctorList.length == 0)) {
            _context12.next = 9;
            break;
          }

          return _context12.abrupt("return", response.status(400).json({
            accepted: false,
            message: 'doctor is not registered with the patient',
            field: 'doctorId'
          }));

        case 9:
          updatedDoctorList = doctors.filter(function (doctor) {
            return doctor.doctorId != doctorId;
          });
          _context12.next = 12;
          return regeneratorRuntime.awrap(PatientModel.findByIdAndUpdate(patientId, {
            doctors: updatedDoctorList
          }, {
            "new": true
          }));

        case 12:
          updatedPatient = _context12.sent;
          return _context12.abrupt("return", response.status(200).json({
            accepted: true,
            message: 'removed patient successfully!',
            patient: updatedPatient
          }));

        case 16:
          _context12.prev = 16;
          _context12.t0 = _context12["catch"](0);
          console.error(_context12.t0);
          return _context12.abrupt("return", response.status(500).json({
            accepted: false,
            message: 'internal server error',
            error: _context12.t0.message
          }));

        case 20:
        case "end":
          return _context12.stop();
      }
    }
  }, null, null, [[0, 16]]);
};

module.exports = {
  addPatient: addPatient,
  addEmergencyContactToPatient: addEmergencyContactToPatient,
  getPatientInfo: getPatientInfo,
  getPatient: getPatient,
  getPatientByCardUUID: getPatientByCardUUID,
  addDoctorToPatient: addDoctorToPatient,
  getPatientsByClinicId: getPatientsByClinicId,
  getPatientsByDoctorId: getPatientsByDoctorId,
  getDoctorsByPatientId: getDoctorsByPatientId,
  deleteEmergencyContactOfPatient: deleteEmergencyContactOfPatient,
  updateEmergencyContactOfPatient: updateEmergencyContactOfPatient,
  deleteDoctorFromPatient: deleteDoctorFromPatient
};