  // BUDGET CONTROLLER
  var budgetController = (function() {

    var Income = function(id, description, amount) {
      this.id = id;
      this.description = description;
      this.amount = amount;
    }

    var Expense = function(id, description, amount) {
      this.id = id;
      this.description = description;
      this.amount = amount;
      this.percentage = -1;
    }

    Expense.prototype.calculatePercentage = function(totalIncome) {
      if(totalIncome > 0){
        this.percentage = Math.round((this.amount/totalIncome) * 100);
      }else{
        this.percentage = -1;
      }

    }

    Expense.prototype.getPercentages = function() {
      return this.percentage;
    }



    function calcTotal(type) {
     var sum = 0;
     data.allItems[type].forEach(function(current) {
       sum += current.amount;
     });
     data.totals[type] = sum;
   }

    //DATA STRUCTURE
    var data = {
      allItems: {
        inc: [],
        exp: []
      },
      totals: {
        inc: 0,
        exp: 0
      },
      budget: 0,
      expensePercentage: 0
    };



    return {
      addItems: function(typ, des, am) {
        var newItem, ID;

        if(data.allItems[typ].length > 0) {
          ID = data.allItems[typ][data.allItems[typ].length - 1].id + 1;
        }else {
          ID = 0;
        }
        if (typ == 'inc'){
          newItem = new Income(ID, des, am);
        }else if(typ == 'exp') {
          newItem = new Expense(ID, des, am);
        }
        data.allItems[typ].push(newItem);

        return newItem;
      },

      deleteItem: function(idd, type) {
        var mappedIDs, index;

      mappedIDs = data.allItems[type].map(function(current){
        return current.id;
      });

      index = mappedIDs.indexOf(idd);

      if(index !== -1) {
        data.allItems[type].splice(index, 1);
      }





      },

        calculateBudget: function( ){
            //1. Calculate total expense and budget.
            calcTotal('inc');
            calcTotal('exp');

            //2. Calculate budget
            data.budget = data.totals.inc - data.totals.exp;

            //3. Display expense percentage Percentage
            if(data.totals.inc !== 0) {
              data.expensePercentage = Math.round((data.totals.exp/data.totals.inc)*100);
            } else {
              data.expensePercentage = -1;
            }


        },
        calcPercentage: function() {
          data.allItems.exp.forEach(function(current){
            current.calculatePercentage(data.totals.inc);
          });


        var allPercentages =  data.allItems.exp.map(function(current) {
              return current.getPercentages();
          });

          return allPercentages;

        },

        getBudget: function() {
          return {
            // 4 things to be returned
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            budget: data.budget,
            expPercentage: data.expensePercentage

          }
        },

        testing: function() {
          console.log(data);
        }


  }
  //-----------------

  })();

  //UI CONTROLLER
  var UIController = (function() {
    var DOMstrings = {
      addType: '.add__type',
      addDesc: '.add__description',
      addAmount: '.add__amount',
      incomeColumn: '.income-column',
      expenseColumn: '.expense-column',
      budgetLabel: '.budget-amount',
      incomeLabel: '.budget__income-value',
      expenseLabel: '.budget__expense-value',
      expensePercentageLabel: '.budget__expense-percentage'
    }

    function nodeListForEach(list, callback){
      for(var i = 0; i < list.length; i++) {
        callback(list[i], i);
      }
    }

      var stringFormat = function(value, type) {
      var num, numSplit, int, sign;
      num = Math.abs(value);
      num = num.toFixed(2);
      numSplit = num.split('.');
      int = numSplit[0];

      //num = 23145.234 --> 23,145.23
      //
      if(int.length > 3) {
        int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3, int.length);
      }
      return (type === 'inc' ? sign = '+' : sign = '-') + ' ' + int + '.' + numSplit[1];

    }
    console.log(stringFormat(2345.549,'exp'));



    return {
      getInput: function() {
        return {
           type: document.querySelector(DOMstrings.addType).value,
           description: document.querySelector(DOMstrings.addDesc).value,
           amount: parseFloat(document.querySelector(DOMstrings.addAmount).value)
        }
      },
      addItemsToUI: function(obj, type) {
        var html, newHtml, element;
        if(type == 'inc'){
          element = DOMstrings.incomeColumn;
          html = `<div class="income-element" id="inc-%ID%">
                  <span class="income-description">%description%</span>
                  <span class="income-amount">%amount%</span>
                  <button class="delete__inc-button">X</button></div>`;
        }else if(type == 'exp'){
          element = DOMstrings.expenseColumn;
          html = `        <div class="expense-element" id="exp-%ID%">
                          <span class="expense-description">%description%</span>
                          <span class="expense-amount">%amount%</span>
                          <span class="expense-perc">%perc%</span>
                          <button class="delete__exp-button">X</button></div>`;

        }


            newHtml = html.replace('%description%', obj.description);
            newHtml = newHtml.replace('%amount%', stringFormat(obj.amount, type));
            newHtml = newHtml.replace('%ID%', obj.id);
            console.log(type);

             document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

      },

      deleteItemsFromUI: function(selectorID) {
        var element = document.getElementById(selectorID);
        element.parentNode.removeChild(element);

      },
      clearFields: function() {
        var fieldsArr, newArr;
        // 1. create list for fields
        fieldsArr = document.querySelectorAll(DOMstrings.addDesc + ", " + DOMstrings.addAmount);
        // 2. convert it into an array
        newArr = Array.prototype.slice.call(fieldsArr);
        // 3. iterate it and set the value to ""
        newArr.forEach(function(current, index, value) {
          current.value = "";
        });
        // Setting the focus to first field
        newArr[0].focus();

      },
      // Function for displaying budget on UI
      displayBudget: function(obj) {
        var type;
        if(obj.budget > 0){
          type = 'inc';
        }else {
          type = 'exp';
        }
        document.querySelector(DOMstrings.budgetLabel).textContent = stringFormat(obj.budget, type);
        document.querySelector(DOMstrings.incomeLabel).textContent = stringFormat(obj.totalInc, 'inc');
        document.querySelector(DOMstrings.expenseLabel).textContent = stringFormat(obj.totalExp, 'exp');
        if(obj.expPercentage > 0) {
          document.querySelector(DOMstrings.expensePercentageLabel).textContent = obj.expPercentage + "%";
        }else {
          document.querySelector(DOMstrings.expensePercentageLabel).textContent = '---';

        }

      },

      displayDate: function() {
        var date, allMonths, year;
        date = new Date();
        //ALL MONTHS Array
        allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
                    'September', 'October', 'November', 'December'];
        month = allMonths[date.getMonth()];
        year = date.getFullYear();
        console.log(month + ',' + year);

        //Displaying on UI
      document.querySelector('#budget-month').textContent = month + ', ' + year;
      },

      changeType: function() {
        document.querySelector('.add__type').classList.toggle('red')
        var fields = document.querySelectorAll('.add__amount' +
                                  ',' + '.add__description');
        nodeListForEach(fields, function(cur){
          cur.classList.toggle('red-focus');

        });
        document.querySelector('.add__button').classList.toggle('red');
      },


      displayPercentages: function(percentages) {
        var fields = document.querySelectorAll('.expense-perc');

      nodeListForEach(fields, function(current, index){
        if(percentages[index] > 0){
          current.textContent = percentages[index] + '%'
        }else{
          current.textContent = '---';
        }

      });
    }
}
  })();
  //-----------------

  //CONTROLLER
  var controller = (function(budgetctrl, UIctrl){


  function ctrlAddItem() {
    var input = UIctrl.getInput();
    console.log(input);

      //console.log(newItem);

   if(input.description !== "" && input.amount > 0 && !isNaN(input.amount) ) {
    var newItem = budgetctrl.addItems(input.type, input.description, input.amount);

    UIctrl.addItemsToUI(newItem, input.type);
    //CLEARING THE fields
    UIctrl.clearFields();

    budgetctrl.calculateBudget();

    var budget =  budgetctrl.getBudget();
    console.log(budget);
    console.log(newItem);


    UIctrl.displayBudget(budget);

    var percs = budgetctrl.calcPercentage();

    console.log(budgetctrl.calcPercentage());

    UIctrl.displayPercentages(percs);


  }
  }


  //delete item function
  function ctrlDeleteItem(event){
    //Event is passed to set its target
    var nodeID, splitID, delItemID, delItemType;

    nodeID = event.target.parentNode.id;
    splitID = nodeID.split('-');
    delItemType = splitID[0];
    delItemID = parseFloat(splitID[1]);

    console.log("split id = " + delItemID);
    console.log("split type = " + delItemType);

    budgetctrl.deleteItem(delItemID, delItemType);

    UIctrl.deleteItemsFromUI(nodeID);

    budgetctrl.calculateBudget();

    //UIcrtl.displayPercentages();
  }
    //budgetctrl.addItems(input.type, input.description, input.amount);
    // Action Events
    function setButtonListers(){
      var btn = document.querySelector('.add__button');

        btn.addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(e) {
          if (e.keyCode == 13 || e.which == 13) {
            ctrlAddItem();



          }
        });

        document.querySelector('.budget__display').addEventListener('click', ctrlDeleteItem);

        //changeType
        document.querySelector('.add__type').addEventListener('change', UIctrl.changeType);
    }









    return {
      init: function() {
          //1. Set up event event listeners
          setButtonListers();
          //2. initialize values to zero
          UIctrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            expPercentage: 0
          });
          //3. Display date
          UIctrl.displayDate();
        }
      }




  }
  ) (budgetController, UIController);
  //-----------------

  controller.init();

  // Tasks to do:
  // 1. delete item from the controller. check
  // 2. delete item from UI. check
  // 3. adjust the string format. check
  // 4. Percentages. check
  // 5. apply date and month in the heading. check
