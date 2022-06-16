var db=require('../config/connection')
var collection=require('../config/collection')
const { response } = require('../app')
const { HostedNumberOrderInstance } = require('twilio/lib/rest/preview/hosted_numbers/hostedNumberOrder')
const Sync = require('twilio/lib/rest/Sync')
const { BulkCountryUpdatePage } = require('twilio/lib/rest/voice/v1/dialingPermissions/bulkCountryUpdate')
var ObjectId=require('mongodb').ObjectId
const bcrypt=require('bcrypt')
const { use } = require('../routes')
module.exports={
    adminLogin:(adminData)=>{
      return new Promise(async(resolve,reject)=>{
      let  response={}
       const admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({adminemail:adminData.username})
       console.log(admin)
       if(admin){
        bcrypt.compare(adminData.password,admin.password).then((status)=>{
            if(status){
                console.log("login success")
               response.admin=admin
                response.status=true
                resolve(response)
            }else{
                console.log(status)
                console.log("login failed pass")
                resolve({status:false})
            }
        })
       }
      })
    },
    getAllUsers:()=>{
       return new Promise(async(resolve,reject)=>{
           const users=await db.get().collection(collection.USER_COLLECTION).find().toArray()

           resolve(users)
       })
    },
    deleteAllUsers:(userid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).deleteOne({_id:ObjectId(userid)}).then((response)=>{
                console.log(response)
                resolve(response)
            })
        })
    },
    Block:(userid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userid)},{$set:{isActive:false}}).then((response)=>{
                console.log(response)
                resolve(response)
            })
        })
    },
    UnBlock:(userid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userid)},{$set:{isActive:true}}).then((response)=>{
                // console.log(response)
                resolve(response)
            })
        })
    },
    activeBooking:()=>{
        return new Promise(async(resolve,reject)=>{
            const bookings= await db.get().collection(collection.USER_COLLECTION).aggregate([
            {
                $unwind: '$booking',
             },
             {
                $match:{'booking.status':'placed'}
             },
             {
                 $project:{
                     booking:{
                         username:'$username',
                         userid:'$_id',
                         _id:'$booking.booking_id',
                         brandname:'$booking.brandname',
                         brandmodel:'$booking.brandmodel',
                         registration:'$booking.registration',
                         rent:'$booking.rent',
                         pickupdate:'$booking.pickupdate',
                         dropoffdate:'$booking.dropoffdate',
                         status:'$booking.status',
                         pickuplocation:'$booking.pickuplocation',
                         dropofflocation:'$booking.dropofflocation',
                         carid:'$booking.carid',
                     }
                 }
             }
            ]).toArray();
            let order=[]
            
                 for(let i in bookings){
                let pickup=new Date(bookings[i].booking.pickupdate).setHours(0,0,0,0)
                let drop=new Date(bookings[i].booking.dropoffdate).setHours(0,0,0,0)
                let today=new Date().setHours(0,0,0,0)
                if((pickup == today) || (drop == today) || (pickup<today && drop > today)) {
                    order[i]=bookings[i]
                }
        }
        resolve(order)
       })
    },

    upcomingBookings:()=>{
        return new Promise(async(resolve,reject)=>{
            const bookings= await db.get().collection(collection.USER_COLLECTION).aggregate([
            {
                $unwind: '$booking',
             },
             {
                $match:{ $or:[{'booking.status':'placed'},{'booking.status':'pending'}]}
             },
             {
                 $project:{
                     booking:{
                         username:'$username',
                         userid:'$_id',
                         _id:'$booking.booking_id',
                         brandname:'$booking.brandname',
                         brandmodel:'$booking.brandmodel',
                         registration:'$booking.registration',
                         rent:'$booking.rent',
                         pickupdate:'$booking.pickupdate',
                         dropoffdate:'$booking.dropoffdate',
                         status:'$booking.status',
                         pickuplocation:'$booking.pickuplocation',
                         dropofflocation:'$booking.dropofflocation',
                         carid:'$booking.carid',
                     }
                 }
             }
            ]).toArray();
            let order=[]
            
                 for(let i in bookings){
                let pickup=new Date(bookings[i].booking.pickupdate).setHours(0,0,0,0)
                let drop=new Date(bookings[i].booking.dropoffdate).setHours(0,0,0,0)
                let today=new Date().setHours(0,0,0,0)
                if((pickup > today) && (drop > today) )  {
                    order[i]=bookings[i]
                }
        }
        resolve(order)
       })
    },
    completedBookings:()=>{
        return new Promise(async(resolve,reject)=>{
            const bookings= await db.get().collection(collection.USER_COLLECTION).aggregate([
            {
                $unwind: '$booking',
             },
             {
                $match:{'booking.status':'completed'}
             },
             {
                 $project:{
                     booking:{
                         username:'$username',
                         userid:'$_id',
                         _id:'$booking.booking_id',
                         brandname:'$booking.brandname',
                         brandmodel:'$booking.brandmodel',
                         registration:'$booking.registration',
                         rent:'$booking.rent',
                         pickupdate:'$booking.pickupdate',
                         dropoffdate:'$booking.dropoffdate',
                         status:'$booking.status',
                         pickuplocation:'$booking.pickuplocation',
                         dropofflocation:'$booking.dropofflocation',
                         dropoffpoint:'$booking.dropoffpoint',
                         carid:'$booking.carid',
                     }
                 }
             }
            ]).toArray();
            let order=[]
            
                 for(let i in bookings){
                let pickup=new Date(bookings[i].booking.pickupdate).setHours(0,0,0,0)
                let drop=new Date(bookings[i].booking.dropoffdate).setHours(0,0,0,0)
                let today=new Date().setHours(0,0,0,0)
                if((pickup < today) && (drop < today) ) {
                    order[i]=bookings[i]
                }
        }
        resolve(order)
       })
    },
    approvalBookings:()=>{
        return new Promise(async(resolve,reject)=>{
            const bookings= await db.get().collection(collection.USER_COLLECTION).aggregate([
            {
                $unwind: '$booking',
             },
             {
                $match:{'booking.status':'placed'}
             },
             {
                 $project:{
                     booking:{
                         username:'$username',
                         userid:'$_id',
                         _id:'$booking.booking_id',
                         brandname:'$booking.brandname',
                         brandmodel:'$booking.brandmodel',
                         registration:'$booking.registration',
                         rent:'$booking.rent',
                         pickupdate:'$booking.pickupdate',
                         dropoffdate:'$booking.dropoffdate',
                         status:'$booking.status',
                         pickuplocation:'$booking.pickuplocation',
                         dropofflocation:'$booking.dropofflocation',
                         dropoffpoint:'$booking.dropoffpoint',
                         carid:'$booking.carid',
                     }
                 }
             }
            ]).toArray();
            let order=[]
            
                 for(let i in bookings){
                let pickup=new Date(bookings[i].booking.pickupdate).setHours(0,0,0,0)
                let drop=new Date(bookings[i].booking.dropoffdate).setHours(0,0,0,0)
                let today=new Date().setHours(0,0,0,0)
                if((pickup < today) && (drop < today) ) {
                    order[i]=bookings[i]
                }
        }
        resolve(order)
       })
    },
    cancelBooking:(orderid)=>{
       return new Promise(async(resolve,reject)=>{
      
       })
    },
    hublocation:(userid,bookingid,location)=>{
    return new Promise(async(resolve,reject)=>{
    db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userid),'booking.booking_id':ObjectId(bookingid)},{$set:{'booking.$.status':'completed'}}).then((response)=>{
         console.log(response)
         resolve()
        })
    })
    },
    updatePoint:(carid,location)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.CAR_COLLECTION).updateOne({_id:ObjectId(carid)},{$set:{Location:location}}).then((response)=>{
          console.log(response)
          resolve()
            })
        })
    },
    updateKms:(carid,kms)=>{
        return new Promise(async(resolve,reject)=>{
            console.log("process started")
            db.get().collection(collection.CAR_COLLECTION).updateOne({_id:ObjectId(carid)},{$set:{age:kms}}).then((response)=>{
                console.log("updated success")
                resolve(response)
            })
        })
    },
    addCoupons:(couponData)=>{
        console.log("vannu vannu")
        return new Promise(async(resolve,reject)=>{
           const coupons={
            couponname:couponData.couponname,
            couponcode:couponData.couponcode,
            offeramount:couponData.offeramount,
            expirydate:couponData.expirydate,
            couponlabel:couponData.couponlabel
           }
           console.log(coupons)
        await db.get().collection(collection.ADMIN_COLLECTION).updateOne({},{$push:{'coupons':coupons}},{upsert:true}).then((response)=>{
            console.log("lybu ssssss")
            console.log(response)
            resolve(response)
         })
        })
    },
    allCoupons:()=>{
        return new Promise(async(resolve,reject)=>{
            console.log("muneeb")
            const coupon=await db.get().collection(collection.ADMIN_COLLECTION).aggregate([
                {$unwind:'$coupons'
                },
                {
                    $project:{coupons:1}
                },
            ]).toArray()
           console.log(coupon)
           console.log("muneeb sir")
            resolve(coupon)
        })
    },
    deleteCoupon:(code)=>{
        console.log("ethi ")
   return new Promise(async(resolve,reject)=>{
    db.get().collection(collection.ADMIN_COLLECTION).updateOne({'coupons.couponcode':code},{$pull:{coupons:{couponcode:code}}}).then((response)=>{
        resolve(response)
    })
   })
    },
    anuualRevenue:()=>{
        return new Promise(async(resolve,reject)=>{
         const   revenue= await db.get().collection(collection.USER_COLLECTION).aggregate([
            {
                $unwind:'$booking'
            },
            {
                $match:{'booking.status':'completed'}
            },
            {
                $project:{booking:1}
            }
         ]).toArray()
        const income=[]
        let annualincome=0
        let monthincome=0
        var date=new Date();
        var month=date.getMonth()+1;
        console.log(month)
        var year=date.getFullYear();
        console.log(year,"year")
        for(i of revenue){
         let pickup=new Date(i.booking.pickupdate).getFullYear();
         let pickupmonth=new Date(i.booking.pickupdate).getMonth()+1;
         console.log(pickup,pickupmonth,"year database")
         if(pickup===year){
            console.log(i.booking.rent)
            annualincome = annualincome+ i.booking.rent
            console.log(annualincome)
            

         }
         if(month===pickupmonth){
         monthincome=monthincome+i.booking.rent
         console.log(monthincome,"kuttan")
         }
        }
        resolve({annualincome,monthincome})
        })
    },
    totalBooking:()=>{
        return new Promise(async(resolve,reject)=>{
            const totalBooking=await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $unwind:'$booking'
                },
                {
                    $match:{'booking.status':'completed'}
                },
                {
                    $count:"total"
                }
                
            ]).toArray()
            console.log(totalBooking)
            if(totalBooking[0].total){
                resolve(totalBooking[0].total)
            }else{
                const totalbooking = 0;
                resolvel(totalBooking)
            }
            
        })
    },
    totalCars:()=>{
     return new Promise(async(resolve,reject)=>{
        const cars=await db.get().collection(collection.CAR_COLLECTION).aggregate([
            {
                $unwind:'$_id'
            },
            {
              $count:"total"
            }
        ]).toArray()
        console.log(cars)
        resolve(cars[0].total)
     })
    },
    yearGraph:()=>{
        return new Promise(async(resolve,reject)=>{
            const booking=await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $unwind:'$booking'
                },
                {
                    $match:{'booking.status':'completed'}
                },
                {
                    $project:{booking:1}
                }
            ]).toArray()
          let  totalrevenue=[]
            var months = [0,1,2,3,4,5,6,7,8,9,10,11];
          for(i in months){
            console.log(months[i])
            let revenue=0
              for(j of booking){
               let monthdb=new Date(j.booking.pickupdate).getMonth();
               console.log(monthdb)
                if(monthdb===months[i]){
                 revenue=revenue+j.booking.rent
                }
              }
            totalrevenue.push(revenue)
          }



          resolve(totalrevenue)
          console.log(totalrevenue)
        })
    }
}