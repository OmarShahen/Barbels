const router = require('express').Router()
const authController = require('../controllers/auth')
const tokenMiddleware = require('../middlewares/verify-permission')
const { verifyUserId } = require('../middlewares/verify-routes-params')

router.post('/v1/auth/signup', (request, response) => authController.userSignup(request, response))

router.post('/v1/auth/login', (request, response) => authController.userLogin(request, response))

router.post('/v1/auth/verify/personal-info', (request, response) => authController.verifyPersonalInfo(request, response))

router.post('/v1/auth/verify/speciality-info', (request, response) => authController.verifySpecialityInfo(request, response))

router.post('/v1/auth/verify/emails/:email', (request, response) => authController.verifyEmail(request, response))

router.post(
    '/v1/auth/verify/users/:userId/verification-codes/:verificationCode', 
    verifyUserId,
    (request, response) => authController.verifyEmailVerificationCode(request, response)
)

router.patch(
    '/v1/auth/users/:userId/verify',
    verifyUserId,
    (request, response) => authController.setUserVerified(request, response)
)

router.post(
    '/v1/auth/users/:userId/send/verification-codes',
    (request, response) => authController.addUserEmailVerificationCode(request, response)
)

router.post(
    '/v1/auth/emails/send',
    (request, response) => authController.sendEmail(request, response)
)

module.exports = router