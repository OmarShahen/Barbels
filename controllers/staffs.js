const config = require('../config/config')
const staffValidation = require('../validations/staffs')
const ClubModel = require('../models/ClubModel')
const StaffModel = require('../models/StaffModel')
const RegistrationModel = require('../models/RegistrationModel')
const bcrypt = require('bcrypt')
const utils = require('../utils/utils')

const addClubOwner = async (request, response) => {

    try {

        const dataValidation = staffValidation.staffData(request.body)

        if(!dataValidation.isAccepted) {
            return response.status(400).json({
                message: dataValidation.message,
                field: dataValidation.field
            })
        }

        const { clubId, name, email, phone, countryCode, password } = request.body

        const club = await ClubModel.findById(clubId)

        if(!club) {
            return response.status(404).json({
                message: 'club Id does not exist',
                field: 'clubId'
            })
        }

        const emailList = await StaffModel.find({ clubId, email })

        if(emailList.length != 0) {
            return response.status(400).json({
                message: 'email is already registered',
                field: 'email'
            })
        }

        const phoneList = await StaffModel.find({ clubId, phone, countryCode })

        if(phoneList.length != 0) {
            return response.status(400).json({
                message: 'phone is already registered',
                field: 'phone'
            })
        }

        const owner = {
            clubId,
            name,
            email,
            phone,
            countryCode,
            password: bcrypt.hashSync(password, config.SALT_ROUNDS),
            role: 'OWNER'
        }       
        
        const ownerObj = new StaffModel(owner)
        const newOwner = await ownerObj.save()

        return response.status(200).json({
            message: `${name} is added successfully as club owner`,
            newOwner
        })

    } catch(error) {
        console.error(error)
        return response.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const addStaff = async (request, response) => {

    try {


        const dataValidation = staffValidation.staffData(request.body)

        if(!dataValidation.isAccepted) {
            return response.status(400).json({
                message: dataValidation.message,
                field: dataValidation.field
            })
        }

        const { clubId, name, email, phone, countryCode, password } = request.body

        const club = await ClubModel.findById(clubId)

        if(!club) {
            return response.status(404).json({
                message: 'club Id does not exist',
                field: 'clubId'
            })
        }

        if(email) {
            
            const emailList = await StaffModel.find({ email, isAccountActive: true })

            if(emailList.length != 0) {
                return response.status(400).json({
                    message: 'email is already registered',
                    field: 'email'
                })
            }
        }

        const phoneList = await StaffModel.find({ phone, countryCode, isAccountActive: true })

        if(phoneList.length != 0) {
            return response.status(400).json({
                message: 'phone is already registered',
                field: 'phone'
            })
        }

        const closedAccountsList = await StaffModel
        .find({ clubId, phone, countryCode, isAccountActive: false })

        if(closedAccountsList.length != 0) {
            return response.status(400).json({
                message: 'staff account is already registered in the club but closed',
                field:'staffId'
            })
        }

        const staff = {
            clubId,
            name,
            email,
            phone,
            countryCode,
            password: bcrypt.hashSync(password, config.SALT_ROUNDS),
            role: 'STAFF'
        }       
        
        const staffObj = new StaffModel(staff)
        const newStaff = await staffObj.save()

        return response.status(200).json({
            message: `${name} is added successfully as club staff`,
            newStaff
        })

    } catch(error) {
        console.error(error)
        return response.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const getStaffs = async (request, response) => {

    try {

        const { clubId } = request.params

        if(!utils.isObjectId(clubId)) {
            return response.status(400).json({
                message: 'invalid club Id formate',
                field: 'clubId'
            })
        }

        const staffs = await StaffModel
        .find({ clubId, role: 'STAFF' })
        .sort({ createdAt: -1 })

        return response.status(200).json({
            staffs
        })

    } catch(error) {
        console.error(error)
        return response.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const updateStaff = async (request, response) => {

    try {

        const dataValidation = staffValidation.updateStaffData(request.body)

        if(!dataValidation.isAccepted) {
            return response.status(400).json({
                message: dataValidation.message,
                field: dataValidation.field
            })
        }

        const { staffId } = request.params
        const { name, email, countryCode, phone } = request.body

        const staff = await StaffModel.findById(staffId)

        if(email && staff.email != email) {

            const emailList = await StaffModel
            .find({ email, isAccountActive: true })

            if(emailList.length != 0) {
                return response.status(400).json({
                    message: 'email is already registered',
                    field: 'email'
                })
            }
        }

        if(countryCode == staff.countryCode && staff.phone != phone) {

            const phoneList = await StaffModel
            .find({ phone, countryCode, isAccountActive: true })

            if(phoneList.length != 0) {
                return response.status(400).json({
                    message: 'phone is already registered',
                    field: 'phone'
                })
            }
        }


        let newStaff

        if(email) {
            newStaff = { name, email, countryCode, phone }
        } else {
            newStaff = { name, countryCode, phone }
        }

        const updatedStaff = await StaffModel
        .findByIdAndUpdate(
            staffId,
            newStaff,
            { new: true }
        )
        
        updatedStaff.password = null

        return response.status(200).json({
            message: 'staff member is updated successfully',
            staff: updatedStaff
        })

    } catch(error) {
        console.error(error)
        return response.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const deleteStaff = async (request, response) => {

    try {

        const { staffId } = request.params

        const registrationList = await RegistrationModel
        .find({ staffId })

        if(registrationList.length != 0) {
            return response.status(400).json({
                message: 'this staff member is registered in some members registrations',
                field: 'staffId'
            })
        }

        const deletedStaff = await StaffModel
        .findByIdAndDelete(staffId)

        return response.status(200).json({
            message: 'staff is deleted successfully',
            staff: deletedStaff
        })

    } catch(error) {
        console.error(error)
        return response.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const updateStaffStatus = async (request, response) => {

    try {

        const { staffId } = request.params
        const { isAccountActive } = request.body


        if(typeof isAccountActive != 'boolean') {
            return response.status(400).json({
                message: 'staff status must be boolean',
                field: 'isAccountActive'
            })
        }

        const staff = await StaffModel.findById(staffId)

        if(!staff.isAccountActive && isAccountActive == true) {

            const staffList = await StaffModel
            .find({ countryCode: staff.countryCode, phone: staff.phone, isAccountActive: true })

            if(staffList.length != 0) {
                return response.status(400).json({
                    message: 'this staff account is used in another club',
                    field: 'staffId'
                })
            }
        }

        const updatedStaff = await StaffModel
        .findByIdAndUpdate(
            staffId,
            { isAccountActive },
            { new: true }
        )

        return response.status(200).json({
            message: 'staff status is updated successfully',
            staff: updatedStaff
        })

    } catch(error) {
        console.error(error)
        return response.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const deleteStaffAndRelated = async (request, response) => {

    try {

        const { staffId } = request.params

        const deletedRegistrations = await RegistrationModel
        .deleteMany({ staffId })

        const deletedStaff = await StaffModel
        .findByIdAndDelete(staffId)

        return response.status(200).json({
            message: 'staff deleted successfully and all related data',
            staff: deletedStaff,
            deletedRegistrations: deletedRegistrations.deletedCount
        })

    } catch(error) {
        console.error(error)
        return response.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

module.exports = { 
    addClubOwner, 
    addStaff, 
    getStaffs, 
    updateStaff, 
    deleteStaff, 
    updateStaffStatus,
    deleteStaffAndRelated
 }