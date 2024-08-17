
function dataLength(data) {
    return data.length
}

function priceFooterFormatter(data,field) {
    //var field = this.field
    var too = data.map(function (row) {
    return +row[field]
    }).reduce(function (sum, i) {
    return sum + i
    }, 0)
    return too.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function priceFooterFormatterFixed2(data,field) {
    //var field = this.field
    var too = data.map(function (row) {
    return +row[field]
    }).reduce(function (sum, i) {
    return sum + i
    }, 0)
    return too.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function digitFormatter(value) {
    return value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
} 

function decimalFormatter(value) {
    return value.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function sumFormatter(data) {
    field = this.field;
    return data.reduce(function(sum, row) { 
        return sum + (+row[field]);
    }, 0);
}

function avgFormatter(data) {
    return sumFormatter.call(this, data) / data.length;
}

function rowStyle(row, index) {  
    var classes = [
    'bg-blue',
    'bg-green',
    'bg-orange',
    'bg-FFF8F4',
    'bg-danger'
    ]
    var value1 = row['price']
    var value2 = row['name']
    if (value2 == "") {
        return {
        css: {
            color: 'red'
        },
        classes: classes[4]		  
        }
    }
    return {}
} 

function cellStyle(value, row, index) {
    var classes = [
    'bg-blue',
    'bg-green',
    'bg-eefbee',
    'bg-yellow',
    'bg-danger'
    ]

    if (value < 1 ) {
        return {
        css: {
            color: 'red'
        }
        }
    }
    
    return value
}

function cellStyleAll(value, row, index, field) {
  if (index === 0 && field == 'rezayatmandi') {
      return {classes: 'bg-danger'};
  }
  else {
      return {};
  }
}

function setFormatDate(value) {
    if(value.length == 8){
        var d = value.substring(6);
        var m = value.substring(6, 4);
        var y = value.substring(4, 0);
        
        return y+"/"+m+"/"+d;
    }
}

function percentColorFormatter(digit) {
    let out

    if(digit > 0) out = `<span class="text-success">${digit} %</span>`
    else if(digit < 0) out = `<span class="text-danger">${digit} %</span>`
    else out = `<span class="text-gray">${digit} %</span>`

    return out
}

function hourFooterFormatter(data,field) {
    let totalHours = 0;
    let totalMinutes = 0;

    data.forEach(item => {
        const [hours, minutes] = item[field].split(':');
        totalHours += parseInt(hours, 10);
        totalMinutes += parseInt(minutes, 10);
    });

    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes %= 60;

    return `${pad(totalHours, 2)}:${pad(totalMinutes, 2)}`;
} 

function pad(number, length) {
    return (number + '').padStart(length, '0');
}

function undefinedClear(value) {
    return (value == 'undefined') ? '' : value
}
