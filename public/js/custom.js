    // video icon changeover
    $('#v-icons').click(function() {
        $('#v-icons i').toggleClass('fas fa-video');
        $('#v-icons i').toggleClass('fas fa-video-slash');
    });

    // left side meeting details
    $(document).ready(function(){
        $('#btn').click(function(event){
            event.stopPropagation();
            $(".showup").toggle("fast");
        });
        // present now button
        $('#present-btn').click(function(event){
            event.stopPropagation();
            $("#present").toggle("fast");
        });
        // three vertical dots
        $('#b_pop-btn').click(function(event){
            event.stopPropagation();
            $("#b_pop").toggle("fast");
        });      
    });

    $(document).on("click", function () {
        $(".showup").hide();
    });

    $(document).on("click", function () {
        $("#present").hide();
    });
    

    $(document).on("click", function () {
        $("#b_pop").hide();         
    });

    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
        getUserDet();
    });

    $("#close").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });

    function getUserDet(){       
        var xhr = new XMLHttpRequest();
        xhr.onload = function(){
            var resp = JSON.parse(xhr.responseText);                   
            var myDate = new Date();            
            if(resp.Resp==1){
                var data = resp.data; 
                var add_html = "<ul>";
                for (var user in data) {
                    console.log("user================",user);                    
                    add_html += "<li><div ><img class='profile_m_img' src='images/man-profile.jpg' alt='img'> </div> <span> "+data[user].Name+"</span> </li>";
                }
                add_html +="</ul>";
                document.getElementById("add_people").innerHTML = add_html;                
            }
            console.log("resp================",resp);
        } // success case
        xhr.onerror = function(){
            alert (xhr.responseText); 
        } // failure case
        xhr.open ("POST", "https://stgmc.bharatmatrimony.com:8080/getUsers", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send();
        return false;
    }

    // sidebar
    function openNav() {
        document.getElementById("mySidebar").style.width = "250px";
        document.getElementById("main").style.marginLeft = "250px";
    }

    function closeNav() {
        document.getElementById("mySidebar").style.width = "0";
        document.getElementById("main").style.marginLeft= "0";
    }

    $('#show').click(function() {
        $('.video-bar').toggleClass("hd");
    });   

    $('.nav-tabs >  a').hover(function() {
        $(this).tab('show');
    });

    // home page three dots popup
    window.addEventListener('mouseup',function(event){
        var test = document.getElementById('pol');
        if(event.target != test && event.target.parentNode != test){
            test.style.display = 'none';
        }
    }); 