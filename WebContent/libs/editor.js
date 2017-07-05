
apiURL = 'http://127.0.0.1/C2API';
//apiURL = 'http://192.168.2.143/C2API';

$.fn.removeColClass = function(){
    for (var i=0; i<=24; i++)
    {
        $(this).removeClass("col-xs-" + i);
        $(this).removeClass("col-sm-" + i);
        $(this).removeClass("col-md-" + i);
        $(this).removeClass("col-lg-" + i);
    }
};

$.fn.removeOffsetClass = function(){
    for (var i=0; i<=24; i++)
    {
        for (var i = 0; i <= 24; i++)
        {
            $(this).removeClass("col-xs-offset-" + i);
            $(this).removeClass("col-sm-offset-" + i);
            $(this).removeClass("col-md-offset-" + i);
            $(this).removeClass("col-lg-offset-" + i);
        }
    }
};

Array.prototype.removeByValue = function(val)
{
    for(var i=0; i<this.length; i++) {
        if(this[i] == val) {
            this.splice(i, 1);
            break;
        }
    }
};

function elementChange(event)
{
    var intpuDIV = $(event).parents('.c-input:first');
    var showArrayStr = intpuDIV.attr('data-show-array');
    var showArray = eval(showArrayStr);
    if(showArrayStr && showArray.length>0)
    {
        directFormShow(event, showArrayStr);
    }

    var formulaArrayStr = intpuDIV.attr('data-formula-array');
    var formulaArray = eval(formulaArrayStr);
    if(formulaArrayStr && formulaArray.length>0)
    {
        formulaShow(formulaArray)
    }

    var timer = $(event).attr('data-timer');
    if(timer && timer=='Y')
    {
        setParentTimestamp(event);
    }
}

function formulaShow(formulaArray)
{
    var showArr = [];
    var hideArr = [];
    for(var i=0; i<formulaArray.length; i++)
    {
        var fid = formulaArray[i][0];
        var cmp = formulaArray[i][1];
        var toValue = formulaArray[i][2];
        var toGridID = formulaArray[i][3];
        console.log(fid);
        $.post(apiURL+'/FormulaSvr/model', { id: fid }, function (res) {
            if (res.code == 0) {
                var rs = doFormula(res.data);
                var findPos = (cmp=='=' && rs==toValue) || (cmp=='>' && rs>toValue) || (cmp=='<' && rs<toValue);
                if(findPos) showArr.push(toGridID);
                else hideArr.push(toGridID);
                privateShowFormulaResult(showArr, hideArr, formulaArray.length);
            }
        }, 'json');
    }
}

function privateShowFormulaResult(showArr, hideArr, len)
{
    if((showArr.length+hideArr.length) == len)
    {
        var newHideArr = [];
        for(var i=0; i<hideArr.length; i++)
        {
            if($.inArray(hideArr[i], showArr) > -1)
                continue;
            newHideArr.push(hideArr[i]);
        }
    }
    hideArr = newHideArr;
    for(var i=0; i<showArr.length; i++)
    {
        var tempGridID = showArr[i];
        var tempGrid = $('#'+tempGridID);
        var tableRow = $(event).parents('.table-row:first');
        if(tableRow.length > 0)
        {
            tempGrid = tableRow.find('#'+tempGridID);
        }
        tempGrid.show();
        tempGrid.find(".c-element").removeAttr("disabled");
    }
    for(var i=0; i<hideArr.length; i++)
    {
        var tempGridID = hideArr[i];
        var tempGrid = $('#'+tempGridID);
        var tableRow = $(event).parents('.table-row:first');
        if(tableRow.length > 0)
        {
            tempGrid = tableRow.find('#'+tempGridID);
        }
        tempGrid.hide();
        tempGrid.find(".c-element").attr("disabled", "disabled");
    }
}

function directGlobalHide(gridID)
{
    var tempGrid = $('#'+gridID);
    var globalStr = tempGrid.attr('data-global-array');
    if(globalStr==undefined)return false;
    var globalArr = eval(globalStr);
    for(var i=0; i<globalArr.length; i++)
    {
        var elementID = globalArr[i][0];
        var valueID = globalArr[i][1];
        $.post(apiURL+'/GlobalSvr/fetch', {elementID: elementID}, function (res)
        {
            if (res.code == 0)
            {
                var fromValue = res.data;
                if(fromValue == valueID)
                {
                    //这里的控制关系待检验
                    $('#'+gridID).show();
                }
            }
        }, 'json').error(function(res){console.log(res.responseText)});
    }
}

//多:多:多 = 多个输入值: 多个比较值: 多个控件
function directFormShow(event, showArrayStr)
{
    //选中的值
    var masterValues = [];
    var tempName = $(event).attr('name');
    //兼容radio/checkbox/select
    $("[name='"+tempName+"']").each(function(index, row)
    {
        if($(row).is(':checked') || $(row).is('select'))
        {
            masterValues.push($(row).val());
        }
    });

    //循环处理多个被控制的Slave控件
    var showArr = [];
    var hideArr = [];
    var dataShowArray = eval(showArrayStr);
    for(var i=0; i<dataShowArray.length; i++)
    {
        var masterValue = dataShowArray[i][0];
        var slaveGID = dataShowArray[i][1];
        var findPos = $.inArray(masterValue, masterValues);
        if(findPos>-1 && $.inArray(slaveGID, showArr)==-1)
        {
            showArr.push(slaveGID);
            hideArr.removeByValue(slaveGID);
        }
        else if(findPos==-1 && $.inArray(slaveGID, hideArr)==-1 && $.inArray(slaveGID, showArr)==-1)
        {
            hideArr.push(slaveGID);
        }
    }

    for(var i=0; i<showArr.length; i++)
    {
        var tempGridID = showArr[i];
        var tempGrid = $('#'+tempGridID);
        var tableRow = $(event).parents('.table-row:first');
        if(tableRow.length > 0)
        {
            tempGrid = tableRow.find('#'+tempGridID);
        }
        tempGrid.show();
        tempGrid.find(".c-element").removeAttr("disabled");
    }
    for(var i=0; i<hideArr.length; i++)
    {
        var tempGridID = hideArr[i];
        var tempGrid = $('#'+tempGridID);
        var tableRow = $(event).parents('.table-row:first');
        if(tableRow.length > 0)
        {
            tempGrid = tableRow.find('#'+tempGridID);
        }
        tempGrid.hide();
        tempGrid.find(".c-element").attr("disabled", "disabled");
    }
}

function zy_ArrayinArray(inValues, valuesArray) {
    for(var j=0; j<inValues.length; j++)
    {
        var inValue = inValues[j];
        for (var i = 0; i < valuesArray.length; i++)
        {
            if(inValue == valuesArray[i]) return true;
        }
    }
    return false;
}

function zq_bindFormula(event, data)
{
    var res = doFormula(data);
    if(res){
        $(event).val(res);
    }
}

function doFormula(data, isText)
{
    var isText = isText ? isText : 'N';
    var res = JSON.parse(data);
    var exp = res.EXP;
    var exp_var = '';
    var formula = res.SYMBOLS;
    for(var i=0; i<formula.length; i++)
    {
        var row = formula[i];
    	var v = row.value;
    	var elementName = row.eid;
    	if (elementName==undefined || elementName=='')
        {
            alert('公式中的变量'+row.name+'没有指定数据元');
    	}
        else if(isText == 'Y')
        {
            v = row.value;
        }
        else
        {
            var elements = $("[name='" + elementName + "']");
            if(elements.length > 0)
            {
                if(elements.is('select'))
                {
                    var tempOption = elements.find('option:selected');
                    if(! (tempOption.length==0 || tempOption.val()==''))
                    {
                        v = tempOption.attr('data-cvalue');
                    }
                }
                else if(elements.is(':checkbox') || elements.is(':radio'))
                {
                    var checkedE = $("input[name='" + elementName + "']:checked");
                    if(checkedE.length > 0)
                    {
                        v = checkedE.attr('data-cvalue');//如果是checkbox取第一个选中的
                    }
                }
                else
                {
                    v = elements.val();
                    if(v=='' && row.value!=''){
                        v = row.value;
                    }
                }
            }
            else
            {
                //这里就这样就可以了，传奇那写好API直接改下url就可以了
                $.ajax(
                {
                    url: apiURL+"/GlobalSvr/fetch",
                    dataType: 'json',
                    async: false,
                    type: "post",
                    data: { id: zq_get_url_param("id"), elementID: elementName },
                    success: function (res)
                    {
                        if (res.code == 0)
                        {
                            v = res.data;
                        }
                    }
                });
            }
    	}
        if(isNaN(v))
        {
            exp_var += row.name + '="' + v + '";';
        }
        else
        {
            exp_var += row.name + '=' + v + ';';
        }
    }
    console.log(exp_var);
    console.log(exp);
    var rs = eval(exp_var + exp);
    return rs;
}

//-3:多个随意格 -1:一个随意格 0:无 1:一个内层空格 2:一个内层非选项元格 3:radio/check/select 4:radio/check 5:多格但必须跨格元
function isGridEditable(eArr, isParent)
{
    var isParent = isParent ? isParent : 'N';
    if(isParent == 'Y'){
        var tempGrids = parent.getGrids();
    }else{
        var tempGrids = getGrids();
    }

    var gridCounter = tempGrids.length;
    var tempElements = tempGrids.find('.c-element');
    if($.inArray(11, eArr)>-1)
    {
        if(gridCounter==0)
        {
            alert('必须选择【一个】网格！');
            return false;
        }
    }
    if($.inArray(12, eArr)>-1)
    {
        if(gridCounter == 1) {}
        else
        {
            alert('只能编辑【一个】网格！');
            return false;
        }
    }
    if($.inArray(13, eArr)>-1)
    {
        if(tempGrids.find('.c-grid').length>0)
        {
            alert('只能编辑最【内层】格！');
            return false;
        }
    }
    if($.inArray(14, eArr)>-1)
    {
        if($.trim(tempGrids.find('.c-content:first').html()) != '')
        {
            alert('只能编辑【空】格！');
            return false;
        }
    }
    if($.inArray(21, eArr)>-1)
    {
        if(tempElements.length > 0)
        {
            alert('只能编辑【无数据元】格！');
            return false;
        }
    }
    if($.inArray(22, eArr)>-1)
    {
        if(tempElements.length == 0)
        {
            alert('只能编辑【有数据元】格！');
            return false;
        }
    }
    if($.inArray(23, eArr)>-1)
    {
        if(tempElements.length == 1) {}
        else
        {
            alert('只能编辑【唯一数据元/值】格！');
            return false;
        }
    }
    if($.inArray(24, eArr)>-1)
    {
        if(tempElements.is('select')  && tempElements.attr('id')!='province10')
        {
            alert('只能编辑【非下拉框】数据元！');
            return false;
        }
    }
    if($.inArray(25, eArr)>-1)
    {
        if($.inArray(tempElements.attr('type'), ['radio','checkbox']) > -1)
        {
            alert('只能编辑【非选择框】数据元！');
            return false;
        }
    }
    if($.inArray(26, eArr)>-1)
    {
        if(gridCounter==1 && (tempElements.length>1 || tempElements.is('select') || tempElements.is(':checkbox') || tempElements.is(':radio')))
        {
            if(tempElements.attr('id') == 'province10')
            {
                alert('不支持编辑【地址自典型】数据元！');
                return false;
            }
        }
        else
        {
            alert('只能编辑【带值域】数据元！');
            return false;
        }
    }
    if($.inArray(27, eArr)>-1)
    {
        for(var b=0; b<tempElements.length; b++){
            var name = tempElements.eq(b).attr('name');
            var selectedC = tempGrids.find("[name='"+name+"']").length;
            var editorC = $("[name='"+name+"']").length;
            if(editorC > selectedC){
                alert('只能选中【全部值域】数据元，才能编辑！');
                return false;
            }
        }
    }
    return true;
}

function openModalWin(event, url, eArr, isParent) {
    if( ! isGridEditable(eArr)) return false;

    var isParent = isParent ? isParent : 'N';
    if(isParent == 'Y'){
        var modalWin = parent.$('#modalWin');
        var iWin = parent.$("#iWin");
        var dragWin = parent.$('#dragWin');
        var ModalTitle = parent.$('#Modal_title');
    }else{
        var modalWin = $('#modalWin');
        var iWin = $("#iWin");
        var dragWin = $('#dragWin');
        var ModalTitle = $('#Modal_title');
    }
    dragWin.css({top:0, left:0});
    var randomnumber=Math.floor(Math.random()*1000);
    window.modalWin = modalWin;
    iWin.attr("src", url+"?"+randomnumber);
    dragWin.draggable();
    modalWin.modal({ show:true });

    if(event.title) ModalTitle.html(event.title);
    else ModalTitle.html(event.innerHTML);
}

function c2id() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function getTemplateID()
{
    if(window.template_id == undefined)
    {
        window.template_id = parent.template_id;
        if(window.template_id == undefined)
        {
            window.template_id = parent.parent.template_id;
        }
    }
    return window.template_id;
}

function selfDeleteGrid(event) {
	$(event).parents('.c-grid:first').remove();
}

function selfCopyGrid(event) {
    var grid = $(event).parents('.c-grid:first');
    var newGrid = grid.clone();
    newGrid.attr('id', c2id());
    grid.after(newGrid);
}

function jingyu_cloneNode(event) {
    var firstRow = $(event).parents('.c-grid:first');
    var rownum = parseInt(firstRow.siblings().length)+2;
    var tabName = firstRow.find('.table_flag').attr('tabName');
    var newGrid = $($(event).parent().attr('data-content'));
    var grids = newGrid.find('.c-grid');
    grids.each(function(){
        if($(this).attr('data-hide'))
        {
            $(this).hide();
            $(this).find(".c-element").attr("disabled", "disabled");
        }
    });
    newGrid.removeAttr('onmouseover onclick');
    grids.removeAttr('onmouseover onclick');
    newGrid.find('.table_flag').attr({'rownum':rownum, 'tabName':tabName});
    newGrid.find('.c-element').attr({'rownum':rownum, 'tabName':tabName});

    //创建新的元的ID
    var elements = newGrid.find('.c-element');
    elements.each(function()
    {
        var tempName = $(this).attr('name');
        var reg = /^([a-zA-Z0-9\.]+_\d+).*/;
        var tempStr = reg.exec(tempName)[1];
        var newName = tempName;
        for(var i=2; i<10000; i++)
        {
            var newName = tempStr + '_' + i;
            if($("[name='" + newName + "'").length == 0)
            break;
        }
        $(this).attr('name', newName);
    });

    var words = '<i>'+newGrid.prop("outerHTML")+'</i>';
    var innerNode = $(words);
    var grids = innerNode.find('.c-grid');
    for(var i=0;i<grids.length;i++)
    {
        var id = grids.eq(i).attr('id');
        var e = new RegExp(id,"g");
        var newID = c2id();
        words = words.replace(e, newID);
    }
    newGrid = $(words).children();
    firstRow.parent().append(newGrid);
}

function jingyu_deleNode(event) {
    $(event).parents('.c-grid:first').nextAll().last().remove();
}

function addFlag(obj){

    for(var i=1; i<10000; i++)
    {
        var tabName = 'tabName' + i;
        if(obj.parents('#editorBody').find('#'+tabName).length == 0)
        break;
    }
    obj.find('.c-content:first').attr('id', tabName);

    var grids = obj.find('.c-grid');
    if(grids.length <= 0){
        grids = obj;
    }
    grids.find('.c-content:first').attr({'tabName':tabName, 'rowNum':2});
    grids.find('.c-content:first').addClass('table_flag');
}

function removeFlag(obj){
    obj.find('.c-content:first').removeAttr('id');

    var grids = obj.find('.c-grid');
    if(grids.length <= 0){
        grids = obj;
    }
    grids.find('.c-content:first').removeAttr('tabName rowNum');
    grids.find('.c-content:first').removeClass('table_flag');
}

function zq_removeClass(grids)
{
	for (var i = 0; i <= 24; i++)
	{
		grids.removeClass("col-xs-" + i);
		grids.removeClass("col-sm-" + i);
		grids.removeClass("col-md-" + i);
		grids.removeClass("col-lg-" + i);
	}
}

function classRemoveSM(grids)
{
    for (var i = 0; i <= 24; i++)
    {
        grids.removeClass("col-xs-" + i);
        grids.removeClass("col-sm-" + i);
        grids.removeClass("col-md-" + i);
        grids.removeClass("col-lg-" + i);
    }
}

function classRemoveOFFSET(grids)
{
    for (var i = 0; i <= 24; i++)
    {
        grids.removeClass("col-xs-offset-" + i);
        grids.removeClass("col-sm-offset-" + i);
        grids.removeClass("col-md-offset-" + i);
        grids.removeClass("col-lg-offset-" + i);
    }
}

function zq_get_url_param(name)
{
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
	var r = window.location.search.substr(1).match(reg);  //匹配目标参数
	if (r != null) return unescape(r[2]); return null; //返回参数值
}

function zq_showViewStyle() {
	$.post(apiURL+'/CRFSvr/model', { id: zq_get_url_param('id') }, function (res) {
		if (res.code == 0) {
            if(res.data.STYLE_PADDING == '' || res.data.STYLE_COLOR=='')
            {
                return false;
            }
			$("#bootstrap-style").attr("href", "./libs/bootstrap-" + res.data.STYLE_PADDING + "-" + res.data.STYLE_COLOR + ".css");
		}
	}, 'json');
}

function zq_rangeShowValue(event)
{
	$(event).parent().find('.c-range-value').text($(event).val());
}

function zh_readFile(a){
  var oPic=a.parentNode.previousElementSibling;
  console.log(a)
  var file = a.files[0];
  if( !file|| !/image\/\w+/.test(file.type)){
    file='';
    oPic.innerHTML='请插入图片';
    return false;
  }
  var reader = new FileReader();
  reader.onload = function(e){
    var image = new Image();
    image.src = e.target.result;
    var max=90;
    image.onload = function(){
      image.style.height='85px';
      image.style.width='195px'
      oPic.innerHTML='';
      oPic.appendChild(image)
    };

  }
  reader.readAsDataURL(file);
return false;
};
function zh_removePic(a){
    var oPic=a.parentNode.previousElementSibling.previousElementSibling;
    oPic.innerHTML='请插入图片';
return false;
}
//========================公式编辑区=================================================
function  howManyDays(sDate1,  sDate2)
{   //sDate1和sDate2是2002-12-18格式
    var  aDate,  oDate1,  oDate2,  iDays;
    aDate  =  sDate1.split("-");
    oDate1  =  new  Date((aDate[1]  +  '-'  +  aDate[2]  +  '-'  +  aDate[0]).replace(/-/g, "/"));    //转换为12-18-2002格式
    aDate  =  sDate2.split("-");
    oDate2  =  new  Date((aDate[1]  +  '-'  +  aDate[2]  +  '-'  +  aDate[0]).replace(/-/g, "/"));
    iDays  =  parseInt(Math.abs(oDate1  -  oDate2)  /  1000  /  60  /  60  /24);    //把相差的毫秒数转换为天数
    return  iDays
}
//传参方法 activeRange(参数,[[小于数,大于数,乘以的数]],矫正参数可填)
function activeRange(value,range,param){
    var param = param || 1;
    var res;
    $(range).each(function(){
        if($(this)[0]+'' == '' && $(this)[1] == ''){
            res= floatClear(floatClear(value, $(this)[2], '*'), param, '*');
            return false;
        }
        if($(this)[0]+'' == ''){
            if(value <= $(this)[1]){
                res= floatClear(floatClear(value, $(this)[2], '*'), param, '*');
                return false;
            }
        }else if ($(this)[1] == '') {
            if(value >= $(this)[0]){
                res= floatClear(floatClear(value, $(this)[2], '*'), param, '*');
                return false;
            }
        }else{
            if(value>=$(this)[0] && value<=$(this)[1]){
                res =floatClear(floatClear(value, $(this)[2], '*'), param, '*');
                return false;
            }
        }
    });
    return res;
}

function floatClear(num1,num2,operation){
    if(num1.toString().indexOf('.') != -1){
        var t1 = num1.toString().split(".")[1].length;
        var r1 = Number(num1.toString().replace(".", ""));
    }else{
        var t1 = 0;
        var r1 = num1;
    }
    if(num2.toString().indexOf('.') != -1){
        var t2 = num2.toString().split(".")[1].length;
        var r2 = Number(num2.toString().replace(".", ""));
    }else{
        var t2 = 0;
        var r2 = num2;
    }
    var res;
    var max = Math.pow(10, Math.max(t1,t2));
    if(operation == '/'){
        res = (r1 / r2) * Math.pow(10, t2 - t1);
    }else if(operation == '*'){
        res = (r1 * r2) * Math.pow(10, -(t2 + t1));
    }else if (operation == '+'){
        res = (num1 * max + num2 * max) / max;
    }else if (operation == '-'){
        res = (num1 * max - num2 * max) / max;
    }
    return res;
}
//传参方法 f_goodText(参数,[[是否相等,小于数,大于数]])
function f_goodText(num, range){
    var res;
    $(range).each(function(){
        if(this[0] == '=')
        {
            if(this[1] == ''){
                if(num <= this[2]){
                    res = this[3];
                }
            }else if(this[2] == ''){
                if(num >= this[1]){
                    res = this[3];
                }
            }else{
                if(num>=this[1] && num<=this[2]){
                    console.log(this[3])
                    res = this[3];
                }
            }
        }else if(this[0] == '==')
        {
            if(num == this[1]){
                res = this[2];
            }
        }else
        {
            if(this[1] == ''){
                if(num < this[2]){
                    res = this[3];
                }
            }else if(this[2] == ''){
                if(num > this[1]){
                    res = this[3];
                }
            }else{
                if(num>this[1] && num<this[2]){
                    res = this[3];
                }
            }
        }
    });
    return res;
}

function radioC(event)
{
    var c = $(event).attr('data-checked');
    var radioSiblings = $(event).parent().siblings().find('.c-element');
    if(c == 'true') c=false;
    else if(c == 'false') c=true;
    $(event).prop('checked', c);
    $(event).attr('data-checked', c);
    $(event).change();
    radioSiblings.prop('checked', false);
    radioSiblings.attr('data-checked', false);
}

function removeGridClass(obj){
    obj.removeClass('mouse');
    obj.find('.mouse').removeClass('mouse');
    obj.removeClass('s-win');
    obj.find('.s-win').removeClass('s-win');
    obj.removeClass('click-red');
    obj.find('.click-red').removeClass('click-red');
    obj.find('.c-toolbar').remove();
    obj.find('.c-content').removeClass('c-indent');
}

function setTip(obj ,tipText){
    var cTipObj = obj.find('.c-tip');
    if(cTipObj.length>0 && tipText.length>0)
    {
        cTipObj.text(tipText);
    }else if(cTipObj.length==0 && tipText.length>0)
    {
        var newTipObj = $('.c-tip').clone();
        newTipObj.text(tipText);
        obj.find(".c-content .form-horizontal").append(newTipObj);
    }else if(tipText.length == 0)
    {
        cTipObj.remove();
    }
}

function popoverText(ele){
    $(ele).on('dblclick','.c-grid',function(e){
        if($(this).find('.c-title').length <=0 && $(this).attr('data-split') != 'Y') return false;

        $(ele).find('.previewPop').remove();
        var preview =$('<div class="previewPop" style="max-height: 300px; position: absolute;z-index: 30;background-color: #fff;padding: 0; border: solid 1px #cccccc; overflow: auto;width: 300px;left:0px;top:30px;font-size:12px;"><div><h5 class="editor_name popover-title"></h5></div><div ><table class="table table-hover" style="margin-bottom: 0;table-layout:fixed;"><thead><tr><th class="text-center">值域</th><th class="text-center">计算值</th><th class="text-center">值</th></tr></thead><tbody></tbody></table></div></div>');

        if($(this).attr('data-title')){
             preview.find('.editor_name').html($(this).attr('data-title')+'\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+$(this).attr('data-c-value'));
            if($(this).attr('data-split') == "Y"){
                elementsObj = "<div>"+$(this).attr('data-element')+"</div>";
                elementsData = $(elementsObj).find('.c-element');
            }else{
                elementsData =$(this).find('.c-element');
            }
        }else{
            var cTitle = $(this).find('.c-title');
            if(cTitle.attr('data-title')){
                preview.find('.editor_name').html(cTitle.attr('data-title')+'\n'+cTitle.attr('title'));
            }else{
                preview.find('.editor_name').html(cTitle.html()+'\n'+cTitle.attr('title'));
            }
            elementsData =$(this).find('.c-element');
        }

        $.each(elementsData,function(index,element){
            var elementsText ="<tr><td class='text-center text' style='word-break:break-all;'>"+element.getAttribute('title')+"</td><td class='text-center' style='word-break:break-all;'>"+element.getAttribute('data-cvalue')+"</td><td class='text-center' style='word-break:break-all;'>"+element.getAttribute('data-avalue')+"</td></tr>";
            preview.find('tbody').append(elementsText);
        });
        if(preview.find('.text').html() == 'null'){
            preview.find('.table').remove();
        }
        preview.bind("mousedown mouseup", function (event) {
            event.stopPropagation();
        });
        $(this).append(preview);
        e.stopPropagation();
    });
    $("html").click(function(){
        $(ele).find('.previewPop').remove();
    });
}

function setParentTimestamp(event)
{
    var timestamp = $(event).val();
    $(event).parents('.c-grid').attr('data-timestamp', timestamp);
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
        $('#tipAlert').text('完成');
        $('#tipAlert').fadeOut(1500);
    });
}

function filterStr(editorBody){
    var table_box = editorBody.find('.table_flag');
    table_box.each(function(){
        var element = $(this).find('.c-element');
        var tabName = $(this).attr('tabName');
        var rowNum =  $(this).attr('rowNum');
        element.attr('tabname',tabName);
        element.attr('rownum',rowNum);
    });
    removeGridClass(editorBody);
    editorBody.find('*[data-hide]').hide();
    editorBody.find('#jsLoad').remove();
    editorBody.find('.c-grid').removeAttr('onmouseover');
    editorBody.find('.c-grid').removeAttr('onclick');
    return editorBody.html();
}

function initHtml(){
    var tempElements = $("body").find(".c-element");
    for(var i=0; i<tempElements.length; i++){
        var tempElement = tempElements.eq(i);
        if(tempElement.is('select')){
            if(tempElement.val() != ""){
                tempElement.find("#e2v_"+tempElement.val()).change();
            }
        }

        if(tempElement.is(':checkbox') || tempElement.is(':radio')){
            if(tempElement.prop('checked')){
                tempElement.change();
            }
        }
    }
}
function createTree(fn){
    $.post(apiURL+'/CategorySvr/tree',function(res)
    {
        var data =res.data;
        var tempGridArr = [];
        for(var i =0; i<data.length; i++){
            recTree(i, '');
        }
        fn();
        function recTree(index, treePre){
            var newOption ={};
            newOption.id =data[index].id;
            newOption.text =treePre+'▪ '+data[index].text;
            newOption.pId =data[index].pId;
            treePre = treePre + '#';
            if($.inArray(data[index].id, tempGridArr) ==-1){
                tempGridArr.push(data[index].id);
                tempGridTree.push(newOption);
            }else{
                return false;
            }
            for(var j =0;j <data.length; j++){
                if(data[index].id == data[j].pId){
                    recTree(j, treePre);
                }
            }
        }
    },'json');
}
function createCasc(pId){
    var arr = [];
    $(tempGridTree).each(function(){
        if(this.pId == pId){
            arr.push(this);
        }
    });
    return arr;
}
function createSelect2(element, pId, echoID){
    var echoID = echoID || 0;
    var element = element || $('.createTree');
    var tree = tempGridTree;
    if(pId == undefined){}else if(pId == ''){
        tree = ''
    }else{
        tree = createCasc(pId);
    }
    element.select2({data :tree, templateResult: formatState, templateSelection: formatState , placeholder: "请选择"}).val(echoID).trigger("change");
}
function formatState(state) {
    var newStr = state.text.replace(/#/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
    var $state = $('<span>'+newStr+'</span>');
    return $state;
}

function erroPopover(){
    $(".c-input").each(function(index, input)
    {
        var ele = $(input).find(".c-element:first");
        var popId = $(input).parents('.c-grid:first').attr('id');
        ele.blur(function(){
            if(!isNotCheck(ele).res && isNotCheck(ele).res!=undefined){
                var qc_warning = '<div id="p'+popId+'" style="border-radius:7px; max-height: 300px; position: absolute;z-index: 30;background-color: #fff;padding: 0; border: solid 1px #cccccc;width: 300px;left:100%;top:0;font-size:12px;"><div><span class="glyphicon glyphicon-triangle-left" style="position:absolute;left:-13px;top:9px;color:#CCC;font-size:16px;"></span><h5 class="warning_qc popover-title"></h5></div></div>';
                    $(input).append($(qc_warning));
                    $('#p'+popId).find('.warning_qc').html(isNotCheck(ele).formErrors);
            }else{
                $('#p'+popId).remove();
            }
        });
        ele.focus(function() {
            $('#p'+popId).remove();
        });
    });
}

function isNotCheck(ele, eleName){
    var formErrors;
    var res;
    var eleName = eleName || '错误';
    if (!$.isEmptyObject(ele.attr("required")))
    {
        if (!$.isEmptyObject(ele.attr("type")) && ele.attr("type") == "text")
        {
            if ($.isEmptyObject(ele.val()))
            {
                res = false;
                formErrors = eleName+'</br>'+ele.attr("required-error");
            }
        } else if (ele.is("select"))
        {
            if (ele.val() == "" || ele.val() == "0")
            {
                res = false;
                formErrors = eleName+'</br>'+ele.attr("required-error");
            }
        }
        else if (ele.is(":radio") || ele.is(":checkbox"))
        {
            if ($.isEmptyObject($('input[name="' + ele.attr("name") + '"]:checked').val()))
            {
                res = false;
                formErrors = eleName+'</br>'+ele.attr("required-error");
            }
        }
    }
    if (!$.isEmptyObject(ele.attr("pattern")) && ele.val() != "") {
        var reg = new RegExp(ele.attr("pattern"));
        if (!reg.test(ele.val())) {
            res = false;
            formErrors = eleName+'</br>'+ele.attr("pattern-error");
        }
    }
    if (!$.isEmptyObject(ele.attr("max"))) {
        if ($.isNumeric(ele.val())) {
            if (parseInt(ele.val()) > parseInt(ele.attr("max"))) {
                res = false;
                formErrors = eleName+'</br>不能大于'+parseInt(ele.attr("max"));
            }
        }
    }
    if (!$.isEmptyObject(ele.attr("min"))) {
        if ($.isNumeric(ele.val())) {
            if (parseInt(ele.val()) < parseInt(ele.attr("min"))) {
                res = false;
                formErrors = eleName+'</br>不能小于'+parseInt(ele.attr("min"));
            }
        }
    }
    if (!$.isEmptyObject(ele.attr("minlength"))) {
        if (ele.val().length < parseInt(ele.attr("minlength"))) {
            res = false;
            formErrors = eleName+'</br>字符数不能小于'+parseInt(ele.attr("minlength"));
        }
    }
    return {
        res:res,
        formErrors:formErrors
    }
}

function onloadInc(){
    var IncLength = $('.selfCopyGridDIV').length;
    if(IncLength > 0){
        for(var i=0; i<IncLength; i++){
            var flagDiv = $('.selfCopyGridDIV').eq(i);
            var copyContent = flagDiv.parents('.c-grid:first').clone();
            copyContent.find('.selfCopyGridDIV').remove();
            copyContent.find('.c-content:first').removeAttr('id');
            flagDiv.attr('data-content', copyContent[0].outerHTML);
        }
    }
}

function successInfo(str){
    $('.alert-warning').hide();
    $('#success').html(str);
    $('.alert-success').show();
    setTimeout(function(){
        $('.alert-success').fadeOut();
    }, 1000);
}

function warnInfo(str){
    $('.alert-success').hide();
    $('#warning').html(str);
    $('.alert-warning').show();
    setTimeout(function(){
        $('.alert-warning').fadeOut();
    }, 1000);
}

function alert(str){
    bootbox.alert({
        buttons: {
            ok: {
                label: '确定',
                className: 'btn-success'
            }
        },
        message: "<div class='col-sm-16 col-sm-offset-6' style='position: relative;'><i class='fa fa-exclamation-circle' style='color:#0095D9; font-size: 40px; margin-right: 20px; position: absolute; left: -31%; top: -8px;'></i>" + str + "</div><div class='clearfix'></div>",
        size: 'small',
        callback: function() { },
        title: "编辑器系统提示您：",
    });
}

function confirm(str, confirmFun, cancelFun){
    bootbox.confirm({
        title: "编辑器系统提示您：",
        message: "<div class='col-sm-16 col-sm-offset-6' style='position: relative;'><i class='fa fa-exclamation-circle' style='color:#0095D9; font-size: 40px; margin-right: 20px; position: absolute; left: -31%; top: -8px;'></i>" + str + "</div><div class='clearfix'></div>",
        size: 'small',
        buttons: {
            confirm: {
                label: '确认',
                className: 'btn-success'
            },
            cancel: {
                label: '取消',
            }
        },
        callback: function(result) {
            if(result){
                var fun = confirmFun || $.noop;
                fun();
            }else{
                var fun = cancelFun || $.noop;
                fun();
            }
        }
    });
}
