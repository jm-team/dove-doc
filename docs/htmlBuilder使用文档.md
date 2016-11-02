# 单点登录集成说明
标签（空格分隔）： CAS 单点登录
---
[TOC]

### 1. 引入文件
```
    下载htmlBuilder.js
```

### 2. buildHtmlWithJsonArray(clazz,json,removeTemplate,remainItems)
```
	唯一的核心方法，以指定的模板和给定的数据,在模板的父级节点下生成页面内容.
	参数介绍
	clazz: 模板的类名
	json: JsonArray格式的数据,每条数据生成一段html内容
	removeTemplate : 是否删除模板 , 通常是false,对于select下拉框的一些场景会设置为true
	remainItems : 是否保留之前生成的内容，通常是false
```

### 3. 示例代码
``` 引入htmlBuilderHelper.js
	<table>
		<th>
			<td>姓名</td>
			<td>年龄</td>
			<td>生日</td>
			<td>性别</td>
			<td>操作</td>
		</th>
	<tr class="repeat_user">
		<td>$[name]</td>
		<td>$[age]</td>
		<!-- formatDate是 htmlBuilderHelper.js中定义的一个js方法-->
		<td script="true">formatDate('$[birthday]','yyyy-MM-dd')</td>
		<!-- script="true" 表示 td里的内容是一段js,其执行结果才是td中正在应该填充的内容-->
		<td script="true">$[gender]==1?'男':'女'</td>
		<td>
			<!-- 这里可以根据条件判断是否输入cif内的内容,时间情况中23可能是一个当前登录用户id-->
			<cif test="$[id]==23">
				<a onclick='del($[id])'>删除</a>
			</cif>
		</td>
	</tr>
	<table>
	var arr = [{
				"id":23,
				"name":"小明",
				"age":12,
				"gender":1,
				"birthday":"2008-11-12 22:30:33"
			},{
				"id":24,
				"name":"小红",
				"age":11,
				"gender":2,
				"birthday":"2009-11-12 22:30:33"
		}];
		
	buildHtmlWithJsonArray('repeat_user',arr,false,false);
```
### END
