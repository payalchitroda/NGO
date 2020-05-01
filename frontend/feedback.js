function openForm() {
    document.getElementById("myForm").style.display = "block";
  }
var url;
function url()
{
  url=document.URL;
  console.log("url is "+url);
}
  function closeForm() {
    document.getElementById("myForm").style.display = "none";
  }
  function send() {

   var fd = document.getElementById("feedback");
    var formData = {
      'name': fd.name.value,
      'email': fd.email.value,
      'msg': fd.msg.value,

    }
        console.log("form"+formData);
        var a1=document.URL.substring(22); 
        console.log("jjj"+a1); 
    fetch("http://localhost:3000/acceptFeedback/"+a1, {
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
  }
  