"use strict";

var config = require('../config/config');

var utils = require('../utils/utils');

var checkSpeciality = function checkSpeciality(specialities) {
  for (var i = 0; i < specialities.length; i++) {
    if (!utils.isObjectId(specialities[i])) {
      return false;
    }
  }

  return true;
};

var updateUser = function updateUser(userData) {
  var firstName = userData.firstName,
      lastName = userData.lastName,
      gender = userData.gender,
      dateOfBirth = userData.dateOfBirth;
  if (!firstName) return {
    isAccepted: false,
    message: 'First name is required',
    field: 'firstName'
  };
  if (!utils.isNameValid(firstName)) return {
    isAccepted: false,
    message: 'Invalid name formate',
    field: 'firstName'
  };
  if (!lastName) return {
    isAccepted: false,
    message: 'Last name is required',
    field: 'lastName'
  };
  if (!utils.isNameValid(lastName)) return {
    isAccepted: false,
    message: 'Invalid name formate',
    field: 'lastName'
  };
  if (!gender) return {
    isAccepted: false,
    message: 'Gender is required',
    field: 'gender'
  };
  if (!config.GENDER.includes(gender)) return {
    isAccepted: false,
    message: 'Invalid gender',
    field: 'gender'
  };
  if (!dateOfBirth) return {
    isAccepted: false,
    message: 'Date of birth is required',
    field: 'dateOfBirth'
  };
  if (!utils.isDateValid(dateOfBirth)) return {
    isAccepted: false,
    message: 'Date of birth format is invalid',
    field: 'dateOfBirth'
  };
  return {
    isAccepted: true,
    message: 'data is valid',
    data: userData
  };
};

var updateUserSpeciality = function updateUserSpeciality(userData) {
  var title = userData.title,
      description = userData.description,
      speciality = userData.speciality;
  if (!title) return {
    isAccepted: false,
    message: 'Title is required',
    field: 'title'
  };
  if (typeof title != 'string') return {
    isAccepted: false,
    message: 'Invalid title format',
    field: 'title'
  };
  if (!description) return {
    isAccepted: false,
    message: 'Description is required',
    field: 'description'
  };
  if (typeof description != 'string') return {
    isAccepted: false,
    message: 'Invalid description format',
    field: 'description'
  };
  if (!speciality) return {
    isAccepted: false,
    message: 'Speciality is required',
    field: 'speciality'
  };
  if (!Array.isArray(speciality)) return {
    isAccepted: false,
    message: 'Speciality must be a list',
    field: 'speciality'
  };
  if (speciality.length == 0) return {
    isAccepted: false,
    message: 'Speciality must be atleast one',
    field: 'speciality'
  };
  if (!checkSpeciality(speciality)) return {
    isAccepted: false,
    message: 'Invalid speciality format',
    field: 'speciality'
  };
  return {
    isAccepted: true,
    message: 'data is valid',
    data: userData
  };
};

var updateUserEmail = function updateUserEmail(userData) {
  var email = userData.email;
  if (!email) return {
    isAccepted: false,
    message: 'email is required',
    field: 'email'
  };
  if (!utils.isEmailValid(email)) return {
    isAccepted: false,
    message: 'invalid email formate',
    field: 'email'
  };
  return {
    isAccepted: true,
    message: 'data is valid',
    data: userData
  };
};

var updateUserPassword = function updateUserPassword(userData) {
  var password = userData.password;
  if (!password) return {
    isAccepted: false,
    message: 'password is required',
    field: 'password'
  };
  if (typeof password != 'string') return {
    isAccepted: false,
    message: 'invalid password formate',
    field: 'password'
  };
  return {
    isAccepted: true,
    message: 'data is valid',
    data: userData
  };
};

var verifyAndUpdateUserPassword = function verifyAndUpdateUserPassword(userData) {
  var newPassword = userData.newPassword,
      currentPassword = userData.currentPassword;
  if (!newPassword) return {
    isAccepted: false,
    message: 'new password is required',
    field: 'newPassword'
  };
  if (typeof newPassword != 'string') return {
    isAccepted: false,
    message: 'invalid new password format',
    field: 'newPassword'
  };
  if (!currentPassword) return {
    isAccepted: false,
    message: 'current password is required',
    field: 'currentPassword'
  };
  if (typeof currentPassword != 'string') return {
    isAccepted: false,
    message: 'invalid current password format',
    field: 'currentPassword'
  };
  return {
    isAccepted: true,
    message: 'data is valid',
    data: userData
  };
};

module.exports = {
  updateUser: updateUser,
  updateUserEmail: updateUserEmail,
  updateUserPassword: updateUserPassword,
  verifyAndUpdateUserPassword: verifyAndUpdateUserPassword,
  updateUserSpeciality: updateUserSpeciality
};