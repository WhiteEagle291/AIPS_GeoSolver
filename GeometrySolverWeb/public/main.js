const connectionString = 'mongodb://localhost:27017';
const socket = io();
var userID = "";
var userName = "";
var bodyID = "";
var length = 0;
let Sum_P = 0;
let Sum_V = 0;

let host = document.body;

let notificationsDiv = document.createElement("div");
notificationsDiv.className="notificationsDiv";
notificationsDiv.id="notificationsDiv";
host.appendChild(notificationsDiv);

let naziv = document.createElement("h1");
naziv.innerHTML=/*window.devicePixelRatio;*/"GeometrySolver";
notificationsDiv.appendChild(naziv);

let notification = document.createElement("div");
notification.className = "notification";
notification.id = "notification";
notificationsDiv.appendChild(notification);

let glavniDiv = document.createElement("div");
glavniDiv.className="glavniDiv";
glavniDiv.id = "glavniDiv";
host.appendChild(glavniDiv);

let canvas = document.createElement("canvas");
canvas.id = "platno3D";
glavniDiv.appendChild(canvas);

function drawPoprecni()
{
    let poprecni = document.createElement("canvas");
    poprecni.className="poprecniPresek";
    poprecni.id="poprecniPresek";
    glavniDiv.appendChild(poprecni);

    let height = poprecni.offsetHeight;
    let width = poprecni.offsetWidth/2;
    poprecni.width = width;
    poprecni.height = height;
    console.log(`Rezolucija prikaza je ${poprecni.width}x${poprecni.height}`);
}
drawPoprecni();

function clearPoprecni()
{
    let platno2D = document.getElementById("poprecniPresek");
    let ctx = platno2D.getContext("2d");
    ctx.clearRect(0, 0, platno2D.width, platno2D.height);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#555555";
    ctx.font = `${platno2D.width/32}px Calibri`;
    let offset = 4;
    let density = 16;
    let factorWidth = platno2D.width / density;
    let factorHeight = platno2D.height / density;

    for (i = 0; i < density; i++)
    {
        ctx.beginPath();
        ctx.moveTo(platno2D.width/density+factorWidth*i,platno2D.height/density);
        ctx.lineTo(platno2D.width/density+factorWidth*i,(density-1)*platno2D.height/density);
        ctx.stroke();
    }

    for (i = 0; i < density-1; i++)
    {
        ctx.beginPath();
        ctx.moveTo(platno2D.width/density,platno2D.height/density+factorHeight*i);
        ctx.lineTo((density-1)*platno2D.width/density,platno2D.height/density+factorHeight*i);
        ctx.stroke();
    }

    //Y-osa
    ctx.strokeStyle = "#00ff00";
    ctx.beginPath();
    ctx.moveTo(platno2D.width/2, platno2D.height / density);
    ctx.lineTo(platno2D.width/2, platno2D.height-factorHeight);
    ctx.stroke();
    ctx.fillText("Y", platno2D.width/2, platno2D.height / density - offset);

    //X-osa
    ctx.strokeStyle = "#ff0000";
    ctx.beginPath();
    ctx.moveTo(platno2D.width/2, platno2D.height-factorHeight);
    ctx.lineTo(platno2D.width-factorWidth, platno2D.height-factorHeight);
    ctx.stroke();
    ctx.fillText("X", platno2D.width-factorWidth + offset, platno2D.height-factorHeight);
}
clearPoprecni();

var menu = document.createElement("div");
menu.className="menuDiv";
menu.id="menuDiv";
glavniDiv.appendChild(menu);
registerLoginForm();


//TODO
function menuDiv()
{

}

//TODO
function canvasResize()
{

}
//ovo treba da se racuna na svaki resize web browser-a
let height = canvas.offsetHeight;
let width = canvas.offsetWidth;
canvas.width = width;
canvas.height = height;
console.log(`Rezolucija prikaza je ${canvas.width}x${canvas.height}`);

canvas = document.querySelector("canvas");
const gl = canvas.getContext('webgl');

if(!gl)
{
    throw new Error("WEBGL NOT SUPPORTED");
}

//unloadovanje struktura za matrice jer drugacije ne radi
const { mat2, mat2d, mat3, mat4, quat, quat2, vec2, vec3, vec4 } = glMatrix;

var vertexData= [
    //koordinatne ose
	// 1.0, 0.0, 0.0,
	// 0.0, 0.0, 0.0,
	// 0.0, 1.0, 0.0,
	// 0.0, 0.0, 0.0,
	// 0.0, 0.0, 1.0,
    // 0.0, 0.0, 0.0
];

var colorData = [
    //boje x,y,z ose
    // 1.0, 0.0, 0.0,
    // 1.0, 0.0, 0.0,
    // 0.0, 1.0, 0.0,
    // 0.0, 1.0, 0.0,
    // 0.0, 0.0, 1.0,
    // 0.0, 0.0, 1.0,
];

var normalData = [
    //normalizovan vektor za svaku stranu 3D modela
];


socket.on("message", message =>{
    let notification = document.getElementById("notification");
    notification.style.backgroundColor = "rgb(20, 150, 20)";
    notification.innerHTML = message;
    setTimeout(resetNotification,2000);
});

socket.on("comment",comment=>{
    let listaKomentara = document.getElementById("commentList");
    listaKomentara.value+=comment+"\n\n";
    listaKomentara.scrollTop = listaKomentara.scrollHeight;
});

socket.on("figureAdded",body=>{
    drawModel(body.bodyID);
});

function redraw(componentID,componentClassName)
{
    let component = document.getElementById(componentID);
    let parent = component.parentNode;
    parent.removeChild(component);

    component = document.createElement("div");
    component.className=componentClassName;
    component.id=componentID;
    parent.appendChild(component);

    return component;
}

function remove(componentID)
{
    let component = document.getElementById(componentID);
    let parent = component.parentNode;
    parent.removeChild(component);
}

function registerLoginForm()
{
    let registerLoginDiv = document.createElement("div");
    registerLoginDiv.className = "registerLoginDiv";
    registerLoginDiv.id = "registerLoginDiv";
    menu.appendChild(registerLoginDiv);

    let divTmp = document.createElement("div");

    let userLabel = document.createElement("label");
    userLabel.innerHTML = "Username:";
    divTmp.appendChild(userLabel);

    var usernameInput = document.createElement("input");
    usernameInput.id = "usernameInput";
    divTmp.appendChild(usernameInput);

    registerLoginDiv.appendChild(divTmp);
    divTmp = document.createElement("div");

    let btnRegister = document.createElement("button");
    btnRegister.innerHTML="Register";
    btnRegister.onclick =async (ev) =>{
        
        if(usernameInput.value!="")
        {
            var newUser = {
                username: usernameInput.value
            };
            let notification = document.getElementById("notification");
            await fetch(`/getUserByUsername?username=${usernameInput.value}`)
            .then(response => response.json())
            .then(data => {
                    if(data!=null && data.username==usernameInput.value)
                    {
                        notification.style.backgroundColor = "rgb(180, 138, 32)";
                        notification.innerHTML = "Account with this username is already registered";
                        setTimeout(resetNotification, 2000);
                    }
                    else
                    {
                        fetch("/createUser", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(newUser),
                        })
                        .then(response => response.json())
                        .then(data => {
                            okNotification(`Account ${newUser.username} registered successfully`);
                        })
                        .catch(error => {
                            console.error("Error registering user:", error);
                        });
                    }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
        }
    }
    divTmp.appendChild(btnRegister);

    let btnLogin = document.createElement("button");
    btnLogin.innerHTML="Login";
    btnLogin.onclick = async (ev) =>{
        if(!usernameInput.value=="")
        {

            let notification = document.getElementById("notification");
            await fetch(`/getUserByUsername?username=${usernameInput.value}`)
                .then(response => response.json())
                .then(data => {
                    if(data!=null)
                    {
                        userID = data._id;
                        userName = data.username;
                        okNotification(`Welcome ${userName}`);
                        redraw("registerLoginDiv","menuDiv");
                        let logoffBtn = document.createElement("button");
                        logoffBtn.innerHTML = "Log off";
                        document.getElementById("registerLoginDiv").appendChild(logoffBtn);
                        modelCreateAndSelect();
                        
                        logoffBtn.onclick=(ev)=>logOffAction();
                    }
                    else
                    {
                        errorNotification(`Account with username ${usernameInput.value} doesn't exist`);
                    }
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    }
    divTmp.appendChild(btnLogin);
    registerLoginDiv.appendChild(divTmp);
}

async function logOffAction()
{
    console.log(bodyID);
    if(bodyID!="")
    {
        let watcher = 
        {
            id: bodyID,
            userID: userID
        }
        await fetch("/deleteWatcher", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(watcher),
        })
        .then(response => response.json())
        .then(data => {
            userID = "";
            userName = "";
            bodyID = "";
            length = 0;
            remove("registerLoginDiv");
            remove("figureInput");
            remove("userInteraction");
            clearPoprecni();
            registerLoginForm();
            // drawGrid(false);
        })
        .catch(error => {
            console.error("Error registering user:", error);
        });
    }
    else
    {
        remove("registerLoginDiv");
        remove("bodiesSelect");
        remove("newProjectDiv");
        registerLoginForm();
    }
}

function okNotification(message)
{
    notification.style.backgroundColor = "rgb(20, 150, 20)";
    notification.innerHTML = message;
    setTimeout(resetNotification, 2000);
}

function warningNotification(message)
{
    notification.style.backgroundColor = "rgb(180, 138, 32)";
    notification.innerHTML = message;
    setTimeout(resetNotification, 2000);
}

function errorNotification(message)
{
    notification.style.backgroundColor = "rgb(192, 64, 64)";
    notification.innerHTML = message;
    setTimeout(resetNotification, 2000);
}

function resetNotification()
{
    let notification = document.getElementById("notification");
    notification.style.backgroundColor = "rgb(90, 90, 95)";
    notification.innerHTML = "";
}

async function removeWatcher()
{
    if(bodyID!="")
    {
        let watcher = 
        {
            id: bodyID,
            userID: userID
        }
        await fetch("/deleteWatcher", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(watcher),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error("Error registering user:", error);
        });
    }
}

function showADialog(e)
{
    var confirmationMessage = `uklonjen watcher`;
    return confirmationMessage;
}

window.addEventListener("beforeunload", function (e) {
    removeWatcher();
    return showADialog(e);  
});

async function modelCreateAndSelect()
{
    let menu = document.getElementById("menuDiv");
    
    let tmp = document.createElement("div");
    tmp.className = "menuDiv";
    tmp.id = "bodiesSelect";
    menu.appendChild(tmp);

    let lbl = document.createElement("label");
    lbl.innerHTML = "Click on a project to open:"
    tmp.appendChild(lbl);
    
    let selectModel = document.createElement("div");
    selectModel.className = "bodiesDiv";
    selectModel.id = "bodiesDiv";
    tmp.appendChild(selectModel);

    await fetch("/getAllBodies")
        .then(response => response.json())
        .then(data => {
                data.forEach(item =>{
                        let bodyOption = document.createElement("button");
                        bodyOption.className = "bodyDiv";
                        bodyOption.innerHTML = item.projectname;
                        bodyOption.onclick = async (ev) =>{

                            bodyID = item._id;
                            length = item.length;
                            figureInput(bodyID);
                            drawModel(bodyID);
                            socket.emit("openbody", bodyID);
                    
                            let BodySent = {
                                user: userID,
                                body: bodyID
                            };
                            
                            await fetch(`/addWatcher`, {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify(BodySent),
                            })
                            .then(response => response.json())
                            .then(data => {
                                    remove("bodiesSelect");
                                    remove("newProjectDiv");
                                })
                            .catch(error => {
                                console.error('Error fetching data:', error);
                            });
                        };
                        selectModel.appendChild(bodyOption);
                })
            })
        .catch(error => {
            console.error('Error fetching data:', error);
    });

    tmp = document.createElement("div");
    tmp.className = "menuDiv";
    tmp.id = "newProjectDiv";
    menu.appendChild(tmp);

    
    lbl = document.createElement("label");
    lbl.innerHTML = "New project name:"
    tmp.appendChild(lbl);
    let bodyNameInput = document.createElement("input");
    bodyNameInput.id = "bodyName"
    tmp.appendChild(bodyNameInput);
    let createBodyBtn = document.createElement("button");
    createBodyBtn.innerHTML="Create project";
    createBodyBtn.onclick =async (ev) =>{

        var newBody = {
            projectname: document.getElementById("bodyName").value,
            creatorID: userID,
            length: 0
        }

        if(document.getElementById("bodyName").value!="")
        {
            await fetch("/createBody", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newBody),
            })
            .then(response => response.json())
            .then(data => {

                console.log(data);

                bodyID = data._id;

                let BodySent = {
                    user: userID,
                    body: data._id
                };

                fetch(`/addWatcher`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(BodySent),
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });

                remove("bodiesSelect");
                remove("newProjectDiv");
                
                if(document.getElementById("figureInput")==null)
                {
                    figureInput(data._id);
                    drawModel(data._id);
                    socket.emit("openbody",(data._id));
                }
                if(document.getElementById("userInteraction")==null)
                {
                    commentSection(data._id);
                }
            })
            .catch(error => {
                console.error("Error registering user:", error);
            });
        }
    };
    tmp.appendChild(createBodyBtn);
}

function figureInput(body)
{
    let figureInput = document.createElement("div");
    figureInput.className = "menuDiv";
    figureInput.id="figureInput";
    menu.appendChild(figureInput);

    let deleteBodyBtn = document.createElement("button");
    deleteBodyBtn.innerHTML="Delete project";
    deleteBodyBtn.onclick = async (ev) => {
        let bodyToDelete = 
        {
            id: body,
            userID: userID
        }
        await fetch("/deleteBody", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(bodyToDelete),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            bodyID="";
            length=0;
            remove("figureInput");
            remove("userInteraction");
            modelCreateAndSelect();
            clearPoprecni();
            // drawGrid(false);
        })
        .catch(error => {
            console.error("Error registering user:", error);
        });
    }
    figureInput.appendChild(deleteBodyBtn);
    
    var label = document.createElement("label");
    label.setAttribute("for", "shapes");
    label.textContent = "Select figure:";
    
    var select = document.createElement("select");
    select.id = "shapes";
    figureInput.appendChild(select);
    figureInput.appendChild(label);
    
    var option1 = document.createElement("option");
    option1.value = "triangle";
    option1.textContent = "Triangle";
    select.appendChild(option1);
    
    var option2 = document.createElement("option");
    option2.value = "trapezoid";
    option2.textContent = "Trapezoid";
    select.appendChild(option2);
    
    var option3 = document.createElement("option");
    option3.value = "rectangle";
    option3.textContent = "Rectangle";
    select.appendChild(option3);
    
    figureInput.appendChild(select);
    
    var aDiv = document.createElement("div");
    let aLabel = document.createElement("label");
    aLabel.innerHTML = "a: ";
    aDiv.appendChild(aLabel);
    
    var a = document.createElement("input");
    a.id = "aInput";
    a.placeholder = "cm";
    a.type = "number";
    aDiv.appendChild(a);
    a.onchange=(ev)=>{
        if(document.getElementById("poprecniPresek"))
    {
        clearPoprecni();
        drawShape(select.value,a.value,b.value,h.value,0);
    }
    }
    figureInput.appendChild(aDiv);
    
    var bDiv = document.createElement("div");
    let bLabel = document.createElement("label");
    bLabel.innerHTML = "b: ";
    bDiv.appendChild(bLabel);
    
    var b = document.createElement("input");
    b.id = "bInput";
    b.placeholder = "cm";
    b.type = "number";
    b.disabled = true;
    bDiv.appendChild(b);
    b.onchange=(ev)=>{
        if(document.getElementById("poprecniPresek"))
    {
        clearPoprecni();
        drawShape(select.value,a.value,b.value,h.value,0);
    }
    }
    figureInput.appendChild(bDiv);
    
    var hDiv = document.createElement("div");
    let hLabel = document.createElement("label");
    hLabel.innerHTML = "h: ";
    hDiv.appendChild(hLabel);
    
    var h = document.createElement("input");
    h.id = "hInput";
    h.placeholder = "cm";
    h.type = "number";
    hDiv.appendChild(h);
    h.onchange=(ev)=>{
        if(document.getElementById("poprecniPresek"))
    {
        clearPoprecni();
        drawShape(select.value,a.value,b.value,h.value,0);
    }
    }
    figureInput.appendChild(hDiv);

    let divTmp = document.createElement("div");

    let izvrnutaLbl = document.createElement("label");
    izvrnutaLbl.innerHTML = "Inverted:";
    divTmp.appendChild(izvrnutaLbl);
    let izvrnutaCheck = document.createElement("input");
    izvrnutaCheck.id="izvrnuta";
    izvrnutaCheck.className="stiklirano";
    izvrnutaCheck.type = "checkbox";
    divTmp.appendChild(izvrnutaCheck);

    let povrsinaDiv = document.createElement("div");
    let povrsinaLbl = document.createElement("label");
    povrsinaLbl.innerHTML = "P: ";
    povrsinaDiv.appendChild(povrsinaLbl);
    let povrsinaPrikaz = document.createElement("div");
    povrsinaPrikaz.id = "povrsina-prikaz";
    povrsinaDiv.appendChild(povrsinaPrikaz);
    divTmp.appendChild(povrsinaDiv);

    let zapreminaDiv = document.createElement("div");
    let zapreminaLbl = document.createElement("label");
    zapreminaLbl.innerHTML = "V: ";
    zapreminaDiv.appendChild(zapreminaLbl);
    let zapreminaPrikaz = document.createElement("div");
    zapreminaPrikaz.id = "zapremina-prikaz";
    zapreminaDiv.appendChild(zapreminaPrikaz);
    divTmp.appendChild(zapreminaDiv);

    figureInput.appendChild(divTmp);
    
    var aa,be,ha;
    let densityLbl = document.createElement("label");
    densityLbl.innerHTML = "Detail quality:";
    figureInput.appendChild(densityLbl);
    var range = document.createElement("input");
    range.id = "range";
    range.setAttribute("type","range");
    range.setAttribute("min",16);
    range.setAttribute("max",192);
    range.value=192;
    figureInput.appendChild(range);
    
    let btnAddFigure = document.createElement("button");
    btnAddFigure.innerHTML = "Insert figure";
    btnAddFigure.onclick = async (ev) => {

        let oblik = document.getElementById("shapes").value;
    
        if(oblik === "rectangle")
        {
            aa = document.getElementById("aInput").value;
            be = document.getElementById("bInput").value;
            ha = -1;
        }
    
        if(oblik === "triangle")
        {
            aa = document.getElementById("aInput").value;
            be = -1;
            ha = document.getElementById("hInput").value;
        }
    
        if(oblik === "trapezoid")
        {
            aa = document.getElementById("aInput").value;
            be = document.getElementById("bInput").value;
            ha = document.getElementById("hInput").value;
        }

        let inverted;
        if(document.getElementById("izvrnuta").checked == true)
        {
            inverted = true;
        }
        else
        {
            inverted = false;
        }

        if(aa==0 || be==0 || ha==0)
        {
            warningNotification("You have to input correct dimensions");
        }
        else
        {
            var newFigure = {
                a:aa,
                b:be,
                h:ha,
                tip:oblik,
                izvrnuta:inverted
            }

            let telo = {
                a:aa,
                b:be,
                h:ha,
                tip:oblik,
                izvrnuta:inverted,
                bodyID:bodyID
            }

            await fetch(`/getWriteUser?id=${bodyID}`)
            .then(response=>response.json())
            .then(data=>{
                if(data.userID != userID)
                {
                    warningNotification("You don't have write privileges");
                }
                else
                {
                    if(length==8)
                    {
                        warningNotification("You can't add more than 8 figures to the body");
                    }
                    else
                    {
                        fetch(`/addFigure?id=${bodyID}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(newFigure),
                        })
                        .then(response => response.json())
                        .then(data => {
                                length = data.length;
                                console.log(length);
                                drawModel(bodyID);
                                socket.emit("figureAdded",telo);
                            })
                        .catch(error => {
                            console.error('Error fetching data:', error);
                        });
                    }
                }
            })
        }
    };
    figureInput.appendChild(btnAddFigure);

    var select = document.getElementById("shapes");
    select.onchange = (ev) => {

    let izabrano = select.value;

    var a = document.getElementById("aInput");

    if (izabrano == "triangle") {
        b.disabled = true;
        b.value = '';
    } else {
        b.disabled = false;
    }
    if (izabrano == "rectangle") {
        h.disabled = true;
        h.value = '';
    } else {
        h.disabled = false;
    }
    if(document.getElementById("poprecniPresek"))
    {
        clearPoprecni();
        drawShape(izabrano,a.value,b.value,h.value,0);
    }
    };
}

function commentSection(bodyID)
{
    let userInteraction = document.createElement("div");
    userInteraction.className = "userInteraction";
    userInteraction.id = "userInteraction";
    host.appendChild(userInteraction);
    
    var btnKomentar = document.createElement("button");
    btnKomentar.innerHTML="Send";
    btnKomentar.onclick =async (ev) =>{
        let komentar = document.getElementById("commentText");
        
        if(komentar.value!="")
        {
            let comment = {
                user: userName,
                content: komentar.value,
                bodyID: bodyID
            }
    
            socket.emit("comment",comment);
            
            let sadrzaj = komentar.value;
            komentar.value="";
            komentar.focus();
            var newCmt = {
                id: bodyID,
                user: userName,
                content: sadrzaj
            };
            fetch("/addComment", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newCmt),
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error("Error registering user:", error);
            });
        }
        else
        {
            notification.style.backgroundColor = "rgb(180, 138, 32)";
            notification.innerHTML = "You cannot send empty comment";
            setTimeout(resetNotification,2000);
        }

    }
    userInteraction.appendChild(btnKomentar);
    
    var komentar = document.createElement("input");
    komentar.placeholder = "Type your comment here...";
    komentar.id = "commentText";
    userInteraction.appendChild(komentar);
    
    var commentList = document.createElement("textarea");
    commentList.id="commentList";
    commentList.readOnly = true;
    userInteraction.appendChild(commentList);    
}

async function drawModel(projectID)
{
    let id = projectID;
    await fetch(`/getBody?id=${id}`)
        .then(response => response.json())
        .then(data => {
            let range_vrednost = 192;
            let cam_height = 0;
            let cam_distance = 0;
            let base_height = 0;
            let normaldir = -1.0;
            let P;
            let V;
            data.figures.forEach(f=>
                {
                    switch(f.tip)
                    {
                        case "triangle":
                            cam_height+=f.h;
                            cam_distance+=f.a;
                            //calculate cone surface and volume: P = aπ(a+s), s = sqrt(a*a+h*h)
                            P = f.a*Math.PI*(f.a+Math.sqrt(f.a*f.a+f.h*f.h));
                            V = (1/3)*(f.a*f.a*Math.PI*f.h);
                            Sum_P+=P;
                            Sum_V+=V;
                            // console.log(`Povrsina kupe je ${P}`);
                            // console.log(`Zapremina kupe je ${V}`);
                            break;
                        case "rectangle":
                            cam_height+=f.b;
                            cam_distance+=f.a;
                            //calculate cylinder surface and volume
                            P = 2*Math.PI*f.a*f.a+2*f.a*Math.PI*f.b;
                            V = f.a*f.a*Math.PI*f.b;
                            Sum_P+=P;
                            Sum_V+=V;
                            // console.log(`Povrsina valjka je ${P}`);
                            // console.log(`Zapremina valjka je ${V}`);
                            break;
                        case "trapezoid":
                            cam_height+=f.h;
                            if(f.a>f.b)
                            {
                                cam_distance+=f.a;
                            }
                            if(f.a<=f.b)
                            {
                                cam_distance+=f.b;
                            }
                            //calculate surface and volume
                            P = Math.PI*(f.b*f.b+f.a*f.a+f.b*Math.sqrt((f.a-f.b)*(f.a-f.b)+f.h*f.h));
                            V = (1/3)*Math.PI*f.h*(f.b*f.b+f.a*f.b+f.a*f.a);
                            Sum_P+=P;
                            Sum_V+=V;
                            // console.log(`Povrsina zarubljene kupe je ${P}`);
                            // console.log(`Zapremina zarubljene kupe je ${V}`);
                            break;
                    }
                })

            let prikaz_P = document.getElementById("povrsina-prikaz");
            prikaz_P.innerHTML = Sum_P.toFixed(2);
    
            let prikaz_V = document.getElementById("zapremina-prikaz");
            prikaz_V.innerHTML = Sum_V.toFixed(2);

            clearPoprecni();

            cam_height = cam_height/2;
            cam_distance = cam_distance/2;
            
            data.figures.forEach(f=>{
            vertexData=[];
            colorData=[];
            normalData=[];
            switch(f.tip)
            {
                case "triangle":
                    //glitchuje kad se dodiruje sa omotacem bilo cega, treba drawTruncatedCone sa prosledjenim h=0.0
                    // drawCircle(range_vrednost,f.a,-1.0,cam_height,base_height,cam_distance,gl.FRONT);
                    vertexData=[];
                    colorData=[];
                    normalData=[];
                    normaldir = -normaldir;
                    drawCone(f.a,f.h,range_vrednost,cam_height,base_height,cam_distance);
                    drawShape("triangle",f.a,f.b,f.h,base_height*16);
                    base_height+=f.h;
                    break;
                case "rectangle":
                    // drawCircle(range_vrednost,f.a,normaldir,cam_height,base_height,cam_distance,gl.FRONT);
                    //draw truncated cone instead, h is 0.0, take into account f-1.a - f.a
                    vertexData=[];
                    colorData=[];
                    normalData=[];
                    normaldir = -normaldir;
                    drawCylinder(f.a,f.b,range_vrednost,cam_height,base_height,cam_distance);
                    drawShape("rectangle",f.a,f.b,f.h,base_height*16);
                    base_height+=f.b;
                    vertexData=[];
                    colorData=[];
                    normalData=[];
                    // drawCircle(range_vrednost,f.a,normaldir,cam_height,base_height,cam_distance,gl.BACK);
                    //same as above, draw truncated cone instead, h is 0.0, take into account f-1.a - f.a
                    normaldir = -normaldir;
                    break;
                case "trapezoid":
                    // drawCircle(range_vrednost,f.a,normaldir,cam_height,base_height,cam_distance,gl.FRONT);
                    //draw truncated cone instead, h is 0.0, take into account f-1.a - f.a
                    vertexData=[];
                    colorData=[];
                    normalData=[];
                    normaldir = -normaldir;
                    drawTruncatedCone(f.a,f.b,f.h,range_vrednost,cam_height,base_height,cam_distance);
                    drawShape("trapezoid",f.a,f.b,f.h,base_height*16);
                    base_height+=f.h;
                    vertexData=[];
                    colorData=[];
                    normalData=[];
                    // drawCircle(range_vrednost,f.b,normaldir,cam_height,base_height,cam_distance,gl.BACK);
                    //draw truncated cone instead, h is 0.0, take into account f-1.a - f.a
                    break;
            }
            });
            
            //sum of surface and volumes is shown

            let listaKomentara = document.getElementById("commentList");
            if(listaKomentara==null)
            {
                commentSection(projectID);
                listaKomentara = document.getElementById("commentList");
                data.comments.forEach(cmt=>{
                        listaKomentara.value+=cmt.user+" "+cmt.time+" "+cmt.content+"\n\n";
                        listaKomentara.scrollTop = listaKomentara.scrollHeight;
                    });
            }
            if(document.getElementById("userInteraction")==null)
            {
                commentSection(id);
            }
            })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function drawShape(type,a,b,h,base2DHeight)
{
    var canvas = document.getElementById("poprecniPresek");
    var ctx = canvas.getContext("2d");
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#ffffff";
    ctx.font = `${canvas.width/32}px Calibri`;
    let offset = 4;
    let density = 16;
    let factorWidth = canvas.width / density;
    let factorHeight = canvas.height / density;

    ctx.strokeStyle = "#ffff00";

    if (type === "triangle") 
    {
        // ctx.fillText(`a:${a} h:${h}`, canvas.width/20, canvas.height/20);

        ctx.beginPath();
        ctx.moveTo(canvas.width/2, canvas.height - factorHeight - base2DHeight);
        ctx.lineTo(canvas.width/2 + a*density, canvas.height - factorHeight - base2DHeight);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(canvas.width/2 + a*density, canvas.height - factorHeight - base2DHeight);
        ctx.lineTo(canvas.width/2, canvas.height-factorHeight - h*density - base2DHeight);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(canvas.width/2, canvas.height - factorHeight - h*density - base2DHeight);
        ctx.lineTo(canvas.width/2, canvas.height - factorHeight - base2DHeight);
        ctx.stroke();

        // ctx.font = `${canvas.width/24}px Calibri`;
        ctx.fillText(a, canvas.width/2 + a*density/2, canvas.height - factorHeight + 4*offset - base2DHeight);
        ctx.fillText(h, canvas.width/2 - 4*offset, canvas.height-factorHeight - h*density/2 - base2DHeight);
    }
    else if (type === "trapezoid") 
    {
        // ctx.fillText(`a:${a} b:${b} h:${h}`, canvas.width/20, canvas.height/20);
        ctx.beginPath();
        ctx.moveTo(canvas.width/2, canvas.height-factorHeight - base2DHeight);
        ctx.lineTo(canvas.width/2+a*density, canvas.height-factorHeight - base2DHeight);
        ctx.lineTo(canvas.width/2+b*density, canvas.height-factorHeight-h*density - base2DHeight);
        ctx.lineTo(canvas.width/2, canvas.height-factorHeight-h*density - base2DHeight);
        ctx.closePath();
        ctx.stroke();
        // ctx.font = `${canvas.width/24}px Calibri`;
        ctx.fillText(a, canvas.width/2 + a*density/2, canvas.height - factorHeight + 4*offset - base2DHeight);
        ctx.fillText(b, canvas.width/2 + b*density/2, canvas.height - factorHeight - h*density + 4*offset - base2DHeight);
        ctx.fillText(h, canvas.width/2 - 4*offset, canvas.height-factorHeight - h*density/2 - base2DHeight);
    }
    else if (type === "rectangle") 
    {
        // ctx.fillText(`a:${a} b:${b}`, canvas.width/20, canvas.height/20);
        ctx.strokeRect(canvas.width/2, canvas.height - factorHeight - base2DHeight, a*density, -b*density );
        // ctx.font = `${canvas.width/24}px Calibri`;
        ctx.fillText(a, canvas.width/2 + a*density/2, canvas.height - factorHeight + 4*offset - base2DHeight);
        ctx.fillText(b, canvas.width/2 - 4*offset, canvas.height-factorHeight - b*density/2 - base2DHeight);
    }
}

function modelColor()
{
    return [0.6,0.6,0.6];
}

function drawGrid(rotating)
{
    vertexData= [
        //koordinatne ose
        1.0, 0.0, 0.0,
        0.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 0.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 0.0
    ];
    
    colorData = [
        //boje x,y,z ose
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
    ];

    normalData = [
        //vektor normale
        0.0,1.0,0.0,
        0.0,1.0,0.0,
        0.0,1.0,0.0,
        0.0,1.0,0.0,
        0.0,1.0,0.0,
        0.0,1.0,0.0,
    ];

    let density = 8;
    let size = 4.0;
    let factor = size/density;
    
    for (i = 0; i <= density*2; i++)
        {
            gridVertex1 = [size,-0.01,-size+factor*i];
            gridVertex2 = [-size,-0.01,-size+factor*i];
            vertexData.push(...gridVertex1);
            vertexData.push(...gridVertex2);
            gridColor = [0.6,0.6,0.6];
            colorData.push(...gridColor);
            colorData.push(...gridColor);
            normalData.push(...[0.0,1.0,0.0]);
            normalData.push(...[0.0,1.0,0.0]);
            gridVertex3 = [size-factor*i,-0.01,size];
            gridVertex4 = [size-factor*i,-0.01,-size];
            vertexData.push(...gridVertex3);
            vertexData.push(...gridVertex4);
            colorData.push(...gridColor);
            colorData.push(...gridColor);
            normalData.push(...[0.0,1.0,0.0]);
            normalData.push(...[0.0,1.0,0.0]);
        }
    webgl(gl.LINES,rotating,1.0,1.0,gl.BACK);
}
// drawGrid(false);

function drawCircle(dense,r,normalDir,camheight,height,cam_distance,cullDir)
{
    let density = dense;
    let size = r;
    let theta = (Math.PI*2)/density;
    let cosine = Math.cos(theta);
    let sine = Math.sin(theta);

    circleCenter = [0.0,height,0.0];
    vertexData.push(...circleCenter);
    colorData.push(...modelColor());
    normalData.push(...[0.0,normalDir,0.0]);

    circleVertex = [size,height,0.0];
    vertexData.push(...circleVertex);
    colorData.push(...modelColor());
    normalData.push(...[0.0,normalDir,0.0]);
    for(i=0;i<density;i++)
    {
        circleVertex = [cosine*circleVertex[0]+sine*circleVertex[2],height,-sine*circleVertex[0]+cosine*circleVertex[2]];
        vertexData.push(...circleVertex);
        vertexData.push(...circleVertex);
        colorData.push(...modelColor());
        colorData.push(...modelColor());
        normalData.push(...[0.0,normalDir,0.0]);
        normalData.push(...[0.0,normalDir,0.0]);
    }
    webgl(gl.TRIANGLE_FAN,false,camheight,cam_distance,cullDir);
}

function drawCone(a,h,dense,cam_height,base_height,cam_distance)
{
    if(a==0 || h==0)
    {
        console.log("nepopunjene dimenzije");
    }
    else
    {
        
        let density = dense;
        let size = a;
        
        let theta = (Math.PI*2)/density;
        let cosine = Math.cos(theta);
        let sine = Math.sin(theta);
        circleVertex = [size,base_height,0.0];

        for(i=0;i<=density;i++)
        {
            coneTipVertex = [0.0,h+base_height,0.0];
            vertexData.push(...coneTipVertex);
            colorData.push(...modelColor());
            
            vertexData.push(...circleVertex);
            colorData.push(...modelColor());

            vector1=[circleVertex[0]-coneTipVertex[0],circleVertex[1]-coneTipVertex[1],circleVertex[2]-coneTipVertex[2]];

            circleVertexOld = circleVertex;

            circleVertex = [cosine*circleVertex[0]+sine*circleVertex[2],base_height,-sine*circleVertex[0]+cosine*circleVertex[2]];
            vertexData.push(...circleVertex);
            colorData.push(...modelColor());

            vector2 = [circleVertex[0]-circleVertexOld[0],circleVertex[1]-circleVertexOld[1],circleVertex[2]-circleVertexOld[2]];
            
            // U-vector1, V-vector2
            // Nx = UyVz - UzVy
            // Ny = UzVx - UxVz
            // Nz = UxVy - UyVx
            normalVector = [vector1[1]*vector2[2]-vector1[2]*vector2[1],
            vector1[2]*vector2[0]-vector1[0]*vector2[2],
            vector1[0]*vector2[1]-vector1[1]*vector2[0]];
            let normalMagnitude = Math.sqrt(normalVector[0]*normalVector[0]+normalVector[1]*normalVector[1]+normalVector[2]*normalVector[2]);
            normalVector = [normalVector[0]/normalMagnitude,normalVector[1]/normalMagnitude,normalVector[2]/normalMagnitude];

            normalData.push(...normalVector);
            normalData.push(...normalVector);
            normalData.push(...normalVector);

        }
        webgl(gl.TRIANGLES,false,cam_height,cam_distance,gl.BACK);
    }
        
}

function drawCylinder(a,b,dense,cam_height,base_height,cam_distance)
{
    if(a==0 || b==0)
    {
        console.log("nepopunjene dimenzije");
    }
    else
    {
        let theta = (Math.PI*2)/dense;
        let cosine = Math.cos(theta);
        let sine = Math.sin(theta);

        let radius = a;
        let height = b;

        for(i=0;i<=dense;i++)
        {
            if(i==0)
            {
                //prvo teme trouglica
                wrapVertexTop = [radius,height+base_height,0.0];
                vertexData.push(...wrapVertexTop);
                colorData.push(...modelColor());
        
                //drugo teme trouglica
                wrapVertexBottom = [radius,base_height,0.0];
                vertexData.push(...wrapVertexBottom);
                colorData.push(...modelColor());
            }
            else
            {
                vertexData.push(...wrapVertexTop);
                colorData.push(...modelColor());
                vertexData.push(...wrapVertexBottom);
                colorData.push(...modelColor());
            }

            //prvi vektor za cross product: U = p2-p1
            vector1=[wrapVertexBottom[0]-wrapVertexTop[0],wrapVertexBottom[1]-wrapVertexTop[1],wrapVertexBottom[2]-wrapVertexTop[2]];
        
            wrapVertexTopOld = wrapVertexTop;

            //trece teme trouglica
            wrapVertexTop = [cosine*wrapVertexTop[0]+sine*wrapVertexTop[2],height+base_height,-sine*wrapVertexTop[0]+cosine*wrapVertexTop[2]];
            vertexData.push(...wrapVertexTop);
            colorData.push(...modelColor());

            //drugi vektor za cross product: V = p3-p1
            vector2 = [wrapVertexTop[0]-wrapVertexTopOld[0],wrapVertexTop[1]-wrapVertexTopOld[1],wrapVertexTop[2]-wrapVertexTopOld[2]];

            // U-vector1, V-vector2
            // Nx = UyVz - UzVy
            // Ny = UzVx - UxVz
            // Nz = UxVy - UyVx
            normalVector = [vector1[1]*vector2[2]-vector1[2]*vector2[1],
            vector1[2]*vector2[0]-vector1[0]*vector2[2],
            vector1[0]*vector2[1]-vector1[1]*vector2[0]];
            let normalMagnitude = Math.sqrt(normalVector[0]*normalVector[0]+normalVector[1]*normalVector[1]+normalVector[2]*normalVector[2]);
            normalVector = [normalVector[0]/normalMagnitude,normalVector[1]/normalMagnitude,normalVector[2]/normalMagnitude];
            
            //provera da li su normalni vektori jedinicni
            // normalMagnitude = Math.sqrt(normalVector[0]*normalVector[0]+normalVector[1]*normalVector[1]+normalVector[2]*normalVector[2]);
            // console.log(normalMagnitude);

            //cetiri normale jer pushujemo 4 vertexa po ciklusu petlje
            normalData.push(...normalVector);
            normalData.push(...normalVector);
            normalData.push(...normalVector);
            normalData.push(...normalVector);
            
            wrapVertexBottom = [cosine*wrapVertexBottom[0]+sine*wrapVertexBottom[2],base_height,-sine*wrapVertexBottom[0]+cosine*wrapVertexBottom[2]];
            vertexData.push(...wrapVertexBottom);
            colorData.push(...modelColor());
        }
        webgl(gl.TRIANGLE_STRIP,false,cam_height,cam_distance,gl.BACK);
    }
}

function drawTruncatedCone(a,b,h,dense,cam_height,base_height,cam_distance)
{
    if(a==0 || b==0 || h==0)
    {
        console.log("nepopunjene dimenzije");
    }
    else
    {
        let theta = (Math.PI*2)/dense;
        let cosine = Math.cos(theta);
        let sine = Math.sin(theta);

        let outer = a;
        let inner = b;
        let height = h;

        for(i=0;i<dense;i++)
        {
            if(i==0)
            {
                wrapVertexInner = [inner,height+base_height,0.0];
                wrapVertexOuter = [outer,base_height,0.0];
                vertexData.push(...wrapVertexInner);
                vertexData.push(...wrapVertexOuter);
                colorData.push(...modelColor());
                colorData.push(...modelColor());
            }
            else
            {
                vertexData.push(...wrapVertexInner);
                vertexData.push(...wrapVertexOuter);
                colorData.push(...modelColor());
                colorData.push(...modelColor());
            }

            vector1=[wrapVertexOuter[0]-wrapVertexInner[0],wrapVertexOuter[1]-wrapVertexInner[1],wrapVertexOuter[2]-wrapVertexInner[2]];

            wrapVertexInnerOld = wrapVertexInner;

            wrapVertexInner = [cosine*wrapVertexInner[0]+sine*wrapVertexInner[2],height+base_height,-sine*wrapVertexInner[0]+cosine*wrapVertexInner[2]];
            vertexData.push(...wrapVertexInner);
            colorData.push(...modelColor());

            vector2 = [wrapVertexInner[0]-wrapVertexInnerOld[0],wrapVertexInner[1]-wrapVertexInnerOld[1],wrapVertexInner[2]-wrapVertexInnerOld[2]];

            // U-vector1, V-vector2
            // Nx = UyVz - UzVy
            // Ny = UzVx - UxVz
            // Nz = UxVy - UyVx
            normalVector = [vector1[1]*vector2[2]-vector1[2]*vector2[1],
            vector1[2]*vector2[0]-vector1[0]*vector2[2],
            vector1[0]*vector2[1]-vector1[1]*vector2[0]];
            let normalMagnitude = Math.sqrt(normalVector[0]*normalVector[0]+normalVector[1]*normalVector[1]+normalVector[2]*normalVector[2]);
            normalVector = [normalVector[0]/normalMagnitude,normalVector[1]/normalMagnitude,normalVector[2]/normalMagnitude];

            normalData.push(...normalVector);
            normalData.push(...normalVector);
            normalData.push(...normalVector);
            normalData.push(...normalVector);

            wrapVertexOuter = [cosine*wrapVertexOuter[0]+sine*wrapVertexOuter[2],base_height,-sine*wrapVertexOuter[0]+cosine*wrapVertexOuter[2]];
            vertexData.push(...wrapVertexOuter);
            colorData.push(...modelColor());
        }
        webgl(gl.TRIANGLE_STRIP,false,cam_height,cam_distance,gl.BACK);
    }
}
