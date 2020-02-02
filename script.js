//control k + f 코드 자동정렬


//전역변수
var modify = false; //현재 북마크를 수정할수있는 상태인지 아닌지 판단하는 변수
var del = false; //현재 북마크를 삭제하고 있는 상태인지 아닌지 판단하는 변수
var gachonPages = [
    ["네이버", "https://www.naver.com/", "https://www.naver.com/favicon.ico?1"],
    ["구글", "https://www.google.co.kr/", "https://www.google.co.kr/favicon.ico"],
    ["유튜브", "https://www.youtube.com/", "https://s.ytimg.com/yts/img/favicon_32-vflOogEID.png"],
    ["다음", "https://www.daum.net/", "https://www.daum.net/favicon.ico"],
    ["페이스북", "https://ko-kr.facebook.com/", "https://static.xx.fbcdn.net/rsrc.php/yo/r/iRmz9lCMBD2.ico"],
    ["네이버 뉴스", "https://news.naver.com/", "https://ssl.pstatic.net/static.news/image/news/2014/favicon/favicon.ico"],
];//기본페이지들 

//입력받은 페이지 이름과 주소를 저장한다. 
var inputAddress = "https://www.naver.com/";
var inputName = null;

//페이지 객체 생성자
var Page = function (name, address, imgUrl) {
    this.name = name;
    this.address = address;
    this.imgUrl = imgUrl;
}

//메인 jquery 스크립트
$(document).ready(function () {
    Pages = [];

    //로컬저장소가 비어있을 경우 - 최초 실행시 한번만 가천배열을 어펜드 해줌. 
    if (localStorage.getItem("Pages") == null) {
        appendGachonPages();
    }
    //아닐 경우 전부 읽어와서 페이지에 저장
    else {
        Pages = JSON.parse(localStorage.getItem("Pages"));
    }
    //현재 배열을 제대로 읽어오는지 확인하는 코드
    // console.log(Pages);
    //읽어온 페이지 길이만큼 읽어주면서 하나씩 만들어서 어펜드. 
    appendPages();
    //읽어온 페이지에 대체 그림 넣어줌
    replaceImage();
    $('#modify').click(function () {
        modifyPages();
        savePagesToLocalStorage();
    });
    //추가 버튼 눌렀을 때
    $('#add').click(function () {
        createItem();
    });
    $('#delete').click(function () {
        deletePage();
    });
    $('#factoryReset').click(function () {
        factoryReset();
    });
    $('#developerContact').click(function () {
        swal("Shinplest","건의사항이나 버그를 메일로 주시면 \n빠른시일내로 고치겠습니다.\n\nemail - shineceo97@naver.com\ngithub - github.com/shinplest");
    });
})


//페이지 아이콘 박스 생성
function createBox(imgaddress) {
    var contents =
        "<div class = 'pages'>"
        + "<a href='#' target='_blank' class = 'pagesLink'>"
        + "<div class = 'pageWrap'>"
        + "<img src = '"
        + imgaddress
        + "'class = 'pageicons'>"
        + "<p>"
        + "</p>"
        + "</div>"
        + "</a>"
        + "<div>";

    return contents;
}
//추가했을 경우 실행되는 함수 
function createItem() {
    getTabData(function (tabdata) {

        //현재 웹페이지 주소를 디폴트로 가져옴. 
        inputAddress = prompt("추가할 웹페이지의 주소를 입력하세요.", tabdata.url);
        //https:// 있으면 자동으로 제외해줌. 
        if (inputAddress.indexOf("https://") != -1) {
            inputAddress = inputAddress.replace("https://", "");
        }
        if (inputAddress.indexOf("http://") != -1) {
            inputAddress = inputAddress.replace("http://", "");
        }
        if (inputAddress == null) return;
        inputName = prompt("추가할 페이지의 이름은?", tabdata.title);
        inputName = inputName.substr(0, 20);
        if (inputName == null) return;
        // favicon url을 잘가져오는지 확인하는 코드
        // console.log(tabdata.favIconUrl);
        $(createBox(tabdata.favIconUrl))
            .appendTo("#pageBoxWrap")
            .find('a').prop("href", "http://" + inputAddress)
            .children().find("p").html(inputName);
        savePagesToLocalStorage();
        swal("등록", "완료되었습니다.", "success")
            .then((value) => {
                location.reload();
            });
    });
}
//페이지 삭제 관련함수
function deletePage() {
    if (del == false) {
        $('#delete').html("삭제 완료").css('background','red');

        //클릭 비활성화
        $('.pages').click(function () { return false });
        addAndRemoveDelButton();
        swal("이제 삭제하고 싶은 즐겨찾기를 누르세요. ");
        //삭제 이벤트
        del = true;
    }
    else {
        //클릭 재활성화
        //$('.pages').unbind('click');
        $('#delete').html("삭제");
        location.reload();
        del = false;
    }

}
//삭제버튼을 생성하고 지우고 페이지 지우는 이벤트 처리
function addAndRemoveDelButton() {
    //마우스 올릴시 삭제 버튼 추가
    $('.pages').mouseenter(function () {
        var testbutton = "<button class = 'delButton'>삭제</button>";
        $(testbutton).appendTo($(this));

        //버튼을 누를시 삭제를 해준다
        $('.delButton').click(function () {
            $(this).parent().remove();
            //삭제 후 변경사항 저장. 
            savePagesToLocalStorage();
            swal("삭제", "완료되었습니다.", "success");
        });
    });
    //마우스 나갈시 삭제버튼 제거
    $('.pages').mouseleave(function () {
        $(this).find('.delButton').remove();
    });
}

//페이지 정보를 로컬스토리지에 저장(삭제하거나 추가, 순서 변경시에 실행됨)
function savePagesToLocalStorage() {
    //모든 pages가져와서 객체로 저장.
    var pages = $(".pages");
    var tempName = null;
    var tempAddress = null;
    var tempImgUrl = null;

    //배열에 현재 페이지 정보 저장
    var Pages = new Array();
    for (var i = 0; i < pages.length; i++) {
        tempName = $(pages[i]).find("p").text();
        tempAddress = $(pages[i]).find("a").attr("href");
        tempImgUrl = $(pages[i]).find("img").attr("src");
        var pushPage = new Page(tempName, tempAddress, tempImgUrl);
        Pages.push(pushPage);
    }
    //로컬스토리지 초기화후 페이지 정보 저장 
    localStorage.clear();
    localStorage.setItem("Pages", JSON.stringify(Pages));
}

//페이지 추가 
function appendPages() {
    for (var i = 0; i < Pages.length; i++) {
        $(createBox())
            .appendTo("#pageBoxWrap")
            //호버 액션 현재 마우스 위치 배경색 바꿔줌
            .hover(
                function () {
                    $(this).css('backgroundColor', '#f9f9f5');
                },
                function () {
                    $(this).css('background', 'none');
                }
            )
            .find('a').prop("href", Pages[i].address)
            .children().find("img").attr("src", Pages[i].imgUrl)
            .parent().find("p").html(Pages[i].name)
    }
}

//이미지가 없을 경우, 대체 이미지 지정해주는 함수
function replaceImage() {
    var imgs = $('img');
    for (var i = 0; i < imgs.length; i++) {
        imgs[i].onerror = function (e) {
            e.target.src = 'images/icon.png';
        };
    }

}
//초기화 해주는 함수
function factoryReset() {
    swal({
        title: "초기화 하시겠습니까?",
        text: "새로 저장한 데이터가 모두 삭제됩니다!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then((willDelete) => {
            if (willDelete) {
                localStorage.clear();
                swal("초기화", "완료되었습니다.", "success")
                    .then((value) => {
                        location.reload();
                    });
            } else {
                swal("초기화 실패");
            }
        });
}

function appendGachonPages() {
    for (var i = 0; i < gachonPages.length; i++) {
        var pushPage = new Page(gachonPages[i][0], gachonPages[i][1], gachonPages[i][2]);
        Pages.push(pushPage);
    }
}


function getTabData(callback) {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        callback(tabs[0]);
    });
}

//수정이 불가능한 상태에서 수정을 클릭한경우, 드래그 앤 드랍으로 정렬 순서를 바꿀 수 있게 한다.
function modifyPages() {
    if (modify == false) {
        $("#pageBoxWrap").sortable();
        $("#pageBoxWrap").sortable("option", "disabled", false); //다시 바꿀수 있게 하기 위한 코드
        $("#pageBoxWrap").disableSelection();
        $('#modify').html('순서 변경 완료').css('background', 'red');

        swal("드래그 해서 순서를 변경하세요.")
        modify = true;
        //이동할수 있는 것을 표현해 주기 위한 애니메이션 코드 추가 예정
        //수정을 완료하면 다시 드래그 앤 드랍 기능을 꺼줌    
    } else {
        modify = false;
        $("#pageBoxWrap").sortable("disable");
        swal("순서 변경", "완료되었습니다.", "success")
            .then((value) => {
                location.reload();
            });
    }
}