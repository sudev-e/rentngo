var db=require('../config/connection')
var collection=require('../config/collection')
const bcrypt=require('bcrypt')
const { ObjectId } = require('mongodb')
const { addListener, response } = require('../app')
const Razorpay = require('razorpay');
const { resolve } = require('path')
var instance = new Razorpay({
    key_id: 'rzp_test_uonJJKohxrBA2c',
 key_secret: 'tpZUFyYf0gBE94S2aTfArNsJ',
});
module.exports={
    doSignup:(userData)=>{
     return new Promise(async(resolve,reject)=>{
         userData.isActive=true
         userData.password=await bcrypt.hash(userData.password,10)
        db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
            resolve(data.insertedId)

        })
     })
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            const user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        console.log('login success')
                        response.user=user
                        response.status=true
                        resolve(response)
                    }else{
                        console.log(status)
                        console.log("login failed pass")
                        resolve({status:false})
                    }
                })
            }else{
                console.log('login failed');
                resolve({status:false})
            }
        })
    },
     booking:(userid,cars,home,totalrent)=>{
      return new Promise(async(resolve,reject)=>{
          const booking={
                booking_id:new ObjectId,
                pickupdate:home.date1,
                dropoffdate:home.date2,
                pickuplocation:home.location1,
                pickuppoint:home.locationsub1,
                dropofflocation:home.location2,
                dropoffpoint:home.locationsub2,
                carid:cars._id,
                brandname:cars.brandname,
                brandmodel:cars.brandmodel,
                varient:cars.varient,
                registration:cars.registrationnumber,
                color:cars.color,
                seats:cars.seats,
                transmission:cars.transmission,
                rent:totalrent,
                status:"pending"

          }
    await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userid)},{$push:{'booking':booking}},{upsert:true})
    resolve(booking.booking_id)
      })
    },
    generateRazorpay:(bookid,totalrent)=>{
    return new Promise((resolve,reject)=>{
        var options = {
            amount: totalrent*100,  // amount in the smallest currency unit
            currency: "INR",
            receipt:""+bookid
          };
          instance.orders.create(options, function(err, order) {
              if(err){
                  console.log(err);
              }else{
            console.log("new order:",order);
            resolve(order)
        }
          });
      
    })
    },
    verifyPayment:(details)=>{
    return new Promise((resolve,reject)=>{
        const crypto = require('crypto');
        console.log("recieved")
        let hmac= crypto.createHmac('sha256','tpZUFyYf0gBE94S2aTfArNsJ')
        hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
        hmac=hmac.digest('hex')
        if(hmac==details['payment[razorpay_signature]']){
            resolve()
            console.log("confirmed")
        }else{
            reject()
            console.log("not confirmed")
        }
    })
    },
    changePaymentStatus:(orderId)=>{
    return new Promise((resolve,reject)=>{
        console.log("user recieved")
        db.get().collection(collection.USER_COLLECTION)
        .updateOne({"booking.booking_id":ObjectId(orderId)},
        {$set:{"booking.$.status":'placed'
    }
},{upsert:true}
        ).then((status)=>{
            console.log(status)
 resolve()
        })
    })
    },
    myOrder:(userid)=>{
        return new Promise(async(resolve,reject)=>{
      const orders=await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userid)})
      console.log(orders)
      resolve(orders)
        })
    },
    currentBooking:(userid)=>{
     return new Promise(async(resolve,reject)=>{
         const orders=await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userid)})
         console.log(orders)
         let order=[]
         for (let i of orders.booking)
         {
             let pickup=new Date(i.pickupdate).setHours(0,0,0,0)
             let drop=new Date(i.dropoffdate).setHours(0,0,0,0)
             let today=new Date().setHours(0,0,0,0)
             console.log(pickup)
             console.log(today)
             if((pickup == today) || (drop == today) || (pickup<today && drop > today)) {
        //  for(j=0;j<length;j++){
        //        order[j]=i
        //  }
        order.push(i)
         } 
         }
         console.log(order)
         resolve(order);
     })
    },
    completedBooking:(userid)=>{
        return new Promise(async(resolve,reject)=>{
            const orders= await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userid)})
            console.log(orders)
            let order=[]
            for(let i of orders.booking)
            {
                let pickup=new Date(i.pickupdate).setHours(0,0,0,0)
                let drop=new Date(i.dropoffdate).setHours(0,0,0,0)
                let today=new Date().setHours(0,0,0,0)
                if((pickup < today) && (drop < today) ) {
                    order.push(i)
                }
            }
            console.log(order)
         resolve(order);
        })
    },
    upComing:(userid)=>{
        return new Promise(async(resolve,reject)=>{
            const orders=await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userid)})
            console.log(orders)
            let order=[]
            for(let i of orders.booking)
            {
                let pickup=new Date(i.pickupdate).setHours(0,0,0,0)
                let drop=new Date(i.dropoffdate).setHours(0,0,0,0)
                let today=new Date().setHours(0,0,0,0)
                if(i.status=="placed")
                {
                if((pickup > today) && (drop > today) ) {
                    order.push(i)   
            }
        }
        }
        console.log(order)
        resolve(order);
        })
    },
    filter:(categoryfilter,location,cdate1,cdate2)=>{
        console.log(categoryfilter)
     return new Promise (async(resolve,reject)=>{

             const filter=await  db.get().collection(collection.CAR_COLLECTION).find({$and:[ {$or:categoryfilter},{Location:location}]}
        //  {category:{$or:categoryfilter}}
       
     ).toArray()
         console.log(filter)
         console.log("waiting")
   
     users=await db.get().collection(collection.USER_COLLECTION).aggregate([
        {
            $unwind:'$booking'
         },
         {$match:{'booking.status':'placed'}},
         // {
         //     $project:{booking:1}
         // }
         {
             $match:{$or:[
                  {'$and':[{'booking.dropoffdate':{'$lte':cdate2}},{'booking.pickupdate':{'$gte':cdate1}}]},
                  {'$and':[{'booking.dropoffdate':{'$gte':cdate2}},{'booking.pickupdate':{'$lte':cdate1}}]},
                 ]}
            
         },
         {
             $project:{booking:1}
         }
     ]).toArray();

     for(i in filter){
         for(j in users){
         
             if(filter[i]._id == users[j].booking.carid){
                 filter.splice(i,1) 
             }
         }
     }console.log(filter)
     resolve(filter)
     
    
     
      
     })
    
    },
    getAllCoupons:()=>{
        return new Promise(async(resolve,reject)=>{
            const coupon= await db.get().collection(collection.ADMIN_COLLECTION).aggregate([
                {
                    $unwind:'$coupons'
                },
                {
                    $project:{coupons:1}
                }
            ]).toArray()
            console.log(coupon)
 resolve(coupon)
        })
    },

}