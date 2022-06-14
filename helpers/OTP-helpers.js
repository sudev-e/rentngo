require('dotenv').config();
const accountSID = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceId = process.env.TWILIO_SERVICE_ID;
const client = require('twilio')(accountSID,authToken)

module.exports={
    makeOtp:(phone_number)=>{
        return new Promise(async(resolve,reject)=>{
           await client.verify
            .services("VA66e867c14dc4109a3623c5da2be62bf9")
            .verifications.create({
                to:`+91${phone_number}`,
                channel:'sms'
            }).then((verifications) =>{
                console.log(verifications.status)
                resolve(verifications)
            })
            
        })
        
    },
    verifyOtp:(otp,phone_number)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(phone_number);
           await client.verify
           .services("VA66e867c14dc4109a3623c5da2be62bf9")
           .verificationChecks.create({
               to:`+91${phone_number}`,
               code:otp,
           }).then((verification_check)=>{
               resolve(verification_check)
           })
        })
    }
}


