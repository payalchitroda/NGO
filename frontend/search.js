function redir() {
    var name = document.getElementById('myInput');
    console.log("he;" + name.value);
    fetch("http://localhost:3000/display_camp.html/" + name.value.toUpperCase(), options)
        .then((response) => {
            return response.json();
        }).then((dis) => {
            dis.forEach(function (disp) {
                if (name.value.toUpperCase() == disp.c_name.toUpperCase()) {
                    console.log("dis " + disp.c_name)
                    window.location = "http://localhost:5000/display_camp?" + disp.c_name.toUpperCase();
                }
            })
        })
        .catch(function () {
            console.log("error");
        });
    fetch("http://localhost:3000/display_event.html/" + name.value.toUpperCase(), options)
        .then((response) => {
            return response.json();
        }).then((dis) => {
            dis.forEach(function (disp) {
                if (name.value.toUpperCase() == disp.e_name.toUpperCase()) {
                    window.location = "http://localhost:5000/display_event?" + disp.e_name.toUpperCase();
                }
            })
        })
        .catch(function () {
            console.log("error");
        });
}




const show = () => {
    let myTable = document.getElementById('myTable');
    myTable.style.display = "";
}
const hide = () => {
    let myTable = document.getElementById('myTable');
    myTable.style.display = "none";
}

const searchFunc = () => {
    let filter = document.getElementById('myInput').value.toUpperCase();
    let myTable = document.getElementById('myTable');
    let tr = myTable.getElementsByTagName('tr');
    for (var i = 0; i < tr.length; i++) {
        let td = tr[i].getElementsByTagName('td')[0];
        if (td) {
            let textvalue = td.textContent || td.innerHTML;
            if (textvalue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            }
            else {
                tr[i].style.display = "none";
            }
        }
    }
}
function attachFetch(fetchAll) {
    const a = document.getElementById("myTable");
    const table = document.createElement('table');
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    const alink = document.createElement('a');
    if (fetchAll.type == 'C') {
        alink.setAttribute("href", "http://localhost:5000/display_camp?" + fetchAll.c_name);
        alink.innerText = fetchAll.c_name;
    }
    else if (fetchAll.type == 'E') {
        alink.setAttribute("href", "http://localhost:5000/display_event?" + fetchAll.e_name);
        alink.innerText = fetchAll.e_name;
    }
    else {
        //logic of article
    }
    td.appendChild(alink);
    tr.appendChild(td);
    table.appendChild(tr);
    a.appendChild(table);
}
function load() {

    fetch("http://localhost:3000/campFetch", options)
        .then((response) => {
            return response.json();
        })
        .then((campaign) => {
            campaign.forEach(function (camp) {
                attachFetch(camp);
            })
        })
        .catch(function () {
            console.log("error");
        });
    fetch("http://localhost:3000/eventFetch", options)
        .then((response) => {
            return response.json();
        })
        .then((events) => {
            events.forEach(function (event) {
                attachFetch(event);
            })
        })
        .catch(function () {
            console.log("error");
        });

}