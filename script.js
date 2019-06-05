var myStore = [
  {
    id: 1,
    title: "Куртка замшевая",
    quantity: 4,
    cost: 350,
    stock: [
      {
        id: 1,
        quantity: 2,
        cost: 250
      },
      {
        id: 2,
        quantity: 2,
        cost: 100
      }
    ]
  },
  {
    id: 2,
    title: "Портсигар",
    quantity: 6,
    cost: 65,
    stock: [
      {
        id: 1,
        quantity: 5,
        cost: 50
      },
      {
        id: 3,
        quantity: 1,
        cost: 15
      }
    ]
  },
  {
    id: 3,
    title: 'Доставка'
  }
];

var app = {
    showStore: function(suffix) {
        $('#stockTable'+suffix+' tbody').empty();
        $.each(myStore, function(key, el){
            if (typeof el.stock != "undefined") {
                var tr = $('<tr><td>'+el.title+'</td><td>&nbsp;</td><td>'+el.quantity+'</td>'+(suffix==1?'<td>'+el.cost+'</td><td>&nbsp;</td>':'')+'</tr>');
                $('#stockTable'+suffix).append(tr);

                $.each(el.stock, function(keyP, el){
                    var price;
                    if (typeof el.price == "undefined") {
                        price = 1.0 * el.cost / el.quantity;
                        myStore[key].stock[keyP].price = price;
                    } else price = el.price;
                    var tr = $('<tr><td>&nbsp;</td><td>Приходная накладная №'+el.id+'</td><td>'+el.quantity+'</td>'+(suffix==1?'<td>'+el.cost+'</td><td>'+price+'</td>':'')+'</tr>');
                    $('#stockTable'+suffix).append(tr);
                });
            }
        });
    },

    fillInput: function() {
        var select = '<select class="item"><option>Не выбрано</option>';
        for (var i = 0; i < myStore.length; i++) {
            var item = myStore[i];
            select += '<option value="'+item.id+'">'+item.title+'</option>';
        }
        select += '</select>';
        
        var quantity = '<input class="quantity" type="number" placeholder="1" />';
        var price = '<input class="cost" type="number" placeholder="1" />';
        var mode = '<select class="mode"><option value="fifo">FIFO</option><option value="lifo">LIFO</option></select>';
        for (var i = 0; i < 5; i++) {
            var tr = $('<tr id="input'+i+'"><td>'+select+'</td><td>'+quantity+'</td><td>'+price+'</td><td>'+mode+'</td></tr>');
            $('#inputTable tbody').append(tr);
        }
    },

    preset: function() {
        $('#inputTable tbody tr:nth-child(1) .item').val("1");
        $('#inputTable tbody tr:nth-child(1) .quantity').val("3");
        $('#inputTable tbody tr:nth-child(1) .cost').val("620");

        $('#inputTable tbody tr:nth-child(2) .item').val("2");
        $('#inputTable tbody tr:nth-child(2) .quantity').val("3");
        $('#inputTable tbody tr:nth-child(2) .cost').val("50");

        $('#inputTable tbody tr:nth-child(3) .item').val("3");
        $('#inputTable tbody tr:nth-child(3) .quantity').val("1");
        $('#inputTable tbody tr:nth-child(3) .cost').val("100");
    },

    calculate: function() {
        $('#inputTable tbody tbody').empty();
        $('#inputTable tbody tr').each(function(){
            var itemId = $(this).find('.item').val();
            var quantity = parseInt($(this).find('.quantity').val());
            var cost = $(this).find('.cost').val();
            var mode = $(this).find('.mode').val();

            if (!itemId || !quantity || !cost) return; // Неполные входные данные
            
            var item = app.findItem(itemId);

            var firstCost = 0;
            for (var i = 0; i < quantity; i++) {
                firstCost += app.extractPosition(itemId, mode);
                if (isNaN(firstCost)) break;
            }
            var profit;
            if (isNaN(firstCost)) {
                firstCost = "товар отсутствует";
                profit = "Неизвестно";
            } else {
                profit = cost - firstCost;
            }

            var row = $('<tr><td>'+item.title+'</td><td>'+quantity+'</td><td>'+firstCost+'</td><td>'+cost+'</td><td>'+profit+'</td></tr>');
            $('#resultData tbody').append(row);
        });
    },

    findItem: function(id) {
        for (var i = 0; i < myStore.length; i++) {
            if (myStore[i].id == id) return myStore[i];
        }
    },

    extractPosition: function(id, mode) {
        for (var i = 0; i < myStore.length; i++) {
            if (myStore[i].id == id) {
                var item = myStore[i];

                if (typeof item.stock != "undefined") {
                    if (mode == 'fifo') {
                        for (var p = 0; p < item.stock.length; p++) {
                            var position = item.stock[p];
                            if (position.quantity > 0) {
                                myStore[i].stock[p].quantity--;
                                myStore[i].quantity--;
                                return position.price; 
                            }
                        }
                    } else {
                        for (var p = item.stock.length - 1; p >=0; p--) {
                            var position = item.stock[p];
                            if (position.quantity > 0) {
                                myStore[i].stock[p].quantity--;
                                myStore[i].quantity--;
                                return position.price; 
                            }
                        }
                        
                    }
                    alert("Недостаточно товара на складе");
                    break;
                } else return 0;
                
            }
        }
    }
}
$(document).ready(function(){

    app.showStore(1);
    app.fillInput();
    app.preset();
    
    $('button').click(function() {
        app.calculate();
        app.showStore(2);
        $(this).hide();
    });
});
