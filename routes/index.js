var express = require('express');
const { render, response } = require('../app');
const carHelpers = require('../helpers/car-helpers');
var router = express.Router();
const otpHelpers=require('../helpers/OTP-helpers');
const userHelpers=require('../helpers/user-helper');
let CarDetails

/* GET home page. */
router.get('/', function(req, res, next) {
  const userTrue =req.session.user

  res.render('index', {user:true,userTrue});
});

router.get('/userlogin',(req,res)=>{
  if(req.session.loggedIn){
    if(req.session.user.isActive){
      res.redirect('/')
    }else{
      res.render('login',{blockedUser:req.session.blocked})
      req.session.blocked=false
    }
    
  }else{
    req.session.loginErr
  res.render('login',{"loginErr":req.session.loginErr})
  }
})
router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    console.log(response.status)
    if(response.status){
      req.session.loggedIn=true
      req.session.user=response.user
      if(req.session.user.isActive==true){
        res.redirect('/')
      }else{
        req.session.blocked=true
        res.redirect('/userlogin')
      }
    
    }else{
      res.redirect('/userlogin')
      req.session.loginErr=true
    }
  })
})

router.get('/signup',(req,res)=>{
  res.render('signup')
})
router.post('/submit',(req,res)=>{
  
  const{username,phonenumber}=req.body
  
  req.session.number=phonenumber
  
  req.session.userName=username
  req.session.whole=req.body
  otpHelpers.makeOtp(phonenumber).then((verification) => console.log(verification))
   res.render('verification',{whole:req.session.whole})
  
})
router.post('/search',(req,res)=>{
  const userTrue =req.session.user
  const book=req.body
  req.session.home=req.body
  const location=req.body.location1
  req.session.locationcity=location
  req.session.date1=(book.date1)
  req.session.date2=(book.date2)
  carHelpers.locationCar(location,req.session.date1,req.session.date2).then((cars)=>{
    console.log(cars)
    CarDetails=cars
    req.session.couponapplied=false
    res.render('homepage',{user:true,cars :CarDetails,userTrue})
  })

  
})

// router.get("/rent", (req, res) => {
//   res.render('booking',{user:true})
// })
router.get('/rent/:id',(req,res)=>{
  const userTrue =req.session.user
  const carid=req.params.id
  req.session.userid=req.params.id
  carHelpers.viewCar(carid).then((cars)=>{
    console.log(cars)
    res.render('booking',{user:true,cars,userTrue})
  })
})
router.get('/booknow/:id',(req,res)=>{
  userHelpers.getAllCoupons().then(async(coupon)=>{
    req.session.list=await coupon
})
  const userTrue =req.session.user
  const carid=req.params.id
 const home=req.session.home
  const dateOne= new Date(req.session.home.date1)
  const dateTwo=new Date(req.session.home.date2)
  const difference=dateTwo.getTime() - dateOne.getTime();
  const totalDays=Math.ceil(difference/(1000 * 3600 * 24));
console.log(totalDays)
  
  carHelpers.viewCar(carid).then((cars)=>{
    console.log(cars)
    req.session.car=cars
 const totalrent=parseInt( cars.rent * totalDays)
 req.session.totalrent=totalrent
 let couponitem=req.session.list
 console.log(couponitem)
 console.log(req.session.couponapplied)
if(req.session.couponapplied==false){
req.session.offerapplied=true
}else{
  req.session.offerapplied=false
}
 coup=req.session.offerapplied
 console.log(coup)
 if(req.session.loggedIn){
    res.render('checkout',{user:true,cars,home,userTrue,totalrent,couponitem,coup})
}else{
  res.redirect('/userlogin')
}
  
  })  
})
router.post('/payment',(req,res)=>{
   
  const userid=req.session.user._id
  const home=req.session.home
  const cars=req.session.car
  userHelpers.booking(userid,cars,home,req.session.totalrent).then((bookid)=>{
  
    console.log(bookid)
    userHelpers.generateRazorpay(bookid,req.session.totalrent).then((response)=>{
     res.json(response)
    })
    // if(req.files){
    //   if(req.files.image4){
    // addimage(req.files.image4,4,id)
    //   }
    //   if(req.files.image5){
    // addimage(req.files.image5,5,id)
    //   }
    // }
  })
  
  
})
router.post('/applycoupon',(req,res)=>{
  console.log("akshay")

  const{couponcode,offeramount}=req.body;
  console.log(offeramount)
  if(req.session.couponapplied==false){
    let offer=parseInt(offeramount) 
    console.log(offer)
    let trent=req.session.totalrent
    console.log(trent)
    let total=trent-((trent*offer)/100)
    console.log(total)
    req.session.totalrent=total
    req.session.couponapplied=true
    req.session.offerapplied=false
   res.json({applied:true,total,})
  }
})
router.post('/verify-payment',(req,res)=>{
    console.log(req.body)
    userHelpers.verifyPayment(req.body).then(()=>{
      console.log("function worked")
      userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
        console.log("payment successful")
        res.json({status:true})
      })
    }).catch((err)=>{
      console.log(err);
      res.json({status:'payment failed'})
    })
  })
router.get('/profile',(req,res)=>{
  const userid=req.session.user._id
  userHelpers.myOrder(userid).then((orders)=>{
   console.log(orders)
  
res.render('userprofile',{orders})
  })

})

// function addimage(image,n,id){
//   image.mv('public/images/productimages/'+id+'('+n+')'+'.jpg')
// }
router.post('/verify',(req,res)=>{
 let{ otp }=req.body;
 otp=otp.join("");
 console.log(otp)
 const phone_number=req.session.number
 console.log(req.session.number)
 otpHelpers.verifyOtp(otp,phone_number).then((verification_check)=>{
   if(verification_check.status=="approved"){
     console.log("approved")
     req.session.checkstatus=true

     userHelpers.doSignup(req.session.whole).then((response)=>{
      console.log(response)
      req.session.ids=response
      res.redirect('/userlogin')
    })
   
   }else{
     console.log("not approved")
     res.redirect('/signup')
   }
   
 })

})
router.get('/currentbooking',(req,res)=>{
  const userid=req.session.user._id
  userHelpers.currentBooking(userid).then((order)=>{
   res.render('order',{order})
  })
 
})
router.get('/completedbooking',(req,res)=>{
  const userid=req.session.user._id
  userHelpers.completedBooking(userid).then((order)=>{
    res.render('completedbooking',{order})
  })
})
router.get('/upcomingbooking',(req,res)=>{
  const userid=req.session.user._id
  userHelpers.upComing(userid).then((order)=>{
    res.render('upcomingbooking',{order})
  })
})
router.get('/aboutus',(req,res)=>{
  res.render('about')
})
router.get('/contactus',(req,res)=>{
  res.render('contact')
})
router.get('/logout',(req,res)=>{
  req.session.loggedIn=false
  req.session.user=false
  res.redirect('/')
})
router.post('/filtercar',(req,res)=>{
  a=req.body
  console.log(a)
  categoryfilter=[]
  for(i of a.filter){
    categoryfilter.push({'category':i})
   
  }
  userHelpers.filter(categoryfilter,req.session.locationcity,req.session.date1,req.session.date2).then((filter)=>{
   CarDetails=filter
   console.log("sajith")
   console.log(CarDetails)
   res.json({CarDetails})
  })
})
module.exports = router;
