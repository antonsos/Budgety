document.addEventListener('DOMContentLoaded', function() {

  //BUDGET CONTROLLER
  var budgetyController = (function() {

    var Expense = function(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncom) {
      if(totalIncom > 0) {
        this.percentage = Math.round((this.value / totalIncom) * 100);
      } else {
        this.percentage = -1;
      }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
    };

    var data = {
      allItems: {
        exp: [],
        inc: []
      },
      totals: {
        exp: 0,
        inc: 0
      },
      budget: 0,
      persentage: -1
    };

    var calculateTotal = function(type) {
      var sum = 0;

      data.allItems[type].forEach(function(cur) {
        sum += cur.value;
      });

      data.totals[type] = sum;
    };

    return {
      addItem: function(type, des, val) {
        var newItem, ID;

        //Create new ID
        if(data.allItems[type].length > 0) {
          ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
        } else {
          ID = 0;
        }

        //Create new newItem
        if(type === 'exp') {
          newItem = new Expense(ID, des, val);
        } else if(type === 'inc') {
          newItem = new Income(ID, des, val);
        }

        //Push in to data structure
        data.allItems[type].push(newItem);

        //Return new element
        return newItem;
      },

      deleteItem: function(type, id) {
        var ids, index;

        ids = data.allItems[type].map(function(cur) {
          return cur.id;
        });

        index = ids.indexOf(id);

        if(index !== -1) {
          data.allItems[type].splice(index, 1);
        }

      },

      calculateBudget: function() {
        // 1. Calculate total inc and exp
        calculateTotal('inc');
        calculateTotal('exp');

        // 2. Calculate the budget: inc - exp
        data.budget = data.totals.inc - data.totals.exp;

        // 3. Calculate the persentage
        if(data.totals.inc > 0) {
          data.persentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        } else {
          data.persentage = -1;
        }
      },

      calculatePercentages: function() {
        data.allItems.exp.forEach(function(cur) {
          cur.calcPercentage(data.totals.inc);
        });
      },

      getPercentages: function() {
        var allPerc = data.allItems.exp.map(function(cur) {
          return cur.getPercentage();
        });

        return allPerc;
      },

      getBudget: function() {
        return {
          budget: data.budget,
          totalInc: data.totals.inc,
          totalExp: data.totals.exp,
          persentage: data.persentage
        };
      }
    };

  })();


  //UI CONTROLLER
  var UIController = (function() {

    var DOMName = {
      type: '.add__type',
      desc: '.add__description',
      value: '.add__value',
      btn: '.add__btn',
      incCont: '.income__list',
      expCont: '.expenses__list',
      budgetLabel: '.budget__value',
      incomeLabel: '.budget__income--value',
      expenseLabel: '.budget__expenses--value',
      persentageLabel: '.budget__expenses--percentage',
      container: '.container',
      expensesPercLabel: '.item__percentage',
      dateLabel: '.budget__title--month'
    };

    
    var formatNumber = function(num, type) {
      var numSplit, int, dec;

      num = Math.abs(num);
      num = num.toFixed(2);

      numSplit = num.split('.');

      int = numSplit[0];
      if(int.length > 3) {
        int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
      }

      dec = numSplit[1];

      type === 'exp' ? sign = '-': sign = '+';

      return (type === 'exp' ? '-': '+') + ' ' + int + '.' + dec;
    };
    
    // this is hack
    var nodeListForEach = function(list, callback) {
      for(var i = 0; i < list.length; i++) {
        callback(list[i], i);
      }
    };

    return {
      getInput: function() {
        return {
          type: document.querySelector(DOMName.type).value,
          description: document.querySelector(DOMName.desc).value,
          value: parseFloat(document.querySelector(DOMName.value).value)
        };
      },

      addListItem: function(obj, type) {
        //Create html string
        var html, newHtml, element;

        if(type === 'inc') {
          element = DOMName.incCont;

          html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
        } else if (type === 'exp') {
          element = DOMName.expCont;
          
          html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
        }

        newHtml = html.replace('%id%', obj.id);
        newHtml = newHtml.replace('%description%', obj.description);
        newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
      },

      deleteListItem: function(selectorId) {
        var el = document.querySelector('#' + selectorId);
        el.parentNode.removeChild(el);
      },

      clearFields: function() {
        var fields, fieldsArry;

        fields = document.querySelectorAll(DOMName.desc + ', ' + DOMName.value);

        fieldsArry = Array.prototype.slice.call(fields);

        fieldsArry.forEach(function(cur) {
          cur.value = '';
        });

        fieldsArry[0].focus();
      },

      displayBudget: function(obj) {
        var type;
        obj.budget > 0 ? type = 'inc': type = 'exp';

        document.querySelector(DOMName.budgetLabel).textContent = formatNumber(obj.budget, type);
        document.querySelector(DOMName.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
        document.querySelector(DOMName.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
        
        if(obj.persentage > 0) {
          document.querySelector(DOMName.persentageLabel).textContent = obj.persentage + '%';
        } else {
          document.querySelector(DOMName.persentageLabel).textContent = '--';
        }

      },

      displayPercentage: function(percentages) {
        var fields = document.querySelectorAll(DOMName.expensesPercLabel);

        nodeListForEach(fields, function(cur, index) {
          if(percentages[index] > 0) {
            cur.textContent = percentages[index] + '%';
          } else {
            cur.textContent = '--';
          }
        });
      },

      displayMonth: function() {
        var now, month, months, year;
        
        months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

        now = new Date();

        year = now.getFullYear();
        month = now.getMonth();

        document.querySelector(DOMName.dateLabel).textContent = months[month] + ' ' + year;
      },

      changedType: function() {
        var fields = document.querySelectorAll(
          DOMName.type + ',' +
          DOMName.desc + ',' +
          DOMName.value
        );

        nodeListForEach(fields, function(cur) {
          cur.classList.toggle('red-focus');
        });

        document.querySelector(DOMName.btn).classList.toggle('red');
      },

      getDOMName: function() {
        return DOMName;
      }
    };

  })();


  //GLOBAL APP CONTROLLER
  var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {

      var DOM = UICtrl.getDOMName();

      document.querySelector(DOM.btn).addEventListener('click', ctrlAddItem);

      document.addEventListener('keypress', enterKeypress);

      document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
      document.querySelector(DOM.type).addEventListener('change', UICtrl.changedType);

    }

    var updateBudget = function() {
      // 1. Calculate the budget
      budgetCtrl.calculateBudget();

      // 2. Return the budget
      var budget = budgetCtrl.getBudget();

      // 3. Display the budget to UI
      UICtrl.displayBudget(budget);
    }

    var updatePercentages = function() {
      // 1. Calculate percentages
      budgetCtrl.calculatePercentages();

      // 2. Read percentages from budget controller
      var percentages = budgetCtrl.getPercentages();

      // 3. Update the UI
      UICtrl.displayPercentage(percentages);
    }

    var ctrlAddItem = function() {
      // document.removeEventListener('keypress', enterKeypress);
      var input, newItem, newHtml;

      // 1. Get the field input data
      input = UICtrl.getInput();

      if(input.description !== '' && !isNaN(input.value) && input.value > 0) {
        // 2. Add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        // 3. Add the item to UI
        UICtrl.addListItem(newItem, input.type);

        // 4. Clear field
        UICtrl.clearFields();

        // 5. Calculate and update budget
        updateBudget();

        // 6. Update and calculate new percentage
        updatePercentages();
      }

    }

    var enterKeypress = function(event) {
      if(event.keyCode === 13 || event.whitch === 13) {
        ctrlAddItem();
      }
    }

    var ctrlDeleteItem = function(event) {
      var itemId, splitId, type, id;

      itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

      if(itemId) {
        splitId = itemId.split('-');

        type = splitId[0];
        id = parseInt(splitId[1]);

        // 1. Delete the item for data
        budgetCtrl.deleteItem(type, id);

        // 2. Delete the item for UI
        UICtrl.deleteListItem(itemId);

        // 3. Update and show the new budget
        updateBudget();

        // 4. Update and calculate new percentage
        updatePercentages();

      }
    }

    return {
      init: function() {
        // console.log('init app');
        UICtrl.displayMonth();
        UICtrl.displayBudget({
          budget: 0,
          totalInc: 0,
          totalExp: 0,
          persentage: -1
        });
        setupEventListeners();
      }
    };

  })(budgetyController, UIController);

  controller.init();

});