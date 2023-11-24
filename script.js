// ----imports--&--Configuretion---//
 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
    import { getDatabase, ref, set, get, child, update, remove } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";
 const firebaseConfig = {
   apiKey: "AIzaSyBagKXtLfw8XiB9hsdbRaI4ohsXR-fl1KI",
   authDomain: "elite-bank-9ccef.firebaseapp.com",
   projectId: "elite-bank-9ccef",
   storageBucket: "elite-bank-9ccef.appspot.com",
   messagingSenderId: "1028806331587",
   appId: "1:1028806331587:web:32b1d78a1a6833c1f62676"
 };
// --------------------------------------//
window.onload = function(){
    const app = initializeApp(firebaseConfig);
    const db = getDatabase();
    const dbRef = ref(db);

    document.getElementById('switchToReg').onclick = switchToRegister;
    document.getElementById('switchToLogin').onclick = switchToLogin;
    document.getElementById('login-btn').onclick = loginValidation;
    document.getElementById('register-btn').onclick = registerValidation;

    //-------switch to register--//
    function switchToRegister(){
        document.getElementById('register-portal').style = "display: inline-block";
        document.getElementById("login-portal").style = "display: none";
    }
    //-------switch to login--//
    function switchToLogin(){
        document.getElementById('register-portal').style = "display: none";
        document.getElementById("login-portal").style = "display: inline-block";
    }


    //-------Account no and pin pattern---//
    var accNoPattern = "^[0-9]{6}$";
    var accPinPattern = "^[0-9]{4}$";
    //-------login validation--//
    function loginValidation(){
        var lAccNo = document.getElementById('lAccNo').value;
        var lAccPin = document.getElementById('lAccPin').value;
        if(lAccNo.match(accNoPattern) && lAccPin.match(accPinPattern)){
            get(child(dbRef, "accNo "+lAccNo+"/accPin "+lAccPin+"/accDetails")).then((snapshot)=>{
                if(snapshot.exists()){
                    portal(lAccNo, lAccPin);
                }else{
                    alert("No data found in database");
                }
            }).catch((error)=>{
                alert("Error in getting data\n"+error);
            });
        }
        else{
            alert("Please enter valid details");
        }
    }

    //-------Register validation--//
    function registerValidation(){
        var rAccNo = document.getElementById('rAccNo').value;
        var rAccPin = document.getElementById('rAccPin').value;
        var rAccName = document.getElementById('rAccName').value;
        var rConAccPin = document.getElementById('rConAccPin').value;
        if(rAccName != null && rAccNo.match(accNoPattern) && rAccPin.match(accPinPattern) && rAccPin == rConAccPin){
            get(child(dbRef, "accNo "+rAccNo+"/accPin "+rAccPin+"/accDetails")).then((snapshot)=>{
                if(snapshot.exists()){
                    alert("Account already exists");
                    switchToLogin();
                }
                else{
                    set(ref(db, "accNo " + rAccNo + "/accPin " +rAccPin+"/accDetails"), {
                        name: rAccName,
                        avalBal: 0
                    }).then(()=>{
                        alert("Registration Successful");
                        switchToLogin();
                    }).catch((error)=>{
                        alert("Registration Failed\n"+error);
                    });

                    set(ref(db, "accNo "+rAccNo+"/received"),{
                        receivedAmt: 0
                    }).then(()=>{
                        console.log("Received amount updated");
                    }).catch((error)=>{
                        console.log("Received amount updation failed\n"+error);
                    });
                }
            }).catch((error)=>{
                alert("Error in getting data\n"+error);
            });
        }else{
            alert("Please enter valid details");
        }
    }
    //-------Portal---------//
    function portal(accNo, accPin){
        document.getElementById('login-portal').style = "display: none";
        document.getElementById('register-portal').style = "display: none";
        document.getElementById('portal').style = "display: inline-block";
    
        var name,avalBal,totalBal, receivedAmt, mesg;

        //------------getting data from firebase---------//
        get(child(dbRef, "accNo "+accNo+"/accPin "+accPin+"/accDetails")).then((snapshot)=>{
            if(snapshot.exists()){
                name = snapshot.val().name;
                avalBal = snapshot.val().avalBal;
                document.getElementById('userName').innerHTML = 'Hello '+name;
            }else{
                alert("No data found in database");
            }
        }).catch((error)=>{
            alert("Error in getting data\n"+error);
        });

        get(child(dbRef, "accNo "+accNo+"/received")).then((snapshot)=>{
            if(snapshot.exists()){
                receivedAmt = snapshot.val().receivedAmt;
                totalBal = avalBal + receivedAmt;
                mesg = "Welcome, "+name;
                updateAvalBal(mesg, totalBal);
                updateReceivedAmt();
            }else{
                alert("No received data found in database");
            }
        }).catch((error)=>{
            alert("Error in getting data\n"+error);
        });


        ///-----------------update values in fireBase-----------------//
        function updateAvalBal(mesg, totalBal){
            update(ref(db, "accNo "+accNo+"/accPin "+accPin+"/accDetails"),{
                avalBal: totalBal
            }).then(()=>{
                document.getElementById('totalBal').innerHTML = "Total Balance: "+totalBal;
            }).catch((error)=>{
                alert("error\n"+error);
            });
        }

        function updateReceivedAmt(){
            update(ref(db, "accNo "+accNo+"/received"),{
                receivedAmt: 0
            }).then(()=>{
                console.log("Received amount updated");
            }).catch((error)=>{
                alert("error\n"+error);
            });
        }
        //------------------deposit portal----------------//
        document.getElementById('deposit-btn').addEventListener('click', deposit);

        function deposit(){
            document.getElementById('deposit-portal').style = "display: inline-block";
            document.getElementById('withdraw-portal').style = "display: none";
            document.getElementById('transfer-portal').style = "display: none";

            document.getElementById('dep-submit').addEventListener('click', function(){
                document.getElementById('deposit-btn').removeEventListener('click', deposit);
                var depositAmt = Number(document.getElementById('deposit-amt').value);
                if(depositAmt >= 100){
                    totalBal += depositAmt;
                    document.getElementById('deposit-amt').value = '';
                    mesg = "The amount of "+depositAmt+" has been successfully deposited";
                    updateAvalBal(mesg, totalBal);
                
                }else{
                    alert('Minimum deposit amount is 100');
                }
            });
        }

        //------------------withdraw portal----------------//
        document.getElementById('withdraw-btn').addEventListener('click', withdraw);
        function withdraw(){
            document.getElementById('deposit-portal').style = "display: none";
            document.getElementById('withdraw-portal').style = "display: inline-block";
            document.getElementById('transfer-portal').style = "display: none";

            document.getElementById('with-submit').addEventListener('click', function(){
                document.getElementById('withdraw-btn').removeEventListener('click', withdraw);
                var withdrawAmt = Number(document.getElementById('withdraw-amt').value);
                if(withdrawAmt >= 100){
                    if(withdrawAmt > totalBal){
                        alert("Insufficient Balance");
                        return;
                    }
                    totalBal -= withdrawAmt;
                    document.getElementById('withdraw-amt').value = '';
                    mesg = "The amount of "+ withdrawAmt+" has been successfully withdrawn";
                    updateAvalBal(mesg, totalBal);
                
                }else{
                    alert('Minimum withdraw amount is 100');
                }
            });
        }

        //------------------transfer portal----------------//
        document.getElementById('transfer-btn').addEventListener('click', transfer);
        function transfer(){
            document.getElementById('deposit-portal').style = "display: none";
            document.getElementById('withdraw-portal').style = "display: none";
            document.getElementById('transfer-portal').style = "display: inline-block";
        
            document.getElementById('transfer-submit').addEventListener('click', function(){
                document.getElementById('transfer-btn').removeEventListener('click', transfer);

                var transferAccNo = document.getElementById('transfer-acc-no').value;
                var transferAmt = Number(document.getElementById('transfer-amt').value);

                document.getElementById('transfer-acc-no').value = '';
                document.getElementById('transfer-amt').value = '';
                if(transferAccNo.match(accNoPattern) && transferAmt >= 100){
                    
                    update(ref(db, "accNo "+transferAccNo+"/received"), {
                        receivedAmt: transferAmt
                    }).then(()=>{
                        totalBal -= transferAmt;
                        document.getElementById('transfer-amt').value = '';
                        mesg = "The amount of "+ transferAmt+" has been successfully transfered to "+transferAccNo+" account";
                        updateAvalBal(mesg, totalBal);
                    }).catch((error)=>{
                        alert("error\n"+error);
                    });
                }else{
                    alert('Minimum withdraw amount is 100');
                }
            });
        }
    }


}