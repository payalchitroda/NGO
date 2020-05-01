
function registerFor()
{
  var fd = document.getElementById("regisform");
  console.log(fd.name.value);
  var find=document.URL.indexOf('_');
  var type=document.URL.substring(find+1,find+2);
  find=document.URL.indexOf('?');
  var nameofEorC=document.URL.substring(find+1);
var formData = {
    'nameofEorC':nameofEorC,
    'type':type.toUpperCase(),
    'name': fd.name.value,
    'email': fd.email.value,
    'mob': fd.mob.value,
    'city':fd.city.value

  }
  console.log("form"+formData);
        var a1=document.URL.substring(22); 
        console.log("jjj"+a1); 
  fetch("http://localhost:3000/regisFor/"+a1, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),

                })
      
 .then((response) => {
     return response.text();
 })
 .then((mytext) => {
    window.location.href = a1;
     console.log(mytext);
 })

 .catch(function () {
     console.log("error");
 });

 return false;

                    // document.getElementById("regisform").reset();
                    // document.getElementById("regisform").style.width = "0";
                    
}

function openReg() {
    document.getElementById("regisform").style.width = "350px";
  }
  
  function closeReg() {
    document.getElementById("regisform").style.width = "0";
  }