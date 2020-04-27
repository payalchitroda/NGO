function menu() {
    fetch("http://localhost:3000/menu", {

    })
      .then((response) => {
        return response.text();
      })
      .then((text) => {
        console.log(text);
        if (text == 'true') {
          console.log("logout");
          document.getElementById('loginnav').style.display = "none";
          
        }
        else {
          console.log("login");
         
 
          document.getElementById('logoutnav').style.display = "none";

        }
      })

      .catch(function () {
        console.log("error");
      });

    }