/**
 * 根据模板render列表
 */
function buildHtmlWithJsonArray(clazz,json,removeTemplate,remainItems){
    var temp = $('.'+clazz);

    var subCatagory = temp.parent();
    var dhtml = temp[0].outerHTML;
    //var temp = $(first);
    var copy=$(dhtml);
    temp.removeClass(clazz);
    temp.remove();
    if(!remainItems){
        $(subCatagory).empty();
    }
    
    for(var i=0;i<json.length;i++){
        //temp[0]表示dom元素
        var html = buildHtmlWithJson(temp[0],json[i] ,i);
        subCatagory.append(html);
    }
    
    var runscripts = subCatagory.find('[script=true]');
    runscripts.each(function(index,obj){
        // if(index>0){
            var val="";
            try{
                val = eval(obj.textContent);
                if(obj.tagName=='INPUT'){
                    obj.value = val;        
                }else{
                    // obj.textContent = val;  
                    obj.innerHTML = val;  
                }
            }catch(e){
                console.log(e);
                console.log(obj.textContent);
                obj.textContent = "";
            }
            $(obj).attr('script','false');
        // }
    });

    if(!removeTemplate){
        copy.css('display','none');
        subCatagory.prepend(copy);
    }
}
function buildHtmlWithJson(temp,json , rowIndex){
    temp.style.display='';
    var dhtml = temp.outerHTML;
    var dataAlias = $(temp).attr('data-item');
    for(var key in json){
        var v = json[key];
        if(v==null){
            v="";
        }
        dhtml = dhtml.replace("$[rowIndex]",rowIndex);
        if(dataAlias){
        	key = dataAlias+"."+key;
        }
        dhtml = dhtml.replace(new RegExp("\\$\\["+key+"\\]","gm"),v);
    }
    //再次替换到没有数据的项
    dhtml = dhtml.replace(new RegExp("/\$\[\S+?\]","gm"),"");
    var subCatagory = $(dhtml);
    
    var cIfs = subCatagory.find('cif');
    cIfs.each(function(index,obj){
        $(obj).parent().html(processCIf(obj));
    });
    return subCatagory[0].outerHTML;
}

function processCIf(cIf){
	var cifParent = $(cIf).parent();
	var result = $(cifParent[0].outerHTML);
	result.empty();
	for(var i=0;i<cifParent.children().length;i++){
    	var elem = cifParent.children()[i];
    	if(elem.tagName!='CIF'){
    		result.append(elem.outerHTML);
    	}else{
    		var script = $(elem).attr('test');
            try{
                if(eval(script)){
                	result.append($(elem).html());
                }
            }catch(e){
            	console.error(e);
            }
    	}
    }
	return result.html();
}