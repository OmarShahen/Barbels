const mongoose = require('mongoose')
const ClubModel = require('../models/ClubModel')
const RegistrationModel = require('../models/RegistrationModel')
const MemberModel = require('../models/MemberModel')
const StaffModel = require('../models/StaffModel')
const PackageModel = require('../models/PackageModel')
const registrationValidation = require('../validations/registrations')
const utils = require('../utils/utils')


const addRegistration = async (request, response) => {

    try {

        const dataValidation = registrationValidation.registrationData(request.body)

        if(!dataValidation.isAccepted) {
            return response.status(400).json({
                message: dataValidation.message,
                field: dataValidation.field
            })
        }

        const { clubId, memberId, staffId, packageId, paid } = request.body

        const [clubsList, membersList, staffsList, packagesList] = await Promise.all([
            ClubModel.find({ _id: clubId }),
            MemberModel.find({ _id: memberId, clubId }),
            StaffModel.find({ _id: staffId, clubId }),
            PackageModel.find({ _id: packageId, clubId, isOpen: true })
        ])

        if(clubsList.length == 0) {
            return response.status(404).json({
                message: 'club Id does not exist',
                field: 'clubId'
            })
        }

        if(membersList.length == 0) {
            return response.status(400).json({
                message: 'member Id does not exist',
                field: 'memberId'
            })
        }

        if(membersList[0].isBlocked == true) {
            return response.status(400).json({
                message: 'member is blocked',
                field: 'memberId'
            })
        }

        if(staffsList.length == 0) {
            return response.status(400).json({
                message: 'staff Id does not exist',
                field: 'staffId'
            })
        }

        console.log(packagesList)

        if(packagesList.length == 0) {
            return response.status(400).json({
                message: 'package Id does not exist',
                field: 'packageId'
            })
        }

        const memberActivePackagesList = await RegistrationModel
        .find({ clubId, memberId, isActive: true })

        if(memberActivePackagesList.length != 0) {
            return response.status(400).json({
                message: 'member is already registered in a package',
                field: 'memberId'
            })
        }

        const package = packagesList[0]
        const registrationDate = new Date()
        const expiresAt = utils.calculateExpirationDate(registrationDate, package.expiresIn)

        let isActive = true

        if(package.attendance == 1) {
            isActive = false
        }

        const newRegistrationData = {
            clubId,
            memberId,
            staffId,
            packageId,
            expiresAt,
            paid,
            attended: 1,
            attendances: [
                { staffId, attendanceDate: new Date() }
            ],
            isActive
        }

        const registrationObj = new RegistrationModel(newRegistrationData)
        const newRegistration = await registrationObj.save()
            
        return response.status(200).json({
            message: 'registered to package successfully',
            newRegistration
        })

    } catch(error) {
        console.error(error)
        return response.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const getRegistrations = async (request, response) => {

    try {

        const { clubId } = request.params
        const { status } = request.query

        if(!utils.isObjectId(clubId)) {
            return response.status(400).json({
                message: 'invalid club Id formate',
                field: 'clubId'
            })
        }

        let registrations

        if(status == 'active') {

            registrations = await RegistrationModel
            .find({ clubId, isActive: true })
            .sort({ createdAt: -1 })

        } else if(status == 'expired') {

            registrations = await RegistrationModel
            .find({ clubId, isActive: false })
            .sort({ createdAt: -1 })

        } else {

            registrations = await RegistrationModel
            .find({ clubId })
            .sort({ createdAt: -1 })

        }

        return response.status(200).json({
            registrations
        })

    } catch(error) {
        console.log(error)
        return response.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const getMemberRegistrations = async (request, response) => {

    try {

        const { clubId, memberId } = request.params

        const memberList = await MemberModel.find({ _id: memberId, clubId })

        if(memberList.length == 0) {
            return response.status(404).json({
                message: 'member does not exist',
                field: 'member'
            })
        }

        const memberRegistrations = await RegistrationModel.aggregate([
            {
                $match: {
                    memberId: mongoose.Types.ObjectId(memberId)
                }
            },
            {
                $lookup: {
                    from: 'members',
                    localField: 'memberId',
                    foreignField: '_id',
                    as: 'member'
                }
            },
            {
                $lookup: {
                    from: 'staffs',
                    localField: 'staffId',
                    foreignField: '_id',
                    as: 'staff'
                }
            },
            {
                $lookup: {
                    from: 'packages',
                    localField: 'packageId',
                    foreignField: '_id',
                    as: 'package'
                }
            },
            {
                $project: {
                    memberId: 0,
                    staffId: 0,
                    packageId: 0,
                    'staff.password': 0
                }
            },
            {
                $sort: { createdAt: -1 }
            }

        ])

        
        return response.status(200).json({
            memberRegistrations
        })

    } catch(error) {
        console.error(error)
        return response.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const updateMemberAttendance = async (request, response) => {

    try {

        const { registrationId, staffId } = request.params

        const registrationList = await RegistrationModel.find({ _id: registrationId })

        const registration = registrationList[0]

        const member = await MemberModel.findById(registration.memberId)

        if(member.isBlocked) {
            return response.status(400).json({
                message: 'member is blocked',
                field: 'memberId'
            })
        }

        if(!registration.isActive) {
            return response.status(400).json({
                message: 'member registered package expired',
                field: 'registrationId'
            })
        }

        const currentDate = new Date()

        if(registration.expiresAt < currentDate) {
            
            const updatedRegistration = await RegistrationModel
            .findByIdAndUpdate(registrationId, { isActive: false }, { new: true })

            return response.status(400).json({
                message: 'member registration expired',
                registration: updatedRegistration,
                field: 'registrationId'
            })
        }

        const registeredPackageList = await PackageModel.find({ _id: registration.packageId })

        const MEMBER_CURRENT_ATTENDANCE = registration.attended
        const PACKAGE_ATTENDANCE = registeredPackageList[0].attendance
        const NEW_ATTENDANCE = MEMBER_CURRENT_ATTENDANCE + 1

        let updatedRegistration
        let newAttendance = { staffId, attendanceDate: new Date() }

        if(PACKAGE_ATTENDANCE == NEW_ATTENDANCE) {
            
            updatedRegistration = await RegistrationModel
            .findByIdAndUpdate(registrationId, { attended: NEW_ATTENDANCE, $push: { attendances: newAttendance }, isActive: false }, { new: true })
        
        } else {

            updatedRegistration = await RegistrationModel
            .findByIdAndUpdate(registrationId, { attended: NEW_ATTENDANCE, $push: { attendances: newAttendance } }, { new: true })
 
        }

        return response.status(200).json({
            message: 'updated attendance successfully',
            registration: updatedRegistration
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
    addRegistration, 
    getMemberRegistrations, 
    updateMemberAttendance, 
    getRegistrations,
}