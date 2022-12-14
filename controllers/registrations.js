const mongoose = require('mongoose')
const ClubModel = require('../models/ClubModel')
const RegistrationModel = require('../models/RegistrationModel')
const MemberModel = require('../models/MemberModel')
const StaffModel = require('../models/StaffModel')
const PackageModel = require('../models/PackageModel')
const AttendanceModel = require('../models/AttendanceModel')
const CancelledRegistrationsModel = require('../models/CancelledRegistrationModel')
const FreezeRegistrationModel = require('../models/FreezeRegistrationModel')
const ChainOwnerModel = require('../models/ChainOwnerModel')
const InstallmentModel = require('../models/InstallmentModel')
const registrationValidation = require('../validations/registrations')
const statsValidation = require('../validations/stats')
const utils = require('../utils/utils')
const translations = require('../i18n/index')
const PaymentModel = require('../models/paymentModel')


const addRegistration = async (request, response) => {

    try {

        const { lang } = request.query

        const dataValidation = registrationValidation.registrationData(request.body)
        if(!dataValidation.isAccepted) {
            return response.status(400).json({
                accepted: false,
                message: dataValidation.message,
                field: dataValidation.field
            })
        }

        const { clubId, memberId, staffId, packageId, paid, isInstallment } = request.body

        const [clubsList, membersList, staffsList, packagesList] = await Promise.all([
            ClubModel.find({ _id: clubId }),
            MemberModel.find({ _id: memberId, clubId }),
            StaffModel.find({ _id: staffId, clubId }),
            PackageModel.find({ _id: packageId, clubId, isActive: true })
        ])

        if(clubsList.length == 0) {
            return response.status(404).json({
                accepted: false,
                message: 'club Id does not exist',
                field: 'clubId'
            })
        }

        if(membersList.length == 0) {
            return response.status(400).json({
                accepted: false,
                message: 'member Id does not exist',
                field: 'memberId'
            })
        }

        if(membersList[0].isBlocked == true) {
            return response.status(400).json({
                accepted: false,
                message: translations[lang]['member is blocked'],
                field: 'memberId'
            })
        }

        if(staffsList.length == 0) {
            return response.status(400).json({
                accepted: false,
                message: 'staff Id does not exist',
                field: 'staffId'
            })
        }

        if(staffsList[0].isAccountActive == false) {
            return response.status(401).json({
                accepted: false,
                message: 'staff account is not active',
                field: 'staffId'
            })
        }

        if(packagesList.length == 0) {
            return response.status(400).json({
                accepted: false,
                message: translations[lang]['package Id does not exist'],
                field: 'packageId'
            })
        }

        const memberPackage = packagesList[0]
        if(!memberPackage.isOpen) {
            return response.status(400).json({
                accepted: false,
                message: translations[lang]['Package is closed'],
                field: 'packageId'
            })
        }

        const memberActivePackagesList = await RegistrationModel
        .find({ clubId, memberId, isActive: true })

        if(memberActivePackagesList.length != 0) {
            return response.status(400).json({
                accepted: false,
                message: translations[lang]['Member is already registered in a package'],
                field: 'memberId'
            })
        }

        const package = packagesList[0]
        const registrationDate = new Date()
        const expiresAt = utils.calculateExpirationDate(registrationDate, package.expiresIn)

        let isActive = true
        let isPaidFull = true
        let packagePrice = packagesList[0].price

        if(package.attendance == 1) {
            isActive = false
        }

        if(isInstallment == true && packagePrice > paid) {
            isPaidFull = false
        }

        const newRegistrationData = {
            clubId,
            memberId,
            staffId,
            packageId,
            expiresAt,
            paid: Number.parseFloat(paid),
            originalPrice: packagePrice,
            attended: 1,
            isInstallment,
            isActive,
            isPaidFull
        }

        const registrationObj = new RegistrationModel(newRegistrationData)
        const newRegistration = await registrationObj.save()

        const newAttendanceData = {
            clubId,
            staffId,
            packageId,
            memberId,
            registrationId: newRegistration._id
        }

        const attendanceObj = new AttendanceModel(newAttendanceData)
        const newAttendance = await attendanceObj.save()

        let newInstallment = {}

        if(newRegistration.isInstallment) {

            const installmentData = {
               clubId: newRegistration.clubId,
               staffId: newRegistration.staffId,
               memberId: newRegistration.memberId,
               packageId: newRegistration.packageId,
               registrationId: newRegistration._id,
               paid: newRegistration.paid 
            }

            const installmentObj = new InstallmentModel(installmentData)
            newInstallment = await installmentObj.save()
        }

        return response.status(200).json({
            accepted: true,
            message: 'registered to package successfully',
            registration: newRegistration,
            attendance: newAttendance,
            installment: newInstallment
        })

    } catch(error) {
        console.error(error)
        return response.status(500).json({
            accepted: false,
            message: 'internal server error',
            error: error.message
        })
    }
}

const addCustomRegistration = async (request, response) => {

    try {

        const { lang } = request.query

        const dataValidation = registrationValidation.customRegistrationData(request.body)
        if(!dataValidation.isAccepted) {
            return response.status(400).json({
                accepted: false,
                message: dataValidation.message,
                field: dataValidation.field
            })
        }

        const { clubId, memberId, staffId, packageId, paid, registrationDate } = request.body

        const [clubsList, membersList, staffsList, packagesList] = await Promise.all([
            ClubModel.find({ _id: clubId }),
            MemberModel.find({ _id: memberId, clubId }),
            StaffModel.find({ _id: staffId, clubId }),
            PackageModel.find({ _id: packageId, clubId, isActive: true })
        ])

        if(clubsList.length == 0) {
            return response.status(404).json({
                accepted: false,
                message: 'club Id does not exist',
                field: 'clubId'
            })
        }

        if(membersList.length == 0) {
            return response.status(400).json({
                accepted: false,
                message: 'member Id does not exist',
                field: 'memberId'
            })
        }

        if(membersList[0].isBlocked == true) {
            return response.status(400).json({
                accepted: false,
                message: translations[lang]['member is blocked'],
                field: 'memberId'
            })
        }

        if(staffsList.length == 0) {
            return response.status(400).json({
                accepted: false,
                message: 'staff Id does not exist',
                field: 'staffId'
            })
        }

        if(staffsList[0].isAccountActive == false) {
            return response.status(401).json({
                accepted: false,
                message: 'staff account is not active',
                field: 'staffId'
            })
        }

        if(packagesList.length == 0) {
            return response.status(400).json({
                accepted: false,
                message: translations[lang]['package Id does not exist'],
                field: 'packageId'
            })
        }

        const memberPackage = packagesList[0]
        if(!memberPackage.isOpen) {
            return response.status(400).json({
                accepted: false,
                message: translations[lang]['Package is closed'],
                field: 'packageId'
            })
        }


        const package = packagesList[0]
        const memberRegistrationDate = new Date(registrationDate)
        const expiresAt = utils.calculateExpirationDate(memberRegistrationDate, package.expiresIn)

        let isActive = true
        let isPaidFull = true
        const packagePrice = package.price
        const todayDate = new Date()

        if(package.attendance == 1 || expiresAt < todayDate) {
            isActive = false
        }


        const newRegistrationData = {
            clubId,
            memberId,
            staffId,
            packageId,
            expiresAt,
            paid: Number.parseFloat(paid),
            originalPrice: packagePrice,
            attended: 0,
            isInstallment: false,
            isActive,
            isPaidFull,
            createdAt: new Date(registrationDate)
        }

        const registrationObj = new RegistrationModel(newRegistrationData)
        const newRegistration = await registrationObj.save()

        return response.status(200).json({
            accepted: true,
            message: 'Registered to package successfully',
            registration: newRegistration
        })

    } catch(error) {
        console.error(error)
        return response.status(500).json({
            accepted: false,
            message: 'internal server error',
            error: error.message
        })
    }
}

const deleteRegistration = async (request, response) => {

    try {

        const { registrationId } = request.params

        const deletedRegistration = await RegistrationModel.findByIdAndDelete(registrationId)

        return response.status(200).json({
            accepted: true,
            message: 'Deleted registration successfully',
            registration: deletedRegistration
        })

    } catch(error) {
        console.error(error)
        return response.status(500).json({
            accepted: false,
            message: 'internal server error',
            error: error.message
        })
    }
}

const updateRegistrationAttendance = async (request, response) => {

    try {

        const { registrationId } = request.params
        const { attendance } = request.body

        if(typeof attendance != 'number') {
            return response.status(400).json({
                accepted: false,
                message: 'Attendance must be a number',
                field: 'attendance'
            })
        }

        const registration = await RegistrationModel
        .findByIdAndUpdate(registrationId, { attended: attendance }, { new: true })

        return response.status(200).json({
            accepted: true,
            message: 'updated attendance successfully',
            registration
        })

    } catch(error) {
        console.error(error)
        return response.status(500).json({
            accepted: false,
            message: 'internal server error',
            error: error.message
        })
    }
}

const checkAddRegistrationData = async (request, response) => {

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
            PackageModel.find({ _id: packageId, clubId, isActive: true })
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
                message: translations[lang]['Member is blocked'],
                field: 'memberId'
            })
        }

        if(staffsList.length == 0) {
            return response.status(400).json({
                message: 'staff Id does not exist',
                field: 'staffId'
            })
        }

        if(staffsList[0].isAccountActive == false) {
            return response.status(401).json({
                message: 'staff account is not active',
                field: 'staffId'
            })
        }

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
                message: 'Member is already registered in a package',
                field: 'memberId'
            })
        }


        return response.status(200).json({
            message: 'registration data is valid'
        })

    } catch(error) {
        console.error(error)
        return response.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const getClubRegistrations = async (request, response) => {

    try {

        const { clubId } = request.params
        const { status } = request.query
        let { searchQuery } = utils.statsQueryGenerator('clubId', clubId, request.query)

        if(!utils.isObjectId(clubId)) {
            return response.status(400).json({
                accepted: false,
                message: 'invalid club Id formate',
                field: 'clubId'
            })
        }

        const currentDate = new Date()

        if(status == 'active') {
            searchQuery.isActive = true
            searchQuery.expiresAt = { $gt: currentDate }
        } else if(status == 'expired') {
            searchQuery.isActive = false
            searchQuery.expiresAt = { $lte: currentDate }
        }

        const registrations = await RegistrationModel.aggregate([
            {
                $match: searchQuery
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
                $sort: { createdAt: -1 }
            },
            {
                $project: {
                    'member.canAuthenticate': 0,
                    'member.QRCodeURL': 0,
                    'member.updatedAt': 0,
                    'member.__v': 0,
                    'staff.password': 0,
                    'staff.updatedAt': 0,
                    'staff.__v': 0,
                    'package.updatedAt': 0,
                    'package.__v': 0
                }
            }
        ]) 

        registrations.forEach(registration => {6
            registration.staff = registration.staff[0]
            registration.member = registration.member[0]
            registration.package = registration.package[0]

            if(registration.expiresAt <= currentDate) {
                registration.isActive = false
            }

        })

        return response.status(200).json({
            accepted: true,
            registrations
        })

    } catch(error) {
        console.log(error)
        return response.status(500).json({
            accepted: false,
            message: 'internal server error',
            error: error.message
        })
    }
}

const getClubRegistrationsWithInstallments = async (request, response) => {

    try {

        const { clubId } = request.params
        let { searchQuery } = utils.statsQueryGenerator('clubId', clubId, request.query)
        searchQuery.isInstallment = true
        const currentDate = new Date()

        if(!utils.isObjectId(clubId)) {
            return response.status(400).json({
                accepted: false,
                message: 'invalid club Id formate',
                field: 'clubId'
            })
        }

        const registrations = await RegistrationModel.aggregate([
            {
                $match: searchQuery
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
                $sort: { createdAt: -1 }
            },
            {
                $project: {
                    'member.canAuthenticate': 0,
                    'member.QRCodeURL': 0,
                    'member.updatedAt': 0,
                    'member.__v': 0,
                    'staff.password': 0,
                    'staff.updatedAt': 0,
                    'staff.__v': 0,
                    'package.updatedAt': 0,
                    'package.__v': 0
                }
            }
        ]) 

        registrations.forEach(registration => {6
            registration.staff = registration.staff[0]
            registration.member = registration.member[0]
            registration.package = registration.package[0]

            if(registration.expiresAt <= currentDate) {
                registration.isActive = false
            }
        })

        const totalRegistrations = registrations.length
        const totalPaidRegistrations = registrations.filter(registration => registration.isPaidFull).length
        const totalUnpaidRegistrations = totalRegistrations - totalPaidRegistrations

        const totalRegistrationsOriginalPrice = utils.calculateTotalByKey(registrations, 'originalPrice')
        const totalPaidRegistrationsMoney = utils.calculateTotalByKey(registrations, 'paid')
        const totalUnpaidRegistrationsMoney = totalRegistrationsOriginalPrice - totalPaidRegistrationsMoney

        return response.status(200).json({
            accepted: true,
            totalRegistrations,
            totalPaidRegistrations,
            totalUnpaidRegistrations,
            totalRegistrationsOriginalPrice,
            totalPaidRegistrationsMoney,
            totalUnpaidRegistrationsMoney,
            registrations
        })

    } catch(error) {
        console.log(error)
        return response.status(500).json({
            accepted: false,
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
                accepted: false,
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
            accepted: true,
            memberRegistrations
        })

    } catch(error) {
        console.error(error)
        return response.status(500).json({
            accepted: false,
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
const getClubRegistrationsStatsByDate = async (request, response) => {

    try {

        const dataValidation = statsValidation.statsDates(request.query)

        if(!dataValidation.isAccepted) {
            return response.status(400).json({
                message: dataValidation.message,
                field: dataValidation.field
            })
        }

        const { clubId } = request.params
        const { specific, until, to } = request.query

        const { searchQuery, toDate } = utils.statsQueryGenerator('clubId', clubId, request.query)

        const growthUntilDate = utils.growthDatePicker(until, to, specific)
        const growthQuery = utils.statsQueryGenerator('clubId', clubId, { until: growthUntilDate })

        const registrationsPromise = RegistrationModel.aggregate([
            {
                $match: searchQuery
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
                $sort: {
                    createdAt: -1
                }
            },
            {
                $project: {
                    'member.canAuthenticate': 0,
                    'member.QRCodeURL': 0,
                    'member.updatedAt': 0,
                    'member.__v': 0,
                    'staff.password': 0,
                    'staff.updatedAt': 0,
                    'staff.__v': 0,
                    'package.updatedAt': 0,
                    'package.__v': 0
                }
            }
        ])

        const registrationsStatsGrowthPromise = RegistrationModel.aggregate([
            {
                $match: growthQuery.searchQuery
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            }
        ])

        const registrationsStatsMonthsPromise = RegistrationModel.aggregate([
            {
                $match: searchQuery
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%m', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            }
        ])

        const cancelledRegistrationsPromise = CancelledRegistrationsModel.find(searchQuery)

        const freezedRegistrationsPromise = FreezeRegistrationModel.find(searchQuery)


        let [
            registrations, 
            registrationsStatsGrowth, 
            registrationsStatsMonths,
            cancelledRegistrations, 
            freezedRegistrations
        ] = await Promise.all([
            registrationsPromise,
            registrationsStatsGrowthPromise,
            registrationsStatsMonthsPromise,
            cancelledRegistrationsPromise,
            freezedRegistrationsPromise
        ])

        registrations.forEach(registration => {
            registration.staff = registration.staff[0]
            registration.member = registration.member[0]
            registration.package = registration.package[0]
        })

        const totalRegistrations = registrations.length
        const totalEarnings = utils.calculateRegistrationsTotalEarnings(registrations)

        const totalCancelledRegistrations = cancelledRegistrations.length
        const totalFreezedRegistrations = freezedRegistrations.length

        const activeRegistrations = registrations.filter(registration => registration.isActive == true)
        const totalActiveRegistrations = activeRegistrations.length

        const expiredRegistrations = registrations
        .filter(registration => {
            if(registration.expiresAt <= toDate || registration.isActive == false) {
                registration.isActive = false
                return registration
            }
        })
        const totalExpiredRegistrations = expiredRegistrations.length

        registrationsStatsGrowth.sort((month1, month2) => new Date(month1._id) - new Date(month2._id))


        registrationsStatsMonths = utils.joinMonths(registrationsStatsMonths)

        registrationsStatsMonths.sort((month1, month2) => Number.parseInt(month1._id) - Number.parseInt(month2._id))

        const expirationStats = utils.calculateCompletedPackageAttendances(expiredRegistrations)

        let completedPackageAttendance = ((expirationStats.completedAttendance / expirationStats.total) * 100).toFixed(2)
        let incompletedPackageAttendance = ((expirationStats.incompletedAttendance/ expirationStats.total) * 100).toFixed(2)


        const registrationCompletionStat = {
            completedRegistrationAttendancePercentage: String(completedPackageAttendance) != 'NaN' ? Math.round(Number.parseFloat(completedPackageAttendance)) : 0,
            completedRegistrationAttendance: expirationStats.completedAttendance,
            incompleteRegistrationAttendancePercentage: String(incompletedPackageAttendance) != 'NaN' ? Math.round(Number.parseFloat(incompletedPackageAttendance)) : 0,
            incompleteRegistrationAttendance: expirationStats.incompletedAttendance,
            total: expirationStats.total
        }


        return response.status(200).json({
            registrationCompletionStat,
            registrationsStatsMonths,
            registrationsStatsGrowth,
            totalRegistrations,
            totalEarnings,
            totalCancelledRegistrations,
            totalFreezedRegistrations,
            totalActiveRegistrations,
            totalExpiredRegistrations,
            registrations,
        })

    } catch(error) {
        console.error(error)
        return response.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const getClubRegistrationsDataJoined = async (request, response) => {

    try {

        const { clubId } = request.params
        let { searchQuery } = utils.statsQueryGenerator('clubId', clubId, request.query)

        const registrations  = await RegistrationModel.aggregate([
            {
                $match: searchQuery
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
                    'member.canAuthenticate': 0,
                    'member.QRCodeURL': 0,
                    'member.updatedAt': 0,
                    'member.__v': 0,
                    'staff.password': 0,
                    'staff.updatedAt': 0,
                    'staff.__v': 0,
                    'package.updatedAt': 0,
                    'package.__v': 0
                }
            },
            {
                $sort: {
                    createdAt: -1,
                    active: 1
                }
            }
        ])


        return response.status(200).json({
            registrations
        })

    } catch(error) {
        console.error(error)
        return response.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const getRegistrationsByOwner = async (request, response) => {

    try {

        const { ownerId } = request.params

        const owner = await ChainOwnerModel.findById(ownerId)

        const clubs = owner.clubs
        const { searchQuery } = utils.statsQueryGenerator('clubId', clubs, request.query)

        const registrations = await RegistrationModel.aggregate([
            {
                $match: searchQuery
            },
            {
                $lookup: {
                    from: 'clubs',
                    localField: 'clubId',
                    foreignField: '_id',
                    as: 'club'
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
                $sort: { createdAt: -1 }
            },
            {
                $project: {
                    password: 0,
                    updatedAt: 0,
                    __v: 0,
                    'club.updatedAt': 0,
                    'club.__v': 0
                }
            }
        ])

        registrations.forEach(registration => {
            registration.club = registration.club[0]
            registration.member = registration.member[0]
            registration.staff = registration.staff[0]
            registration.package = registration.package[0]
        })

        return response.status(200).json({
            registrations
        })

    } catch(error) {
        console.error(error)
        return response.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const getChainOwnerRegistrationsStatsByDate = async (request, response) => {

    try {

        const dataValidation = statsValidation.statsDates(request.query)

        if(!dataValidation.isAccepted) {
            return response.status(400).json({
                message: dataValidation.message,
                field: dataValidation.field
            })
        }

        const { ownerId } = request.params

        const owner = await ChainOwnerModel.findById(ownerId)

        const clubs = owner.clubs

        const { searchQuery, toDate, specific, until } = utils.statsQueryGenerator('clubId', clubs, request.query)

        const growthUntilDate = utils.growthDatePicker(until, toDate, specific)
        const growthQuery = utils.statsQueryGenerator('clubId', clubs, { until: growthUntilDate })


        const registrationsPromise = RegistrationModel.aggregate([
            {
                $match: searchQuery
            },
            {
                $lookup: {
                    from: 'clubs',
                    localField: 'clubId',
                    foreignField: '_id',
                    as: 'club'
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
                    'member.canAuthenticate': 0,
                    'member.QRCodeURL': 0,
                    'member.updatedAt': 0,
                    'member.__v': 0,
                    'staff.password': 0,
                    'staff.updatedAt': 0,
                    'staff.__v': 0,
                    'package.updatedAt': 0,
                    'package.__v': 0
                }
            }
        ])

        const registrationsStatsGrowthPromise = RegistrationModel.aggregate([
            {
                $match: growthQuery.searchQuery
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            }
        ])

        const registrationsStatsMonthsPromise = RegistrationModel.aggregate([
            {
                $match: searchQuery
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%m', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            }
        ])

        const clubsRegistrationsStatsPromise = RegistrationModel.aggregate([
            {
                $match: searchQuery
            },
            {
                $group: {
                    _id: '$clubId',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'clubs',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'club'
                }
            }
        ])

        const cancelledRegistrationsPromise = CancelledRegistrationsModel.find(searchQuery)

        const freezedRegistrationsPromise = FreezeRegistrationModel.find(searchQuery)


        let [
            registrations, 
            registrationsStatsGrowth, 
            registrationsStatsMonths,
            clubsRegistrationsStats, 
            cancelledRegistrations, 
            freezedRegistrations
        ] = await Promise.all([
            registrationsPromise,
            registrationsStatsGrowthPromise,
            registrationsStatsMonthsPromise,
            clubsRegistrationsStatsPromise,
            cancelledRegistrationsPromise,
            freezedRegistrationsPromise
        ])

        registrations.forEach(registration => {
            registration.club = registration.club[0]
            registration.staff = registration.staff[0]
            registration.member = registration.member[0]
            registration.package = registration.package[0]
        })

        const totalRegistrations = registrations.length
        const totalEarnings = utils.calculateRegistrationsTotalEarnings(registrations)

        const totalCancelledRegistrations = cancelledRegistrations.length
        const totalFreezedRegistrations = freezedRegistrations.length

        const activeRegistrations = registrations.filter(registration => registration.isActive == true)
        const totalActiveRegistrations = activeRegistrations.length

        const expiredRegistrations = registrations
        .filter(registration => registration.expiresAt <= toDate || registration.isActive == false)
        const totalExpiredRegistrations = expiredRegistrations.length

        registrationsStatsGrowth.sort((month1, month2) => new Date(month1._id) - new Date(month2._id))

        clubsRegistrationsStats.forEach(stat => stat.club = stat.club[0])

        registrationsStatsMonths = utils.joinMonths(registrationsStatsMonths)

        registrationsStatsMonths.sort((month1, month2) => Number.parseInt(month1._id) - Number.parseInt(month2._id))

        const expirationStats = utils.calculateCompletedPackageAttendances(expiredRegistrations)

        let completedPackageAttendance = ((expirationStats.completedAttendance / expirationStats.total) * 100).toFixed(2)
        let incompletedPackageAttendance = ((expirationStats.incompletedAttendance/ expirationStats.total) * 100).toFixed(2)


        const registrationCompletionStat = {
            completedRegistrationAttendancePercentage: String(completedPackageAttendance) != 'NaN' ? Math.round(Number.parseFloat(completedPackageAttendance)) : 0,
            completedRegistrationAttendance: expirationStats.completedAttendance,
            incompleteRegistrationAttendancePercentage: String(incompletedPackageAttendance) != 'NaN' ? Math.round(Number.parseFloat(incompletedPackageAttendance)) : 0,
            incompleteRegistrationAttendance: expirationStats.incompletedAttendance,
            total: expirationStats.total
        }


        return response.status(200).json({
            registrationCompletionStat,
            registrationsStatsMonths,
            registrationsStatsGrowth,
            totalRegistrations,
            totalEarnings,
            totalCancelledRegistrations,
            totalFreezedRegistrations,
            totalActiveRegistrations,
            totalExpiredRegistrations,
            clubsRegistrationsStats,
            registrations,
            activeRegistrations,
            expiredRegistrations,
        })

    } catch(error) {
        console.error(error)
        return response.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const getClubStaffsPayments = async (request, response) => {

    try {

        const dataValidation = statsValidation.statsDates(request.query)

        if(!dataValidation.isAccepted) {
            return response.status(400).json({
                message: dataValidation.message,
                field: dataValidation.field
            })
        }

        const { clubId } = request.params

        const registrationsSearchQuery = utils.statsQueryGenerator('clubId', clubId, request.query)
        registrationsSearchQuery.searchQuery.$or = [{ isInstallment: false }, { isInstallment: { $exists: false } }]

        const staffRegistrations = await RegistrationModel.aggregate([
            {
                $match: registrationsSearchQuery.searchQuery
            },
            {
                $group: {
                    _id: '$staffId',
                    count: { $sum: '$paid' }
                }
            },
            {
                $lookup: {
                    from: 'staffs',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'staff'
                }
            },
            {
                $project: {
                    'staff.password': 0,
                    'staff.updatedAt': 0,
                    'staff.__v': 0,
                }
            }
        ])

        const installmentsSearchQuery = utils.statsQueryGenerator('clubId', clubId, request.query)
        const staffInstallments = await InstallmentModel.aggregate([
            {
                $match: installmentsSearchQuery.searchQuery
            },
            {
                $group: {
                    _id: '$staffId',
                    count: { $sum: '$paid' }
                }
            },
            {
                $lookup: {
                    from: 'staffs',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'staff'
                }
            },
            {
                $project: {
                    'staff.password': 0,
                    'staff.updatedAt': 0,
                    'staff.__v': 0,
                }
            }
        ])

        const paymentsSearchQuery = utils.statsQueryGenerator('clubId', clubId, request.query)
        paymentsSearchQuery.searchQuery.type = 'EARN'

        const staffPayments = await PaymentModel.aggregate([
            {
                $match: paymentsSearchQuery.searchQuery
            },
            {
                $group: {
                    _id: '$staffId',
                    count: { $sum: '$total' }
                }
            },
            {
                $lookup: {
                    from: 'staffs',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'staff'
                }
            },
            {
                $project: {
                    'staff.password': 0,
                    'staff.updatedAt': 0,
                    'staff.__v': 0,
                }
            }
        ])

        const allPayments = [ ...staffRegistrations, ...staffPayments, ...staffInstallments ]
        const staffsIds = allPayments.map(payment => payment._id)

        let staffAllPayments = utils.calculateAndJoinStaffsPayments(utils.getUniqueIds(staffsIds), allPayments)

        const uniqueStaffs = utils.getUniqueIds(allPayments.map(payment => payment.staff[0]))
        staffAllPayments = utils.joinStaffIdsWithStaffObjects(staffAllPayments, uniqueStaffs)

        return response.status(200).json({
            staffPaymentsOther: staffPayments,
            staffPayments: staffAllPayments,
        })

    } catch(error) {
        console.error(error)
        return response.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const getClubStaffsRegistrationsPayments = async (request, response) => {

    try {

        const dataValidation = statsValidation.statsDates(request.query)

        if(!dataValidation.isAccepted) {
            return response.status(400).json({
                message: dataValidation.message,
                field: dataValidation.field
            })
        }

        const { clubId } = request.params

        const registrationsSearchQuery = utils.statsQueryGenerator('clubId', clubId, request.query)

        const staffRegistrations = await RegistrationModel.aggregate([
            {
                $match: registrationsSearchQuery.searchQuery
            },
            {
                $group: {
                    _id: '$staffId',
                    count: { $sum: '$paid' }
                }
            },
            {
                $lookup: {
                    from: 'staffs',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'staff'
                }
            },
            {
                $project: {
                    'staff.password': 0,
                    'staff.updatedAt': 0,
                    'staff.__v': 0,
                }
            }
        ])

        const TOTAL_EARNINGS = utils.calculateTotalByKey(staffRegistrations, 'count')

        staffRegistrations.forEach(registration => registration.staff = registration.staff[0])

        return response.status(200).json({
            totalEarnings: TOTAL_EARNINGS,
            staffPayments: staffRegistrations,
        })

    } catch(error) {
        console.error(error)
        return response.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const getChainOwnerStaffsPayments = async (request, response) => {

    try {

        const dataValidation = statsValidation.statsDates(request.query)

        if(!dataValidation.isAccepted) {
            return response.status(400).json({
                message: dataValidation.message,
                field: dataValidation.field
            })
        }

        const { ownerId } = request.params

        const owner = await ChainOwnerModel.findById(ownerId)
        const clubs = owner.clubs
        const { searchQuery } = utils.statsQueryGenerator('clubId', clubs, request.query)

        const staffPayments = await RegistrationModel.aggregate([
            {
                $match: searchQuery
            },
            {
                $group: {
                    _id: '$staffId',
                    count: { $sum: '$paid' }
                }
            },
            {
                $lookup: {
                    from: 'staffs',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'staff'
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $project: {
                    'staff.password': 0,
                    'staff.updatedAt': 0,
                    'staff.__v': 0,
                }
            }
        ])

        let totalEarnings = 0
        staffPayments.forEach(registration => {

            registration.staff = registration.staff[0]
            totalEarnings += registration.count
        })

        return response.status(200).json({
            totalEarnings,
            staffPayments,
        })

    } catch(error) {
        console.error(error)
        return response.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const getOwnerClubsPayments = async (request, response) => {

    try {

        const dataValidation = statsValidation.statsDates(request.query)

        if(!dataValidation.isAccepted) {
            return response.status(400).json({
                message: dataValidation.message,
                field: dataValidation.field
            })
        }

        const { ownerId } = request.params

        const owner = await ChainOwnerModel.findById(ownerId)

        const clubs = owner.clubs

        const { searchQuery } = utils.statsQueryGenerator('clubId', clubs, request.query)

        const payments = await RegistrationModel.aggregate([
            {
                $match: searchQuery
            },
            {
                $group: {
                    _id: '$clubId',
                    count: { $sum: '$paid' }
                }
            },
            {
                $lookup: {
                    from: 'clubs',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'club'
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $project: {
                    'club.updatedAt': 0,
                    'club.__v': 0,
                }
            }
        ])

        let totalEarnings = 0

        payments.forEach(payment => {
            payment.club = payment.club[0]
            totalEarnings += payment.count
        })

        return response.status(200).json({
            totalEarnings,
            payments
        })


    } catch(error) {
        console.error(error)
        return response.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
} 

const getRegistrationsByMember = async (request, response) => {

    try {

        const { memberId } = request.params

        const memberRegistrations = await RegistrationModel.aggregate([
            {
                $match: { memberId: mongoose.Types.ObjectId(memberId) }
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
                    'member.canAuthenticate': 0,
                    'member.QRCodeURL': 0,
                    'member.updatedAt': 0,
                    'member.__v': 0,
                    'staff.password': 0,
                    'staff.updatedAt': 0,
                    'staff.__v': 0,
                    'package.updatedAt': 0,
                    'package.__v': 0
                }
            },
            {
                $sort: {
                    createdAt: -1,
                    active: 1
                }
            }
        ])

        memberRegistrations.forEach(registration => {
            registration.staff = registration.staff[0]
            registration.member = registration.member[0]
            registration.package = registration.package[0]

        })

        return response.status(200).json({
            registrations: memberRegistrations
        })

    } catch(error) {
        console.error(error)
        return response.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const getRegistrationsByStaff = async (request, response) => {

    try {

        const { staffId } = request.params

        const { searchQuery } = utils.statsQueryGenerator('staffId', staffId, request.query)

        const staffRegistrations = await RegistrationModel.aggregate([
            {
                $match: searchQuery
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
                    from: 'packages',
                    localField: 'packageId',
                    foreignField: '_id',
                    as: 'package'
                }
            },
            {
                $project: {
                    'member.canAuthenticate': 0,
                    'member.QRCodeURL': 0,
                    'member.updatedAt': 0,
                    'member.__v': 0,
                    'package.updatedAt': 0,
                    'package.__v': 0
                }
            },
            {
                $sort: {
                    createdAt: -1,
                }
            }
        ])

        staffRegistrations.forEach(registration => {
            registration.member = registration.member[0]
            registration.package = registration.package[0]

        })

        return response.status(200).json({
            registrations: staffRegistrations
        })

    } catch(error) {
        console.error(error)
        return response.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const getRegistrationsByPackage = async (request, response) => {

    try {

        const { packageId } = request.params

        const packageRegistrations = await RegistrationModel.aggregate([
            {
                $match: { memberId: mongoose.Types.ObjectId(packageId) }
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
                    'member.canAuthenticate': 0,
                    'member.QRCodeURL': 0,
                    'member.updatedAt': 0,
                    'member.__v': 0,
                    'staff.password': 0,
                    'staff.updatedAt': 0,
                    'staff.__v': 0,
                    'package.updatedAt': 0,
                    'package.__v': 0
                }
            },
            {
                $sort: {
                    createdAt: -1,
                    active: 1
                }
            }
        ])

        packageRegistrations.forEach(registration => {
            registration.staff = registration.staff[0]
            registration.member = registration.member[0]
            registration.package = registration.package[0]

        })

        return response.status(200).json({
            registrations: packageRegistrations
        })

    } catch(error) {
        console.error(error)
        return response.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const getRegistrationsAndAttendancesByMember = async (request, response) => {

    try {

        const { memberId } = request.params

        const registrations = await RegistrationModel.aggregate([
            {
                $match: { memberId: mongoose.Types.ObjectId(memberId) }
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
                $lookup: {
                    from: 'attendances',
                    localField: '_id',
                    foreignField: 'registrationId',
                    as: 'attendances'
                }
            },
            {
                $lookup: {
                    from: 'freezeregistrations',
                    localField: '_id',
                    foreignField: 'registrationId',
                    as: 'freezedRegistrations'
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ])

        registrations.forEach(registration => {
            registration.package = registration.package[0]
            registration.attendances = registration
            .attendances.sort((attendance1, attendance2) => attendance2.createdAt - attendance1.createdAt)
        })

        return response.status(200).json({
            accepted: true,
            registrations
        })

    } catch(error) {
        return response.status(500).json({
            accepted: false,
            message: 'internal server error',
            error: error.message
        })
    }
}



module.exports = { 
    addRegistration, 
    addCustomRegistration,
    getMemberRegistrations, 
    updateMemberAttendance, 
    getClubRegistrations,
    getClubRegistrationsStatsByDate,
    checkAddRegistrationData,
    getClubRegistrationsDataJoined,
    getRegistrationsByOwner,
    getChainOwnerRegistrationsStatsByDate,
    getClubStaffsPayments,
    getClubStaffsRegistrationsPayments,
    getOwnerClubsPayments,
    getRegistrationsByMember,
    getRegistrationsByStaff,
    getRegistrationsByPackage,
    getChainOwnerStaffsPayments,
    getRegistrationsAndAttendancesByMember,
    getClubRegistrationsWithInstallments,
    deleteRegistration,
    updateRegistrationAttendance
}