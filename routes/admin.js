var express = require('express');
const { response } = require('../app');
var router = express.Router();
var adminHelpers=require('../helpers/admin-helpers');
var userHelpers=require('../helpers/user-helper');
var carHelpers=require('../helpers/car-helpers');
const { totalBooking } = require('../helpers/admin-helpers');

/* GET users listing. */
router.get('/', function(req, res, next) { 
  if(req.session.adminloggedin){
    // adminHelpers.anuualRevenue().then((incomes)=>{
    //   console.log(incomes,"hi")
    //   adminHelpers.totalBooking().then((totalBooking)=>{
        adminHelpers.totalCars().then((totalcar)=>{
          // adminHelpers.yearGraph().then((mincomes)=>{
              res.render('admin/admin',{admin:true,totalcar})
          })
         
        // })
     
    //   })
    
    // })
  }else{
          res.render('admin/adminlogin')
          req.session.adminblocked=false
  }
})
router.post('/adminlogin',(req,res)=>{
console.log("arrived")
adminHelpers.adminLogin(req.body).then((response)=>{
  if(response.status){
    req.session.adminloggedin=true
   res.redirect('/admin/')
  }else{
    req.session.adminblocked=true;
    res.redirect('/admin/')
  }
})
 
})

router.get('/tables',(req,res)=>{
  adminHelpers.getAllUsers().then((users)=>{
    res.render('admin/userdetails',{users,admin:true})
  })
});
router.get('/delete/:id',(req,res)=>{
  const userid=req.params.id
  console.log(userid)
  adminHelpers.deleteAllUsers(userid).then((response)=>{
    console.log(response)
    res.redirect('/admin/tables')
  })
});
router.get('/block/:id',(req,res)=>{
  const userid=req.params.id
  adminHelpers.Block(userid).then((response)=>{
    
    res.redirect('/admin/tables')
  })
})
router.get('/unblock/:id',(req,res)=>{
  const userid=req.params.id
  adminHelpers.UnBlock(userid).then((response)=>{
    
    res.redirect('/admin/tables')
})
})
router.get('/adduser',(req,res)=>{
  res.render('admin/addcar')
})
router.post('/insertcar',(req,res)=>{
  console.log(req.body)
  carHelpers.addCar(req.body).then((id)=>{
    console.log(id)
    console.log(req.files)
    if(req.files){
      if(req.files.image1){
    addimage(req.files.image1,1,id)
      }
      if(req.files.image2){
    addimage(req.files.image2,2,id)
      }
      if(req.files.image3){
    addimage(req.files.image3,3,id)
      }
    }
    res.redirect('/admin')
  })
})
function addimage(image,n,id){
  image.mv('public/images/productimages/'+id+'('+n+')'+'.jpg')
}
router.get('/carslist',(req,res)=>{
  carHelpers.getAllCars().then((cars)=>{
    res.render('admin/cardetails',{cars,admin:true})
  })
 
})
router.get('/deletecar/:id',(req,res)=>{
  const carid=req.params.id
  carHelpers.deleteOneCar(carid).then((response)=>{
    console.log(response)
    res.redirect('/admin/carslist')
  })
})
router.get('/views/:id',(req,res)=>{
  const carid=req.params.id
  carHelpers.viewCar(carid).then((cars)=>{
    console.log(cars)
    res.render('admin/viewcar',{cars})
  })
})
router.get('/edit/:id',(req,res)=>{
  const carid=req.params.id
   req.session.carid=carid
  carHelpers.viewCar(carid).then((cars)=>{
    console.log(cars._id) 
    res.render('admin/editcar',{cars})
  })
 
})
router.post('/editcar',(req,res)=>{
  const carid=req.session.carid
  console.log(req.params.id)
  console.log(carid)
  carHelpers.editCar(carid,req.body).then(()=>{
    (async function(){
      try {
      if(req.files.image1){
      addimage(req.files.image1,1,carid)
      }
      if(req.files.image2){
      addimage(req.files.image2,2,carid)
      }
      if(req.files.image2){
      addimage(req.files.image3,3,carid)
      }
    }catch(error){
      console.log(error)
    }
  })
   
     res.redirect('/admin')
  })
  
})
router.get('/activebooking',(req,res)=>{
  adminHelpers.activeBooking().then((order)=>{
    res.render('admin/activebooking',{order,admin:true})
  })
})
router.get('/upcomingbooking',(req,res)=>{
  adminHelpers.upcomingBookings().then((order)=>{
    res.render('admin/upcomingbookings',{order,admin:true})
  })
})
router.get('/completedbooking',(req,res)=>{
  adminHelpers.completedBookings().then((order)=>{
    res.render('admin/completedbooking',{order,admin:true})
  })
})
router.get('/cancel/:id',(req,res)=>{
  orderid=req.params.id
  adminHelpers.cancelBooking(orderid).then(()=>{
    res.redirect('/admin/upcomingbooking')
  })
})
router.get('/approval',(req,res)=>{
  adminHelpers.approvalBookings().then((order)=>{
res.render('admin/approval',{admin:true,order})
  })
    
  })
  router.get('/hubreached',(req,res)=>{
    const {userId ,bookingId,location,carid} = req.query;
    adminHelpers.updatePoint(carid,location).then(()=>{
    })
    adminHelpers.hublocation(userId,bookingId,location,carid).then(()=>{
     res.json({updated:true})
    })
  
  })
  router.post('/updatekms/:id',(req,res)=>{
   carid=req.params.id
   km=req.body.kms
    adminHelpers.updateKms(carid,km).then((response)=>{
    res.redirect('/admin/approval')
    })
  })
  router.get('/addcoupons',(req,res)=>{
    res.render('admin/addcoupons',{admin:true})
  })
  router.post('/addingcoupons',(req,res)=>{
     
    adminHelpers.addCoupons(req.body).then((response)=>{
      res.redirect('/admin/viewcoupons')

    })
  })
 router.get('/viewcoupons',(req,res)=>{
   adminHelpers.allCoupons().then((coupon)=>{
    res.render('admin/viewallcoupon',{coupon,admin:true})
   })
 })
 router.get('/deletecoupon',(req,res)=>{
   const{couponcode}=req.query;
   console.log("lybu sssssssss")
  adminHelpers.deleteCoupon(couponcode).then(()=>{
    res.json({updated:true})
  })
 })
 
module.exports = router;
