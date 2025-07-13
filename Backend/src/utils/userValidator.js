const validator = require('validator');

const validUser = (data) => {
    const mandatoryField = ['firstName', 'emailId', 'password'];
    
    const IsAllowed = mandatoryField.every((k) => Object.keys(data).includes(k));
    
    if (!IsAllowed) {
        return { error: { details: [{ message: "Some field missing" }] } };
    }
    
    if (!validator.isEmail(data.emailId)) {
        return { error: { details: [{ message: 'Invalid Email' }] } };
    }
    
    if (!validator.isStrongPassword(data.password)) {
        return { error: { details: [{ message: 'Weak password' }] } };
    }
    
    return { error: null }; // No errors
}

module.exports = validUser;