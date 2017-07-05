function sURL(name)
{
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != undefined) return decodeURI(r[2]); return undefined;
}

function isEmpty(obj)
{
    if(obj==undefined || obj==null || obj==0)
        return true;
    else
        return false;
}

function showTip(str)
{
    if($('body').find('#tipAlert').length == 0){
        var tip ='<div id="tipAlert" class="alert alert-success alert-dismissable font-bold" style="display:none; position: fixed; left:38%;top:38%;z-index:10;"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button></div>';
        $('body').append(tip);
    }
    $(document).ajaxStart(function(){
        $('#tipAlert').text(str);
        $('#tipAlert').show();
    });
    $(document).ajaxSuccess(function(){
        $('#tipAlert').fadeOut(1500);
    });
}