var point={
    calicut:['calicut Railwaystation','calicut Airport','calicut Beach'],
    kochi:['south Railwaystation','cochin Airport','North Railwaystation'],
    trivandrum:['Trivandrum Airport','Railwaystation']
}
//getting the main and sub menus
var main=document.getElementById('main_menu');
var sub=document.getElementById('sub_menu');

main.addEventListener('change',function(){
    var selected_option=point[this.value];

    while(sub.options.length > 0){
        sub.options.remove(0);
    }

    Array.from(selected_option).forEach(function(el){
        let option = new Option(el,el);
        sub.appendChild();
    })
})