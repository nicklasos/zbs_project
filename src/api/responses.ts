export default {

    apiKeyValidationFailed(res) {
        res.status(400).json({
            message: 'Request validation failed: Wrong api key',
            code: 'API_KEY_VALIDATION_FAILED',
            failedValidation: true,
        });
    },

    ownerValidationFailed(res) {
        res.status(400).json({
            message: 'Request validation failed: Wrong order id',
            code: 'ORDER_ID_VALIDATION_FAILED',
            failedValidation: true,
        });
    },

    error500(res) {
        res.status(500).json({
            result: 'error',
            error: 'Internal Server Error',
        });
    },

}
