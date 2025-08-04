const validator =require("validator");

// req.body 

const validate = (data)=>{
   
    const mandatoryField = ['firstName',"emailId",'password'];

    const IsAllowed = mandatoryField.every((k)=> Object.keys(data).includes(k));

    if(!IsAllowed)
        throw new Error("Some Field Missing");

    if(!validator.isEmail(data.emailId))
        throw new Error("Invalid Email");

    // More lenient password validation
    if(data.password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
    }
    
    // Check if password has at least one letter and one number
    if(!/[a-zA-Z]/.test(data.password) || !/[0-9]/.test(data.password)) {
        throw new Error("Password must contain at least one letter and one number");
    }
}

module.exports = validate;