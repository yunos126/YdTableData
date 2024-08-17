const td = []
let sortDiraction = true
// در زمانیکه عملیات ثبت یا ویرایش یا حذف انجام می شود
// متغیر reload=true می شود
let reload = false

// * options column variable:
// @ field: [string] Its entry is mandatory
// title: [string] Its entry is optional
// sortable: [boolen] Its entry is optional, default: true
// halign: [string] Its entry is optional, style="text-align: {Set phrase}" in header
// align: [string] Its entry is optional, style="text-align: {Set phrase}" in Cell's Column in tbody
// rowspan: [int] If the columns variable has two members, its entry is mandatory
// colspan: [int] If the columns variable has two members, its entry is mandatory
// fixedRight: [boolen] Its entry is optional, default: false
// hcss: [object] Its entry is optional, styles for header :: hcss: {width: 80,background: '#f1d0d6'}
// css: [object] Its entry is optional, styles for cells column :: hcss: {width: 80,background: '#f1d0d6', color: 'red'}

async function loadTableData(table,data,columns) {
	let id = 'table-'+table.id
	
	if(!reload) {
    	td[id] = new YdTableData(table,data,columns)
    	await td[id].loadTable()
	}
	else await td[id].reloadTable(data)

	// پس از رفرش جدول دوباره متغیر reload=false می شود
	reload = false

}

const YdTableData = function(t,d,c) {
	this.t = t
	this.d = d
	this.dataTableLoaded = d
	this.c = c
	this.id = t.id
    this.fieldsFiltered = []
    this.indexSelected = []
    this.rowSelected = []
	this.counter = (typeof(t.counter) == 'undefined' || t.counter === null || t.counter) ? true : false
	this.sortable = (typeof(t.sortable) == 'undefined' || t.sortable === null || t.sortable) ? true : false
	this.toolbar = (typeof(t.toolbar) == 'undefined' || t.toolbar === null || t.toolbar) ? true : false
	this.search = (typeof(t.search) == 'undefined' || t.search === null || t.search) ? true : false
	this.showFooter = (typeof(t.showFooter) != 'undefined' && t.showFooter !== null && t.showFooter) ? true : false,
	this.clickToSelect = (typeof(t.clickToSelect) == 'undefined' || t.clickToSelect === null || t.clickToSelect) ? true : false
	this.trdbclick = (typeof(t.trdbclick) != 'undefined' && t.trdbclick !== null) ? t.trdbclick : 0
	this.rowStyle = (typeof(t.rowStyle) != 'undefined' && t.rowStyle !== null) ? t.rowStyle : 0
	this.height = (typeof(t.height) != 'undefined' && t.height !== null) ? t.height : 500
	this.loadComplate = (typeof(t.loadComplate) != 'undefined' && t.loadComplate !== null) ? t.loadComplate : false

	this.heightToolbar = (this.toolbar) ? 27 : 0
	this.trHeaderTop = 0

	this.toolbarOption = `
		<div id="div-${this.id}" class="m-0 toolbar navigation " >
			<div class="container-fluid">
				<div class="row">
					<div class="col-6">
						<input type="search" class="form-control d-inline col-md-12 table-search-rows" placeholder="Type to search this table">
					</div>
					<div class="col-6 text-right">
						<button type="button" class="btn btn-xs border table-export" title="Export xlsx"><span class="fas fa-file-excel text-green"></span></button>
						<span class="btn-group">
							<button type="button" class="btn btn-xs border table-select-show" title="show selected records"><span class="fas fa-check-square"></span></button>
							<button type="button" class="btn btn-xs border table-select-show-back" title=""><span class="far fa-check-square"></span></button>
							<button type="button" class="btn btn-xs border table-select-off" title=""><span class="far fa-square"></span></button>
						</span>
						<button type="button" class="btn btn-xs border table-refresh" title="go back to the original state"><span class="fas fa-sync-alt"></span></button>
			
					</div>
				</div>
			</div>
		</div>
	`
	this.getAllColumns = (c) => {
		var n=0,r=1,i=[]
		if(({}).toString.call(c[0]) === '[object Array]'){
    		//در صورتی که ارایه دریافتی دو بعدی یا بیشتر باشد
			for(let h of c){
				n=0
				for(let header of h){
					if(r == 1) {
						if(typeof(header.colspan) == 'undefined' || header.colspan === null) {
							i[n] = header
							n++
						}
						else {
							for(let num=1;num<=header.colspan;num++){
								i[n]=null
								n++;
							}
						}
					}
					else {
						// ایندکس اولین مقداری که نول است را برمی گرداند
						l = i.findIndex((age) => age === null)
						i[l] = header
					}
				}
				r++
			}
		}
		else {
			for(let h of c){
				i[n] = h
				n++
			}
		}
		return i
	}

	this._columns = this.getAllColumns(c)

	this.setHeader = (d, c) => {
		var rowspan = 1
		
		var trFilterTop = (this.toolbar) ? 50 : 25
		var n=0,r=1,i=[]

		var outer = `<thead>`

		if(({}).toString.call(c[0]) === '[object Array]'){
			trFilterTop = 25 * c.length
			rowspan = c.length

			for(let hr of c){
    			outer += `<tr>`
				if(r == 1) {
					outer += (this.counter) ? `<th style="width: 25px;top: ${this.heightToolbar}px;" rowspan="${rowspan}">No.</th>` : ``
				}
				outer += this.setHeaderColumns(hr, r)
    			outer += `</tr>`
				r++
			}
		}
		else {
			trFilterTop = (this.toolbar) ? 50 : 25
			outer += `<tr>`
			outer += (this.counter) ? `<th style="width: 25px;top: ${this.heightToolbar}px;" rowspan="${rowspan}">No.</th>` : ``
			outer += this.setHeaderColumns(c)
			outer += `</tr>`
		}
		
		if(this.search && d.length > 0) {
			trFilterTop = this.trHeaderTop + 25
			outer += `<tr>`;
			outer += (this.counter) ? `<th id="yd-table-btn-refresh" class="p-0 m-0" style="width: 25px;top: ${trFilterTop}px;">*</th>` : ``

			for(let hf of this._columns){
				let inputSearch = ``
				let isCheckbox = (typeof(hf.checkbox) != 'undefined' && hf.checkbox !== null && hf.checkbox) ? true : false;
				let fixedRight = (typeof(hf.fixedRight) != 'undefined' && hf.fixedRight !== null && hf.fixedRight) ? true : false;

				let thClass = (fixedRight) ? `fixed-right ` : ``

				if((typeof(hf.search) == 'undefined' || hf.search === null || hf.search) && !isCheckbox) {
					inputSearch = `<input type="text" class="form-control form-control-2 table-search" data-field="${hf.field}">`
				}
				outer += `<th class="p-0 m-0 ${thClass} yd-search-${hf.field}" style="top: ${trFilterTop}px;">${inputSearch}</th>`;
			}
		
			outer += '</tr>';
		}

		outer += `</thead>`

		return outer
	}

	this.setHeaderColumns = (hr, r=1) =>{
		let outer = ``
		let top = (r==1) ? 0 : (r-1)*25
		top = top + this.heightToolbar
		this.trHeaderTop = top

		for(let h of hr){
			let sort = ``
			let style = ``
			let isCheckbox = (typeof(h.checkbox) != 'undefined' && h.checkbox !== null && h.checkbox) ? true : false;
			let fixedRight = (typeof(h.fixedRight) != 'undefined' && h.fixedRight !== null && h.fixedRight) ? true : false;

			let classSortable = (this.sortable && !isCheckbox) ? `table-sortable` : ``
				classSortable += (fixedRight) ? ` fixed-right` : ``
			let rowspan = (typeof(h.rowspan) != 'undefined' && h.rowspan !== null) ? `rowspan="${h.rowspan}"` : ``;
			let colspan = (typeof(h.colspan) != 'undefined' && h.colspan !== null) ? `colspan="${h.colspan}"` : ``;
			style += (typeof(h.width) != 'undefined' && h.width !== null) ? `width: ${h.width}px;` : ``;

			if(typeof(h.hcss) != 'undefined' && h.hcss !== null) {
				Object.entries(h.hcss).forEach(([key, value]) => 
					style += `${key}:  ${value};`);
			}

			outer += `<th data-Field="${h.field}" class="${classSortable}" style="top: ${top}px;${style}" ${rowspan} ${colspan}><span>${h.title}</span></th>`
		}
		return outer
	}

	this._header = this.setHeader(d, c)

	this.setTable = () =>{
		// indexSelected = []
		// rowSelected = []
		// fieldsFiltered = []
		// _header = setHeader(d, c)
		// _columns = getAllColumns(c)

		var outer = ``
		outer += (this.toolbar) ? `${this.toolbarOption}` : ``
		outer += `<table id="table-${this.id}" class=" table-hover m-0" style="">`
		outer += this._header
		outer += `<tbody>${this._body}</tbody>`
		outer += `<tfoot>${this._footer}</tfoot>`
		outer += `</table>`

		return outer
	}

	this.loadTable = () => {
		let tableBody = document.getElementById(this.id);
		tableBody.innerHTML = this.setTable()
    	document.getElementById(this.id).style.height = this.height+"px";

		this.setFixedColumn()
	}

	this.setBody = (d) => {
		// dataTableLoaded = d
		var i;
		var j = 1;
		let index = 0;
		let outer = ``
		let n = this._columns.length
	
		// outer = `<tbody>`
		if(d.length == 0) {
			n = (this.counter) ? this._columns.length+1 : this._columns.length
			outer += `<tr><td colspan="${n}" class="text-center">Nothing found!</td></tr>`;
		}
		else {
			for(let person of d){
				//
				let dataForExportRows = [];

				//ŲÆŲ± ŲµŁŲ±ŲŖŪ Ś©Ł‡ ŲÆŲ§ŲØŁ„ Ś©Ł„ŪŚ© Ų±ŁŪ Ų±ŲÆŪŁ ŲÆŲ± Ł…ŲŖŲŗŪŲ± ŲŖŪŲØŁ„ Ų³ŲŖ Ų´ŲÆŁ‡ ŲØŲ§Ų´ŲÆ
				let objDbClick = (this.trdbclick != 0) ? `${this.trdbclick}('${person["id"]}')` : ``
				
				//rowStyle
				var rowStyleClasses = ``
				let rowStyleCss = ``

				rowStyleClasses += (this.clickToSelect) ? `table-selectable ` : ``
				// rowStyleClasses += (indexSelected.length > 0 && indexSelected.indexOf(index) > -1) ? `selected ` : ``
				rowStyleClasses += (this.rowSelected.length > 0 && this.rowSelected.indexOf(person) > -1) ? `selected ` : ``
				
				if(this.rowStyle != 0) {
					var rs = this.executeFunction(this.rowStyle, window, person);
					
					if(typeof(rs.classes) != 'undefined' && rs.classes !== null) {
						rowStyleClasses += rs.classes;
					}
					
					if(typeof(rs.css) != 'undefined' && rs.css !== null) {
						Object.entries(rs.css).forEach(([key, value]) => 
						rowStyleCss += `${key}:  ${value};`);
					}
				}
				
				outer += `<tr data-index="${index}" id="tb-tr-id-${person["id"]}" class="tooltiptr ${rowStyleClasses}" style="${rowStyleCss}" ondblclick="${objDbClick}">`
				outer += (this.counter) ? `<th>${j}</th>` : ``
				// outer += (checkbox) ? `<td style="width: 20px;" class="bs-checkbox text-center"><input data-index="${index}" name="btSelectItem" type="checkbox" class="" data-select-item="${person["id"]}"></td>` : ``
				i = 0;
	
				for(let header of this._columns){
					var fieldName = header.field;
					var culValue = person[fieldName]
					let isCheckbox = (typeof(header.checkbox) != 'undefined' && header.checkbox !== null && header.checkbox) ? true : false;
					let fixedRight = (typeof(header.fixedRight) != 'undefined' && header.fixedRight !== null && header.fixedRight) ? true : false;
					let cellStyleClasses = ``
					let cellStyleCss = ``

					if(typeof(culValue) == 'undefined' || culValue === null) { culValue = '';  }

					cellStyleCss += (typeof(header.align) != 'undefined' && header.align !== null) ? `text-align: ${header.align};` : ``;
					cellStyleCss += (typeof(header.dir) != 'undefined' && header.dir !== null) ? `direction: ${header.dir};` : ``;

					if(typeof(header.css) != 'undefined' && header.css !== null) {
						Object.entries(header.css).forEach(([key, value]) => 
							cellStyleCss += `${key}:  ${value};`);
					}

					if(isCheckbox) {
						culValue = `<input data-index="${index}" name="btSelectItem" type="checkbox" class="" data-select-item="${person["id"]}">`
						cellStyleClasses += `bs-checkbox text-center `
					}
					cellStyleClasses += (fixedRight) ? `fixed-right ` : ``

					dataForExportRows[i] = culValue;
					
					//set format value in cell
					
					if(typeof(header.formatter) != 'undefined' && header.formatter !== null) {
						//execute myAddFunction from string
						cellFormat = this.executeFunction(header.formatter, window, culValue, index, person);
	
						if(({}).toString.call(cellFormat) === '[object Object]')
						{
							if(typeof(cellFormat.classes) != 'undefined' && cellFormat.classes !== null)
							{
								Object.entries(cellFormat.classes).forEach(([key, value]) => 
								cellStyleClasses += ` ${value} `);
							}
							
							if(typeof(cellFormat.css) != 'undefined' && cellFormat.css !== null)
							{
								Object.entries(cellFormat.css).forEach(([key, value]) => 
								cellStyleCss += `${key}:  ${value};`);
							
							}
							culValue = cellFormat.value;
						}
						else 
						{
							culValue = cellFormat;
						}
					}

					//set align
					let tdAlign = '';
					if(typeof(header.align) != 'undefined' && header.align !== null) {			
						tdAlign = header.align;					
					}
					outer += `<td class="${tdAlign} ${cellStyleClasses}" style="${cellStyleCss}">${culValue}</td>`;
					i++;
				}		
				outer += `</tr>`;
				// dataForExport[j] = dataForExportRows;
				j++;
				index++;
			}
		}
		// outer += `</tbody>`
		
		return outer
	} 

	this.setFooter = (d) => {
		var i;
		var j = 1;
		let outer = ``
		let n = this._columns.length
	
		if(this.showFooter){
			outer = `<tr>`
			outer += (this.counter) ? `<th>${d.length}</th>` : ``
			i = 0;
			for(let header of this._columns){
				let fixedRight = (typeof(header.fixedRight) != 'undefined' && header.fixedRight !== null && header.fixedRight) ? true : false;

				let cellClass = (fixedRight) ? `fixed-right ` : ``

				if(typeof(header.footerFormatter) != 'undefined' && header.footerFormatter !== null)
					outer += `<td class="${cellClass}">${this.executeFunction(header.footerFormatter, window, d,header.field)}</td>`
				else outer += `<td class="${cellClass}"></td>`
				i++;
			}
			outer += `</tr>`
		}
		return outer
	} 

	this._body = this.setBody(d)
	this._footer = this.setFooter(d)

	//function to execute some other function by it's string name 

	this.reLoadBody = (dd) => {
		let outer = this.setBody(dd, true)
		 
		$(`#table-${this.id} tbody`).html(outer)

		outer = this.setFooter(dd)
		$(`#table-${this.id} tfoot`).html(outer)

		this.setFixedColumn()
	}

	this.sortColumn = (field, diraction) => {
		let dataType = typeof this.dataTableLoaded[0][field]
		var dataFist = this.dataTableLoaded[0][field]

		var data
		if(dataType == 'number') data = this.sortNumberColumn(this.dataTableLoaded, diraction, field)	
		else if(dataFist >= 0) data = this.sortNumberColumn(this.dataTableLoaded, diraction, field)		
		else data = this.sortStringColumn(this.dataTableLoaded, diraction, field)

		this.reLoadBody(data)
	}

	this.filterColumn = (field, str) => {
		this.indexSelected = []
		this.fieldsFiltered[field] = str
		if (str.length == 0) {delete this.fieldsFiltered[field] }

		let dataFiltered = this.d

		Object.entries(this.fieldsFiltered).forEach(([key, value]) => {
			dataFiltered = this.objFilterItem(dataFiltered,key,value)
		});

		this.dataTableLoaded = dataFiltered

		this.reLoadBody(dataFiltered)
	}

	this.filterRows = (str) => {
		this.indexSelected = []
		let dataFiltered = this.d

		dataFiltered = dataFiltered.filter(item => {
			return Object.values(item).some(value => {
				if (typeof value === 'string') {
					return value.toLowerCase().includes(str.toLowerCase());
				} else if (Array.isArray(value)) {
					return value.some(subItem => {
						return Object.values(subItem).some(subValue => {
							if (typeof subValue === 'string') {
								return subValue.toLowerCase().includes(str.toLowerCase());
							}
							return false;
						});
					});
				}
				return false;
			});
		});

		this.dataTableLoaded = dataFiltered

		this.reLoadBody(dataFiltered)
	}

	this.setSelected = (i, val) => {
		let item
		(val == 1) ? this.indexSelected.push(i) : this.indexSelected.splice(this.indexSelected.indexOf(i), 1)
		
		this.indexSelected = this.indexSelected.sort((p1, p2) => {
			return p1 - p2
		})

		this.rowSelected = []
		Object.entries(this.indexSelected).forEach(([key, val]) => {
			item = this.dataTableLoaded[val]
			this.rowSelected.push(item)
		});

		// item = this.dataTableLoaded[val]
		// if(val == 1) {
		// 	this.rowSelected.push(item)
		// }
		// else {
			
		// }
	}

	this.showSelected = () => { 
		let dataSelected = []
		if(this.rowSelected.length > 0) {
			let dfs = this.rowSelected
			// if(Object.keys(fieldsFiltered).length > 0) {
			// 	Object.entries(fieldsFiltered).forEach(([key, value]) => {
			// 		dfs = objFilterItem(dfs,key,value)
			// 	});
			// }
			this.reLoadBody(dfs)
		}
		// return {tre, rowSelected,fieldsFiltered}
	}
	this.showSelectedBack = () => { 
		this.reLoadBody(this.dataTableLoaded)
	}

	this.unSelected = () => { 
		this.indexSelected = []
		this.rowSelected = []
		this.reLoadBody(this.dataTableLoaded)
	}

	this.refreshTable = () => {
		this.indexSelected = []
		this.rowSelected = []
		this.fieldsFiltered = []
		this.dataTableLoaded = this.d
		this.loadTable()

		this.setFixedColumn()
	}

	this.reloadTable = (dd) => {
		this.d = dd
		var dataFiltered = dd
		if(Object.keys(this.fieldsFiltered).length > 0) {
			Object.entries(this.fieldsFiltered).forEach(([key, value]) => {
				dataFiltered = this.objFilterItem(dataFiltered,key,value)
			});
		}
		this.dataTableLoaded = dataFiltered
		this.reLoadBody(dataFiltered)
	}
	
	this.setFixedColumn = () => {
		var topTds = $(".table-scroll table thead tr:first");
		topTds = topTds.children();
		let va = topTds[0].offsetWidth

		$('.fixed-right').each(function(e){
			$(this).css('right', va)
        });
		$('.table-scroll table tbody td.fixed-right').each(function(e){
			$(this).css('background-color', 'aliceblue')
		});

		if(this.loadComplate !== false) this.executeFunction(this.loadComplate, window);
	}

    this.returnCl = () => {
		return this._columns
	}
}

YdTableData.prototype = { 
	executeFunction: function(functionName, context , args ){
		var args = Array.prototype.slice.call(arguments, 2);
		var namespaces = functionName.split(".");
		var func = namespaces.pop();
		for(var i = 0; i < namespaces.length; i++) {
			context = context[namespaces[i]];
		}
		return context[func].apply(context, args);
	},
	sortNumberColumn: (data, sort, columnName) => {
		return data.sort((p1, p2) => {
			return sort ? p1[columnName] - p2[columnName] : p2[columnName] - p1[columnName]
		})
	},
	sortStringColumn: (data, sort, columnName) => {
		return data.sort(function(p1, p2) {
			return sort ? (p1[columnName].localeCompare(p2[columnName])) : (p2[columnName].localeCompare(p1[columnName]))
		})
	},
	objFilterItem: (objArray, item, str) => {
		let query = str.toString().toLowerCase();
		return objArray.filter((e) => e[item].toString().toLowerCase().indexOf(query) >= 0);
	}
}

$(document).on("click",".table-scroll table thead .table-sortable",function(e){
	let id = $(this).closest('table').attr("id")
	var field = $(this).attr("data-field")
	let myCol = $(this).index()

	$(`#${id} .th-sort-desc`).each(function(){
		$(this).removeClass('th-sort-desc');
	})

	$(`#${id} .th-sort-asc`).each(function(){
		$(this).removeClass('th-sort-asc');
	})

	if(!sortDiraction) {
		$(this).children('span').removeClass('th-sort-desc')
		$(this).children('span').addClass('th-sort-asc')
	} 
	else {
		$(this).children('span').addClass('th-sort-desc')
		$(this).children('span').removeClass('th-sort-asc')
	}

	sortDiraction = !sortDiraction
	td[id].sortColumn(field, sortDiraction)
});
$(document).on("click",".table-scroll table tbody tr.table-selectable",function(e){
	let id = $(this).closest('table').attr("id")
	let index = $(this).data('index')
	
	$(this).hasClass('selected') ? $(this).removeClass('selected') : $(this).addClass('selected')
	
	let val = $(this).hasClass('selected') ? 1 : 0

	td[id].setSelected(index, val)
});

$(document).on("keyup",".table-scroll table thead .table-search",function(e){
	let id = $(this).closest('table').attr("id")
	let field = $(this).attr("data-field")
	let str = $(this).val()

	td[id].filterColumn(field, str)
});

$(document).on("keyup",".table-scroll div input.table-search-rows",function(e){
	let id = $(this).closest('div.toolbar').attr("id")
	id = 'table-'+id.substr(4)

	let str = $(this).val()

	td[id].filterRows(str)
});
$(document).on("input",".table-scroll div input.table-search-rows",function(e){
	let id = $(this).closest('div.toolbar').attr("id")
	id = 'table-'+id.substr(4)

    if ($(this).val() === '') {
        td[id].filterRows('')
    }
});

$(document).on("click",".table-scroll div button.table-refresh",function(e){
	let id = $(this).closest('div.toolbar').attr("id")
	id = 'table-'+id.substr(4)

	td[id].refreshTable()
});

let _checked = false
$(document).on("click",".table-scroll div button.table-select-show",function(e){
	let id = $(this).closest('div.toolbar').attr("id")
	id = 'table-'+id.substr(4)

	let field = 'icheckbox'
	let str = (!_checked) ? 1 : 0

	td[id].showSelected()

	_checked = !_checked
});
$(document).on("click",".table-scroll div button.table-select-show-back",function(e){
	let id = $(this).closest('div.toolbar').attr("id")
	id = 'table-'+id.substr(4)

	td[id].showSelectedBack()
});
$(document).on("click",".table-scroll div button.table-select-off",function(e){
	let id = $(this).closest('div.toolbar').attr("id")
	id = 'table-'+id.substr(4)

	td[id].unSelected()
});
$(document).on("click",".table-scroll div button.table-export",function(e){
	let id = $(this).closest('div.toolbar').attr("id")
	id = 'table-'+id.substr(4)

	exportTableDataToExcel(id)
});

$(document).on("dblclick",".table-scroll table tbody tr",function(e){
    $('.dbl-selected').each(function(){
		$(this).removeClass('dbl-selected');
	});
	
	$(this).hasClass('dbl-selected') ? $(this).removeClass('dbl-selected') : $(this).addClass('dbl-selected')
})
// https://sheetjs.com/demos/table
// .../plugins/xlsx/...
function exportTableDataToExcel(id, type, fn, dl) {
    // type: پسوند فایل خروجی پیشفرض xlsx
    // fn : نام پیشنهادی فایل خروجی
    // dl : true, false

	var elt = document.getElementById(id);
	var wb = XLSX.utils.table_to_book(elt, {sheet:"Sheet JS", raw:false});

	if(type == 'xls') {fn = 'ChikenExport.xls';type = 'biff8';}
	else if(type == 'xml') {fn = 'ChikenExport.xml';type = 'xlml';}

	return dl ?
		XLSX.write(wb, {bookType:type, bookSST:true, type: 'base64'}) :
		XLSX.writeFile(wb, fn || ('ChikenExport.' + (type || 'xlsx')));
}

function YdTableDataRowsSelected(tableId) {
    let table = document.getElementById(`table-${tableId}`);
    let selectedRows = table.querySelectorAll('.table-selectable.selected');

    let selectedIds = [];

    for (let row of selectedRows) {
		// فرض کنید هر ردیف دارای یک ویژگی data-id با مقدار ID منحصر به فرد است
        // const id = row.dataset.id; 

		// فرض کنید هر ردیف دارای یک ویژگی -id با مقدار ID منحصر به فرد است
        let id = row.id.substr(9); 
        selectedIds.push(id);
    }

    return selectedIds // آرایه حاوی ID های ردیف های انتخاب شده را چاپ می کند
}
