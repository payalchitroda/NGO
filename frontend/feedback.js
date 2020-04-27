function openForm() {
    document.getElementById("myForm").style.display = "block";
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
    fetch("http://localhost:3000/acceptFeedback", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),

    })
      .catch(function () {
        console.log("error");
      });

  }