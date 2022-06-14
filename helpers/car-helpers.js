var db=require('../config/connection')
var collection=require('../config/collection')
const { response } = require('../app')
const userHelper = require('./user-helper')
const { use } = require('../routes')
const { booking } = require('./user-helper')
var ObjectId=require('mongodb').ObjectId
module.exports={
    addCar:(carData)=>{
        return new Promise(async(resolve,reject)=>{
            carData.isActive=true
            db.get().collection(collection.CAR_COLLECTION).insertOne(carData).then((data) => {
                resolve(data.insertedId)
            })
        })
    },
    getAllCars:()=>{
        return new Promise(async(resolve,reject)=>{
            let cars=await db.get().collection(collection.CAR_COLLECTION).find().toArray()
            resolve(cars)
        })
    },
    deleteOneCar:(carid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CAR_COLLECTION).deleteOne({_id:ObjectId(carid)}).then((response)=>{
                console.log(response)
                resolve(response)
            })
        })

    },
    viewCar:(carid)=>{
        return new Promise((resolve,reject)=>{
          let cars= db.get().collection(collection.CAR_COLLECTION).findOne({_id:ObjectId(carid)}).then((cars)=>{
            resolve(cars)
            })
        })
    },
    editCar:(carid,cars)=>{
     return new Promise((resolve,reject)=>{
         db.get().collection(collection.CAR_COLLECTION).updateOne({_id:ObjectId(carid)},{$set:{brandname:cars.brandname,brandmodel:cars.brandmodel,varient:cars.varient,color:cars.color,transmission:cars.transmission,fuel:cars.fuel,category:cars.category,registrationnumber:cars.registrationnumber,age:cars.age,seats:cars.seats,Location:cars.Location,rent:cars.rent}}).then((response)=>{
             console.log(response)
             resolve(response)
         })
     })
    },
    locationCar:(location,cdate1,cdate2)=>{
        return new Promise(async(resolve,reject)=>{
            cars= await db.get().collection(collection.CAR_COLLECTION).find({Location:location}).toArray()
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
                         {'$and':[{'booking.pickupdate':{'$lte':cdate1}},{'booking.dropoffdate':{'$gte':cdate1}}]},
                         {'$and':[{'booking.pickupdate':{'$lte':cdate2}},{'booking.dropoffdate':{'$gte':cdate2}}]},
                         {'$and':[{'booking.pickupdate':{'$lte':cdate2}},{'booking.dropoffdate':{'$lte':cdate2}}]},
                        ]}
                   
                },
                {
                    $project:{booking:1}
                }
            ]).toArray();
            console.log(users)
     let  collect=[]
            for(i in cars){
                console.log(cars[i]._id)
                console.log(cars[i]._id.toString())
                let id=cars[i]._id.toString()
            //     console.log(cars[i])
            //   console.log(cars[i]._id)  
                for(j in users){
                    console.log(users[j].booking.carid)
                    // console.log(users[j].booking)
                
                    if(id === users[j].booking.carid){
                        console.log("njan lybuss",i)
                        cars.splice(i,1)
                    }
                }
            }
            console.log(collect)
            // for(i of users){
            //  let pickup=new Date(i.booking.pickupdate).setHours(0,0,0,0)
            //  let drop=new Date(i.booking.dropoffdate).setHours(0,0,0,0)
            //  let sdate1=new Date(cdate1).setHours(0,0,0,0)
            //  let sdate2=new Date(cdate2).setHours(0,0,0,0)  
            
            // }
            console.log("katta")
            resolve(cars)
        })
    },

}