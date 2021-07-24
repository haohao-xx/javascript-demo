    var banner=document.querySelector(".banner_list");
    var sidebtn=document.querySelectorAll("#banner span");
    var imgs=document.querySelectorAll(".banner_list li");
    var bars=document.querySelectorAll(".banner_btn li");
    /* console.log(imgs[0].clientWidth) *///1080
    var index=0
    var preindex=index;
    sidebtn[1].onclick=leftmove;//左移按钮
    sidebtn[0].onclick=function(){
        if(index==0)
        {
            bars[index].classList.remove("on");
            index=3;
            let movex=-(index)*1080+"px";
            banner.style.transform=`translateX(${movex})`;
            bars[index].classList.add("on");
            return
        }
        bars[index].classList.remove("on");
        let movex=-(index-1)*1080+"px";
        banner.style.transform=`translateX(${movex})`;
        index--;
        bars[index].classList.add("on");
    }
    for(let i = 0; i < bars.length; i++){
        bars[i].onclick = function(){
            bars[preindex].classList.remove("on")
            bars[i].classList.add("on");
            let moveX = -(imgs[0].clientWidth * i) + "px";
            preindex=i;
            banner.style.transform = `translateX(${moveX})`;
        }
    }
    function leftmove(){
        if(index==3)
        {
            bars[index].classList.remove("on");
            banner.style.transform=`translateX(0px)`;
            index=0;
            bars[index].classList.add("on");
            return
        }
        bars[index].classList.remove("on");
        let movex=-(index+1)*1080+"px";
        banner.style.transform=`translateX(${movex})`;
        index++;
        bars[index].classList.add("on");
    }
    
    var time=setInterval(leftmove,2000)//建立定时器

    function stop(){
        clearInterval(time)
    }
    function start(){
        clearInterval(time);
        time=setInterval(leftmove,2000)
    }
    banner.onmouseenter=stop;
    banner.onmouseleave=start;
    
    onblur=function(){
        stop()
    }
    onfocus=function(){
        start()
    }